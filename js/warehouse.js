window.CELL_WIDTH = 85;
window.CELL_HEIGHT = 52;

window.GRID_LEFT = 60;
window.HEADER_TOP = 0;
window.HEADER_HEIGHT = 72;
window.GRID_TOP = 110;

window.pallets = [];
window.palletsByLocation = {};
window.scale = 1.0;
window.isDraggingPallet = false;
window.editMode = false;
window.warehouseAppInitialized = false;
window.undoStack = [];
window.isUndoing = false;

window.locations = {
  gridLabels: {
    rows: ['X','W','V','U','T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'],
    cols: 11
  },
  offices: {
    count: 30,
    startLeft: 980,
    startTop: 0,
    cols: 6,
    cellWidth: 85,
    cellHeight: 50
  },
  restroomsShelvesTemp: [
    { name: 'Restroom1', left: 980, top: 300 },
    { name: 'Restroom2', left: 1060, top: 300 },
    { name: 'Shelf1', left: 1220, top: 300 },
    { name: 'Shelf2', left: 1300, top: 300 },
    { name: 'Shelf3', left: 1380, top: 300 },
    { name: 'Shelf4', left: 1220, top: 350 },
    { name: 'Shelf5', left: 1300, top: 350 },
    { name: 'Shelf6', left: 1380, top: 350 },
    { name: 'New_#', left: 990, top: 500, color: '#FFFFFF' },
    { name: 'Temporary1', left: 980, top: 850 },
    { name: 'Temporary2', left: 980, top: 900 },
    { name: 'Temporary3', left: 980, top: 950 },
    { name: 'Temporary4', left: 980, top: 1000 },
    { name: 'Temporary5', left: 980, top: 1050 },
    { name: 'Temporary6', left: 980, top: 1100 },
    { name: 'Temporary7', left: 980, top: 1150 },
    { name: 'Temporary8', left: 1070, top: 850 },
    { name: 'Temporary9', left: 1070, top: 900 },
    { name: 'Temporary10', left: 1070, top: 950 },
    { name: 'Temporary11', left: 1070, top: 1000 },
    { name: 'Temporary12', left: 1070, top: 1050 },
    { name: 'Temporary13', left: 1070, top: 1100 },
    { name: 'Temporary14', left: 1070, top: 1150 }
  ],
  dropZones: [
    { id: "SHIPPED", name: "SHIPPED", left: 1420, top: 1100, width: 160, height: 80, color: '#e74c3c' },
    { id: "TO-8412-OFFICE", name: "TO-8412-OFFICE", left: 1420, top: 950, width: 160, height: 80, color: '#2980b9' }
  ]
};

window.createGridLabels = function createGridLabels() {
  const container = document.querySelector('.grid-stack');
  container.innerHTML = '';

  const rows = window.locations.gridLabels.rows;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 1; c <= window.locations.gridLabels.cols; c++) {
      const div = document.createElement('div');
      div.className = 'label-cell';
      div.style.left = `${c * window.CELL_WIDTH}px`;
      div.style.top = `${r * window.CELL_HEIGHT}px`;
      div.style.width = `${window.CELL_WIDTH}px`;
      div.style.height = `${window.CELL_HEIGHT}px`;
      div.innerText = `${rows[r]}${c}`;
      div.dataset.location = `${rows[r]}${c}`;
      container.appendChild(div);
    }
  }

  const off = window.locations.offices;
  for (let i = 1; i <= off.count; i++) {
    const col = i % off.cols;
    const row = Math.floor((i - 1) / off.cols);

    const div = document.createElement('div');
    div.className = 'label-cell office-zone';
    div.style.left = `${off.startLeft + col * off.cellWidth}px`;
    div.style.top = `${off.startTop + row * off.cellHeight}px`;
    div.style.width = `${off.cellWidth}px`;
    div.style.height = `${off.cellHeight}px`;
    div.innerText = `Office${i}`;
    div.dataset.location = `Office${i}`;
    container.appendChild(div);
  }

  window.locations.restroomsShelvesTemp.forEach(item => {
    const div = document.createElement('div');
    div.className = 'label-cell restroom-zone';
    div.style.left = `${item.left}px`;
    div.style.top = `${item.top}px`;
    div.style.width = `${item.width || window.CELL_WIDTH}px`;
    div.style.height = `${item.height || window.CELL_HEIGHT}px`;
    div.innerText = item.name;
    div.dataset.location = item.name;
    container.appendChild(div);
  });

  window.locations.dropZones.forEach(zone => {
    const div = document.createElement('div');
    div.className = 'label-cell drop-zone';
    div.id = zone.id;
    div.style.left = `${zone.left}px`;
    div.style.top = `${zone.top}px`;
    div.style.width = `${zone.width}px`;
    div.style.height = `${zone.height}px`;
    div.style.backgroundColor = zone.color;
    div.innerText = zone.name;
    div.dataset.location = zone.name;
    container.appendChild(div);
  });

  window.createAxisLabels();
};

