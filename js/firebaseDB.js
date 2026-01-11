// --- Firebase Read/Write Functions ---
function loadWarehouseData() {
  const ref = database.ref('warehouse/pallets');
  ref.on('value', snapshot => {
    const data = snapshot.val();
    pallets.forEach(p => p.remove());
    pallets = [];
    palletsByLocation = {};
    if(data) {
      Object.values(data).forEach(palletData => {
        createNewPallet(palletData.itemId, palletData.quantity, palletData.location, false);
      });
    }
    updateInventorySummary();
  });
}

function saveWarehouseData() {
  const data = {};
  pallets.forEach(p => {
    data[p.id] = { itemId: p.itemId, quantity: p.quantity, location: p.location };
  });
  database.ref('warehouse/pallets').set(data);
}

function recordHistory(type, itemId, quantity) {
  const user = firebase.auth().currentUser;
  if(!user) return;
  const historyRef = database.ref(`users/${user.uid}/history`).push();
  historyRef.set({ type, itemId, quantity, timestamp: Date.now() });
}

function showHistory(type) {
  const user = firebase.auth().currentUser;
  if(!user) return;
  const modalTitle = document.getElementById('history-modal-title');
  const historyOutput = document.getElementById('history-output');
  historyOutput.innerHTML = 'Loading...';
  const historyRef = database.ref(`users/${user.uid}/history`).orderByChild('timestamp');
  historyRef.on('value', snapshot => {
    const data = snapshot.val();
    historyOutput.innerHTML = '';
    if(!data) { historyOutput.innerHTML = 'No history found.'; return; }
    let entries = Object.values(data).filter(entry => {
      if(type==='new-product') return entry.type==='new-product';
      if(type==='shipped') return entry.type==='SHIPPED';
      if(type==='to-office') return entry.type==='TO-8412-OFFICE';
      return false;
    }).reverse();
    modalTitle.innerText = `${type.replace(/-/g,' ').toUpperCase()} History`;
    if(entries.length>0){
      entries.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        historyOutput.innerHTML += `<b>${date}</b>: ${entry.itemId} (Q: ${entry.quantity})<br>`;
      });
    } else {
      historyOutput.innerHTML = `No history for this category.`;
    }
    document.getElementById('history-modal').style.display = 'block';
  });
}
