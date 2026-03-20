window.warehouseRef = null;
window.historyRef = null;

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

    // clear old pallets from DOM
    window.pallets.forEach(p => p.remove());
    window.pallets = [];
    window.palletsByLocation = {};

    if (data) {
      Object.values(data).forEach(palletData => {
        window.createNewPallet(
          palletData.itemId,
          palletData.quantity,
          palletData.location,
          false
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

window.showHistory = function showHistory() {
  const modalTitle = document.getElementById('history-modal-title');
  const historyOutput = document.getElementById('history-output');
  const modal = document.getElementById('history-modal');

  modalTitle.innerText = 'Warehouse Movement History';
  historyOutput.innerHTML = 'Loading...';
  modal.style.display = 'block';

  window.database.ref('warehouse/history').orderByChild('timestamp').once('value')
    .then(snapshot => {
      const data = snapshot.val();

      if (!data) {
        historyOutput.innerHTML = 'No history found.';
        return;
      }

      const entries = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

      const grouped = {};
      entries.forEach(entry => {
        const account = entry.accountName || 'unknown';
        if (!grouped[account]) grouped[account] = [];
        grouped[account].push(entry);
      });

      historyOutput.innerHTML = '';

      Object.keys(grouped).sort().forEach(account => {
        const block = document.createElement('div');
        block.className = 'history-account-block';

        const title = document.createElement('div');
        title.className = 'history-account-title';
        title.textContent = `Account: ${account}`;
        block.appendChild(title);

        grouped[account].forEach(entry => {
          const row = document.createElement('div');
          row.className = 'history-entry';

          const date = new Date(entry.timestamp).toLocaleString();
          row.innerHTML = `
            <div><b>${date}</b></div>
            <div>Product ID: <b>${entry.itemId}</b></div>
            <div>Quantity: <b>${entry.quantity}</b></div>
            <div>Initial Location: <b>${entry.fromLocation || '-'}</b></div>
            <div>Final Location: <b>${entry.toLocation || '-'}</b></div>
          `;
          block.appendChild(row);
        });

        historyOutput.appendChild(block);
      });
    })
    .catch(error => {
      historyOutput.innerHTML = `Error loading history: ${error.message}`;
    });
};
