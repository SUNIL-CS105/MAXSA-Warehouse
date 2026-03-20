window.eventsBound = false;

window.setupEventListeners = function setupEventListeners() {
  if (window.eventsBound) return;
  window.eventsBound = true;

  // Add new product
  document.getElementById('add-product-btn').addEventListener('click', () => {
    if (!window.editMode) {
      alert("Edit mode is OFF. Turn it ON to add products.");
      return;
    }

    const itemId = document.getElementById('new-item').value.trim();
    const q = parseInt(document.getElementById('new-q').value, 10);

    if (!itemId || isNaN(q) || q < 1) {
      alert("Enter valid Item ID and Quantity.");
      return;
    }

    window.createNewPallet(itemId, q, 'New_#');

    document.getElementById('new-item').value = '';
    document.getElementById('new-q').value = '';
  });

  // Edit mode toggle
  document.getElementById('edit-mode-btn').addEventListener('click', () => {
    window.editMode = !window.editMode;
    window.applyEditModeUI();
  });

  // Inventory summary open
  document.getElementById('inventory-summary-btn').addEventListener('click', () => {
    window.showInventorySummaryModal();
  });

  // History open
  document.getElementById('history-btn').addEventListener('click', () => {
    window.showHistory();
  });

  // Excel export
  document.getElementById('excel-export-btn').addEventListener('click', () => {
    window.downloadInventoryExcel();
  });

  // History modal close
  document.querySelector('#history-modal .close-btn').addEventListener('click', () => {
    document.getElementById('history-modal').style.display = 'none';
  });

  // Inventory summary modal close
  document.querySelector('#inventory-summary-modal .close-btn').addEventListener('click', () => {
    document.getElementById('inventory-summary-modal').style.display = 'none';
  });

  // Click outside modals
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

  // Resize scaling
  window.addEventListener('resize', window.scaleGrid);
};
