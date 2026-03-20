window.warehouseRef = null;

window.saveWarehouseData = function saveWarehouseData() {
  const data = {};

  window.pallets.forEach(p => {
    if (p.location !== 'SHIPPED' && p.location !== 'TO-8412-OFFICE') {
      data[p.id] = {
        itemId: p.itemId,
        quantity: p.quantity,
        location: p.location
      };
    }
  });

  window.database.ref('warehouse/pallets').set(data);
};

window.loadWarehouseData = function loadWarehouseData() {
  const loading = document.getElementById('loading-indicator');
  if (loading) loading.style.display = 'flex';

  if (window.warehouseRef) {
    window.warehouseRef.off();
  }

  window.warehouseRef = window.database.ref('warehouse/pallets');

  window.warehouseRef.on('value', (snapshot) => {
    const data = snapshot.val();

    window.pallets.forEach(p => p.remove());
    window.pallets = [];
    window.palletsByLocation = {};

    if (data) {
      Object.entries(data).forEach(([palletId, palletData]) => {
        window.createNewPallet(
          palletData.itemId,
          palletData.quantity,
          palletData.location,
          false,
          palletId
        );
      });
    }

    window.updateInventorySummary();
    window.applyEditModeUI();

    if (loading) loading.style.display = 'none';
  });
};

window.recordHistory = function recordHistory({
  action,
  itemId,
  quantity,
  fromLocation,
  toLocation
}) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const email = user.email || 'unknown';
  const accountName = email.split('@')[0];

  const historyRef = window.database.ref('warehouse/history').push();

  historyRef.set({
    uid: user.uid,
    email,
    accountName,
    action: action || 'move',
    itemId: itemId || '',
    quantity: quantity || 0,
    fromLocation: fromLocation || '',
    toLocation: toLocation || '',
    timestamp: Date.now()
  });
};

window.purgeOldHistory = function purgeOldHistory() {
  const cutoff = Date.now() - (60 * 24 * 60 * 60 * 1000);

  return window.database.ref('warehouse/history').once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const removals = [];
    Object.entries(data).forEach(([key, entry]) => {
      if ((entry.timestamp || 0) < cutoff) {
        removals.push(window.database.ref(`warehouse/history/${key}`).remove());
      }
    });

    return Promise.all(removals);
  });
};

window.showHistory = function showHistory() {
  const modalTitle = document.getElementById('history-modal-title');
  const historyOutput = document.getElementById('history-output');
  const modal = document.getElementById('history-modal');

  modalTitle.innerText = 'Warehouse Movement History';
  historyOutput.innerHTML = 'Loading...';
  modal.style.display = 'block';

  window.purgeOldHistory()
    .then(() => window.database.ref('warehouse/history').orderByChild('timestamp').once('value'))
    .then(snapshot => {
      const data = snapshot.val();

      if (!data) {
        historyOutput.innerHTML = 'No history found.';
        return;
      }

      const entries = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

      if (!entries.length) {
        historyOutput.innerHTML = 'No history found.';
        return;
      }

      let html = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Product ID</th>
              <th>Initial Location</th>
              <th>Final Location</th>
              <th>Quantity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
      `;

      entries.forEach(entry => {
        html += `
          <tr>
            <td>${entry.accountName || '-'}</td>
            <td>${entry.itemId || '-'}</td>
            <td>${entry.fromLocation || '-'}</td>
            <td>${entry.toLocation || '-'}</td>
            <td>${entry.quantity || 0}</td>
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      historyOutput.innerHTML = html;
    })
    .catch(error => {
      historyOutput.innerHTML = `Error loading history: ${error.message}`;
    });
};
