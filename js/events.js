window.eventsBound = false;

window.setupEventListeners = function setupEventListeners() {
  if (window.eventsBound) return;
  window.eventsBound = true;

  document.getElementById('add-product-btn').addEventListener('click', () => {
    if (!window.editMode) {
      alert("Edit mode is OFF. Turn it ON to add products.");
      return;
    }

    const itemId = document.getElementById('new-item').value.trim();
    const q = parseFloat(document.getElementById('new-q').value);

    if (!itemId || !window.isValidQuantity(q)) {
      alert("Enter valid Item ID and Quantity.");
      return;
    }

    window.createNewPallet(itemId, q, 'New_#');

    document.getElementById('new-item').value = '';
    document.getElementById('new-q').value = '';
  });

  document.getElementById('edit-mode-btn').addEventListener('click', () => {
    window.editMode = !window.editMode;
    window.applyEditModeUI();
  });

  document.getElementById('inventory-summary-btn').addEventListener('click', () => {
    window.showInventorySummaryModal();
  });

  document.getElementById('history-btn').addEventListener('click', () => {
    window.showHistory();
  });

  document.getElementById('excel-export-btn').addEventListener('click', () => {
    window.downloadInventoryExcel();
  });

  document.getElementById('undo-btn').addEventListener('click', () => {
    window.undoLastAction();
  });

  document.querySelector('#history-modal .close-btn').addEventListener('click', () => {
    document.getElementById('history-modal').style.display = 'none';
  });

  document.querySelector('#inventory-summary-modal .close-btn').addEventListener('click', () => {
    document.getElementById('inventory-summary-modal').style.display = 'none';
  });

  window.addEventListener('click', e => {
    const historyModal = document.getElementById('history-modal');
    const summaryModal = document.getElementById('inventory-summary-modal');

    if (e.target === historyModal) {
      historyModal.style.display = 'none';
    }

    if (e.target === summaryModal) {
      summaryModal.style.display = 'none';
    }
  });

  window.addEventListener('resize', window.scaleGrid);
};
