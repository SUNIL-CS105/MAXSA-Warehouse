window.setupEventListeners = function setupEventListeners() {
  document.getElementById('add-product-btn').addEventListener('click', () => {
    if (!window.isEditMode) {
      alert("Edit Mode is OFF. Turn on Edit Mode to make changes.");
      return;
    }
    const itemId = document.getElementById('new-item').value.trim();
    const q = parseInt(document.getElementById('new-q').value, 10);
    if (!itemId || isNaN(q) || q < 1) {
      alert("Enter valid Item ID and Quantity");
      return;
    }
    window.createNewPallet(itemId, q, 'New_#');
    document.getElementById('new-item').value = '';
    document.getElementById('new-q').value = '';
  });

  document.getElementById('inventory-summary-panel').addEventListener('click', () => {
    window.updateInventorySummary();
    const output = document.getElementById('inventory-summary-output');
    output.style.display = output.style.display === 'none' ? 'block' : 'none';
  });

  const editBtn = document.getElementById("edit-mode-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => window.setEditMode(!window.isEditMode));
  }

  const excelBtn = document.getElementById("excel-export-btn");
  if (excelBtn) {
    excelBtn.addEventListener("click", () => window.exportInventoryCSV());
  }

  document.querySelectorAll('.history-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => window.showHistory(btn.dataset.type));
  });

  document.querySelector('#history-modal .close-btn').addEventListener('click', () => {
    document.getElementById('history-modal').style.display = 'none';
  });

  window.addEventListener('resize', window.scaleGrid);
};
