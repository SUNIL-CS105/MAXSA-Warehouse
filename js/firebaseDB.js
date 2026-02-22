// firebaseDB.js

window.__warehouseLoaded = false;
window.palletsRef = window.database.ref("warehouse/pallets");

// SAFE: Only updates the specific pallet that moved or was added
window.upsertPalletToDB = function upsertPalletToDB(pallet) {
  if (!pallet || !pallet.id) return;
  return window.palletsRef.child(pallet.id).set({
    itemId: pallet.itemId,
    quantity: pallet.quantity,
    location: pallet.location
  });
};

// SAFE: Removes only the specific pallet from DB
window.deletePalletFromDB = function deletePalletFromDB(palletId) {
  if (!palletId) return;
  return window.palletsRef.child(palletId).remove();
};

window.loadWarehouseData = function loadWarehouseData() {
  const loading = document.getElementById("loading-indicator");
  if (loading) loading.style.display = "flex";

  // Use .once for initial load to prevent feedback loops
  window.palletsRef.once("value", (snapshot) => {
    const data = snapshot.val();
    
    // Clear old pallets from DOM
    window.pallets.forEach(p => p.remove());
    window.pallets = [];
    window.palletsByLocation = {};

    if (data) {
      Object.entries(data).forEach(([id, palletData]) => {
        const pallet = new window.Pallet(id, palletData.itemId, palletData.quantity, palletData.location);

        document.querySelector(".grid-stack").appendChild(pallet.el);
        window.pallets.push(pallet);

        if (!window.palletsByLocation[pallet.location]) window.palletsByLocation[pallet.location] = [];
        window.palletsByLocation[pallet.location].push(pallet);
      });

      Object.keys(window.palletsByLocation).forEach(loc => window.adjustPalletSizesAtLocation(loc));
    }

    window.updateInventorySummary();
    window.__warehouseLoaded = true;
    if (loading) loading.style.display = "none";
  });
};

// --- History ---
window.recordHistory = function recordHistory(type, itemId, quantity) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const historyRef = window.database.ref(`users/${user.uid}/history`).push();
  historyRef.set({
    type,
    itemId,
    quantity,
    timestamp: Date.now()
  });
};

window.showHistory = function showHistory(type) {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const modalTitle = document.getElementById('history-modal-title');
  const historyOutput = document.getElementById('history-output');
  historyOutput.innerHTML = 'Loading...';

  const historyRef = window.database.ref(`users/${user.uid}/history`).orderByChild('timestamp');
  historyRef.on('value', (snapshot) => {
    const data = snapshot.val();
    historyOutput.innerHTML = '';

    if (!data) {
      historyOutput.innerHTML = 'No history found.';
      document.getElementById('history-modal').style.display = 'block';
      return;
    }

    const entries = Object.values(data)
      .filter(entry => {
        if (type === 'new-product') return entry.type === 'new-product';
        if (type === 'shipped') return entry.type === 'SHIPPED';
        if (type === 'to-office') return entry.type === 'TO-8412-OFFICE';
        return false;
      })
      .reverse();

    modalTitle.innerText = `${type.replace(/-/g, ' ').toUpperCase()} History`;

    if (entries.length > 0) {
      entries.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        historyOutput.innerHTML += `<b>${date}</b>: ${entry.itemId} (Q: ${entry.quantity})<br>`;
      });
    } else {
      historyOutput.innerHTML = 'No history for this category.';
    }

    document.getElementById('history-modal').style.display = 'block';
  });
};