window.createAxisLabels = function createAxisLabels() {
  const wrapper = document.getElementById('warehouse-container');

  wrapper.querySelectorAll('.axis-label').forEach(el => el.remove());

  const gridLeft = window.GRID_LEFT;
  const gridTop = window.GRID_TOP;

  for (let c = 1; c <= 11; c++) {
    const topLabel = document.createElement('div');
    topLabel.className = 'axis-label axis-col-top';
    topLabel.style.left = `${gridLeft + c * window.CELL_WIDTH}px`;
    topLabel.style.top = `${gridTop - 34}px`;
    topLabel.textContent = c;
    wrapper.appendChild(topLabel);

    const bottomLabel = document.createElement('div');
    bottomLabel.className = 'axis-label axis-col-bottom';
    bottomLabel.style.left = `${gridLeft + c * window.CELL_WIDTH}px`;
    bottomLabel.style.top = `${gridTop + 24 * window.CELL_HEIGHT + 6}px`;
    bottomLabel.textContent = c;
    wrapper.appendChild(bottomLabel);
  }

  const rows = window.locations.gridLabels.rows;
  for (let r = 0; r < rows.length; r++) {
    const rowLabel = document.createElement('div');
    rowLabel.className = 'axis-label axis-row-left';
    rowLabel.style.left = `${gridLeft - 46}px`;
    rowLabel.style.top = `${gridTop + r * window.CELL_HEIGHT}px`;
    rowLabel.textContent = rows[r];
    wrapper.appendChild(rowLabel);
  }
};

window.getLocationAtClientPoint = function (clientX, clientY) {
  const cells = document.querySelectorAll(".label-cell");
  for (const cell of cells) {
    const r = cell.getBoundingClientRect();
    if (
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom
    ) {
      return cell.dataset.location || null;
    }
  }
  return null;
};

window.createNewPallet = function createNewPallet(itemId, quantity, location = "New_#", record = true, forcedId = null) {
  const id = forcedId || ('pallet-' + Date.now() + '-' + Math.floor(Math.random() * 100000));
  const pallet = new window.Pallet(id, itemId, quantity, location);

  document.querySelector('.grid-stack').appendChild(pallet.el);

  window.pallets.push(pallet);

  if (!window.palletsByLocation[location]) window.palletsByLocation[location] = [];
  window.palletsByLocation[location].push(pallet);

  window.adjustPalletSizesAtLocation(location);

  if (record) {
    window.recordHistory({
      action: 'new-product',
      itemId,
      quantity,
      fromLocation: 'CREATED',
      toLocation: location
    });

    window.saveWarehouseData();
    window.updateInventorySummary();
  }

  pallet.updateText();
  return pallet;
};

window.findPalletById = function findPalletById(palletId) {
  return window.pallets.find(p => p.id === palletId) || null;
};

window.registerUndoAction = function registerUndoAction(action) {
  if (window.isUndoing) return;
  window.undoStack.push(action);
};

window.undoLastAction = function undoLastAction() {
  if (!window.undoStack.length) {
    alert("Nothing to undo.");
    return;
  }

  const action = window.undoStack.pop();
  if (!action || action.type !== 'move') return;

  window.isUndoing = true;

  try {
    let pallet = window.findPalletById(action.palletId);

    if (pallet) {
      pallet.moveToLocation(action.fromLocation, {
        recordHistory: false,
        pushUndo: false
      });
    } else {
      window.createNewPallet(
        action.itemId,
        action.quantity,
        action.fromLocation,
        false,
        action.palletId
      );
      window.saveWarehouseData();
      window.updateInventorySummary();
    }
  } finally {
    window.isUndoing = false;
  }
};

window.adjustPalletSizesAtLocation = function adjustPalletSizesAtLocation(location) {
  if (!location) return;
  const stack = window.palletsByLocation[location];
  if (!stack || stack.length === 0) return;

  stack.forEach((p, i) => {
    window.positionPalletInLocation(p);
    p.el.style.zIndex = 1000 + i;
  });
};

window.positionPalletInLocation = function positionPalletInLocation(pallet) {
  const location = pallet.location;

  const locEl = Array.from(document.querySelectorAll('.label-cell'))
    .find(el => el.dataset.location === location);

  if (!locEl) return;

  const left = parseInt(locEl.style.left, 10);
  const top = parseInt(locEl.style.top, 10);
  const width = parseInt(locEl.style.width, 10);
  const height = parseInt(locEl.style.height, 10);

  const stack = window.palletsByLocation[location] || [];
  const idx = stack.indexOf(pallet);
  const total = stack.length;

  const palletHeight = Math.min(45, height);
  const REVEAL_PX = 12;

  let offset = REVEAL_PX;

  if (total > 1) {
    const maxOffset = Math.floor((height - palletHeight) / (total - 1));
    offset = Math.max(6, Math.min(offset, maxOffset));
  }

  pallet.el.style.left = `${left}px`;
  pallet.el.style.top = `${top + idx * offset}px`;
  pallet.el.style.width = `${width}px`;
  pallet.el.style.height = `${palletHeight}px`;
};

