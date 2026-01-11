// --- Warehouse App Variables / Constants ---
window.CELL_WIDTH = 80;
window.CELL_HEIGHT = 50;

window.pallets = [];
window.palletsByLocation = {};
window.scale = 1.0;              // IMPORTANT: used by touch dragging math
window.isDraggingPallet = false;

// Location definitions (same as your original)
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
    cellWidth: 80,
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
    { id: "SHIPPED", name: "SHIPPED", left: 1300, top: 1100, width: 160, height: 80, color: '#e74c3c' },
    { id: "TO-8412-OFFICE", name: "TO-8412-OFFICE", left: 1300, top: 950, width: 160, height: 80, color: '#2980b9' }
  ]
};

// --- Core Warehouse Functions ---
window.createGridLabels = function createGridLabels() {
  const container = document.querySelector('.grid-stack');
  container.innerHTML = '';

  // Main grid
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

  // Offices
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

  // Restrooms / shelves / temp
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

  // Drop zones
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
};

window.findLocationUnder = function findLocationUnder(x, y) {
  const cell = document.elementFromPoint(x, y);
  if (!cell) return null;

  if (cell.classList.contains("label-cell")) {
    return cell.dataset.location;
  }
  const parent = cell.closest(".label-cell");
  return parent ? parent.dataset.location : null;
};

window.createNewPallet = function createNewPallet(itemId, quantity, location = "New_#", record = true) {
  const id = 'pallet-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const pallet = new window.Pallet(id, itemId, quantity, location);

  document.querySelector('.grid-stack').appendChild(pallet.el);
  window.pallets.push(pallet);

  if (!window.palletsByLocation[location]) window.palletsByLocation[location] = [];
  window.palletsByLocation[location].push(pallet);

  window.positionPalletInLocation(pallet);
  window.adjustPalletSizesAtLocation(location);

  if (record) {
    window.recordHistory('new-product', itemId, quantity);
    window.saveWarehouseData();
  }
  return pallet;
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

  const palletWidth = width;
  const palletHeight = total > 0 ? Math.floor(height / total) : height;

  pallet.el.style.left = left + 'px';
  pallet.el.style.top = (top + palletHeight * idx) + 'px';
  pallet.el.style.width = palletWidth + 'px';
  pallet.el.style.height = palletHeight + 'px';
};

window.adjustPalletSizesAtLocation = function adjustPalletSizesAtLocation(location) {
  if (!location) return;
  const stack = window.palletsByLocation[location];
  if (!stack) return;
  stack.forEach(p => window.positionPalletInLocation(p));
};

window.updateInventorySummary = function updateInventorySummary() {
  const summary = {};
  window.pallets.forEach(p => {
    if (p.location !== 'SHIPPED' && p.location !== 'TO-8412-OFFICE') {
      summary[p.itemId] = (summary[p.itemId] || 0) + p.quantity;
    }
  });

  const out = document.getElementById('inventory-summary-output');
  out.innerHTML = '';
  for (const key in summary) {
    out.innerHTML += `<b>${key}</b>: ${summary[key]}<br>`;
  }
};

window.scaleGrid = function scaleGrid() {
  const container = document.querySelector('#warehouse-container');

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const originalWidth = 1730;
  const originalHeight = 1350;

  // IMPORTANT: update the GLOBAL scale (do not shadow it)
  window.scale = Math.min(screenWidth / originalWidth, screenHeight / originalHeight, 1);

  container.style.transform = `scale(${window.scale})`;
  container.style.left = `${(screenWidth - originalWidth * window.scale) / 2}px`;
  container.style.top = `${(screenHeight - originalHeight * window.scale) / 2}px`;
};

window.initWarehouseApp = function initWarehouseApp() {
  window.createGridLabels();
  window.setupEventListeners();
  window.scaleGrid();

  // periodic backup save (same behavior as original)
  setInterval(() => {
    const user = firebase.auth().currentUser;
    if (user) window.saveWarehouseData();
  }, 30000);
};
