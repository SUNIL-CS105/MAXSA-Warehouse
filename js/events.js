window.setupEventListeners = function setupEventListeners() {
  // Add new product
  document.getElementById('add-product-btn').addEventListener('click', () => {
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

  // Inventory summary toggle
  document.getElementById('inventory-summary-panel').addEventListener('click', () => {
    window.updateInventorySummary();
    const output = document.getElementById('inventory-summary-output');
    output.style.display = output.style.display === 'none' ? 'block' : 'none';
  });

  // History buttons
  document.querySelectorAll('.history-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      window.showHistory(type);
    });
  });

  // Modal close
  document.querySelector('#history-modal .close-btn').addEventListener('click', () => {
    document.getElementById('history-modal').style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === document.getElementById('history-modal')) {
      document.getElementById('history-modal').style.display = 'none';
    }
  });

  // Resize scaling
  window.addEventListener('resize', window.scaleGrid);
};