window.getInventorySummaryData = function getInventorySummaryData() {
  const totals = {};

  window.pallets
    .filter(p => p.location !== 'SHIPPED' && p.location !== 'TO-8412-OFFICE')
    .forEach(p => {
      totals[p.itemId] = (totals[p.itemId] || 0) + p.quantity;
    });

  return Object.keys(totals)
    .sort((a, b) => a.localeCompare(b))
    .map(itemId => ({
      itemId,
      quantity: totals[itemId]
    }));
};

window.getInventoryExportData = function getInventoryExportData() {
  return window.pallets
    .filter(p => p.location !== 'SHIPPED' && p.location !== 'TO-8412-OFFICE')
    .map(p => ({
      itemId: p.itemId,
      location: p.location,
      quantity: p.quantity
    }))
    .sort((a, b) => {
      if (a.itemId !== b.itemId) return a.itemId.localeCompare(b.itemId);
      return a.location.localeCompare(b.location);
    });
};

window.updateInventorySummary = function updateInventorySummary() {
  const out = document.getElementById('inventory-summary-modal-output');
  if (!out) return;

  const rows = window.getInventorySummaryData();

  if (!rows.length) {
    out.innerHTML = 'No inventory found.';
    return;
  }

  let html = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Product ID</th>
          <th>Total Quantity</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(row => {
    html += `
      <tr>
        <td>${row.itemId}</td>
        <td>${row.quantity}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  out.innerHTML = html;
};

window.showInventorySummaryModal = function showInventorySummaryModal() {
  const modal = document.getElementById('inventory-summary-modal');
  window.updateInventorySummary();
  modal.style.display = 'block';
};

window.downloadInventoryExcel = function downloadInventoryExcel() {
  const rows = window.getInventoryExportData();

  if (!rows.length) {
    alert('No inventory data to export.');
    return;
  }

  const leftRows = [];
  const rightRows = [];

  rows.forEach((row, index) => {
    if (index % 2 === 0) {
      leftRows.push(row);
    } else {
      rightRows.push(row);
    }
  });

  const maxLen = Math.max(leftRows.length, rightRows.length);

  const csvRows = [
    ['Product ID', 'Location', 'Quantity', '|', 'Product ID', 'Location', 'Quantity']
  ];

  for (let i = 0; i < maxLen; i++) {
    const left = leftRows[i] || { itemId: '', location: '', quantity: '' };
    const right = rightRows[i] || { itemId: '', location: '', quantity: '' };

    csvRows.push([
      left.itemId,
      left.location,
      left.quantity,
      '|',
      right.itemId,
      right.location,
      right.quantity
    ]);
  }

  const csvContent = csvRows
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `MAXSA_Inventory_By_Location_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

window.applyEditModeUI = function applyEditModeUI() {
  const editBtn = document.getElementById('edit-mode-btn');
  const addPanel = document.getElementById('add-product-panel');

  if (!editBtn || !addPanel) return;

  if (window.editMode) {
    editBtn.textContent = 'Edit: ON';
    editBtn.classList.remove('off');
    addPanel.classList.remove('disabled');
  } else {
    editBtn.textContent = 'Edit: OFF';
    editBtn.classList.add('off');
    addPanel.classList.add('disabled');
  }

  window.pallets.forEach(p => p.updateText());
};

window.scaleGrid = function scaleGrid() {
  const container = document.querySelector('#warehouse-container');
  const stage = document.querySelector('#app-stage');

  if (!container || !stage) return;

  const availableWidth = stage.clientWidth - 12;
  const availableHeight = stage.clientHeight - 12;

  const originalWidth = 1950;
  const originalHeight = 1450;

  window.scale = Math.min(availableWidth / originalWidth, availableHeight / originalHeight, 1);

  container.style.transform = `scale(${window.scale})`;
  container.style.left = `${Math.max((availableWidth - originalWidth * window.scale) / 2, 4)}px`;
  container.style.top = `${Math.max((availableHeight - originalHeight * window.scale) / 2, 4)}px`;
};

window.initWarehouseApp = function initWarehouseApp() {
  if (window.warehouseAppInitialized) {
    window.scaleGrid();
    window.applyEditModeUI();
    return;
  }

  window.warehouseAppInitialized = true;

  window.createGridLabels();
  window.setupEventListeners();
  window.scaleGrid();
  window.applyEditModeUI();

  setInterval(() => {
    const user = firebase.auth().currentUser;
    if (user) {
      window.saveWarehouseData();
    }
  }, 30000);
};
