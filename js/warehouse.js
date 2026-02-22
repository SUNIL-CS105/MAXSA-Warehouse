// ===============================
// warehouse.js (FINAL VERSION)
// ===============================

window.CELL_WIDTH = 80;
window.CELL_HEIGHT = 50;

window.pallets = [];
window.palletsByLocation = {};
window.scale = 1.0;
window.isDraggingPallet = false;
window.isEditMode = false;

window.setEditMode = function setEditMode(enabled) {
  window.isEditMode = !!enabled;
  const btn = document.getElementById("edit-mode-btn");
  const addBtn = document.getElementById("add-product-btn");
  if (btn) {
    btn.textContent = window.isEditMode ? "✏️ Edit Mode: ON" : "✏️ Edit Mode: OFF";
    btn.classList.toggle("off", !window.isEditMode);
  }
  if (addBtn) addBtn.disabled = !window.isEditMode;
};

window.exportInventoryCSV = function exportInventoryCSV() {
  const rows = [["Location", "Product ID", "Quantity"]];
  const entries = window.pallets
    .filter(p => p.location !== "SHIPPED" && p.location !== "TO-8412-OFFICE")
    .map(p => ({ location: p.location, itemId: p.itemId, quantity: p.quantity }));
  entries.sort((a, b) => a.location.localeCompare(b.location) || a.itemId.localeCompare(b.itemId));
  entries.forEach(e => rows.push([e.location, e.itemId, String(e.quantity)]));
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `Warehouse_Inventory_${Date.now()}.csv`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
};

window.locations = {
  gridLabels: { rows: ['X','W','V','U','T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'], cols: 11 },
  offices: { count: 30, startLeft: 980, startTop: 0, cols: 6, cellWidth: 80, cellHeight: 50 },
  restroomsShelvesTemp: [
    { name: 'Restroom1', left: 980, top: 300 }, { name: 'Restroom2', left: 1060, top: 300 },
    { name: 'Shelf1', left: 1220, top: 300 }, { name: 'Shelf2', left: 1300, top: 300 },
    { name: 'Shelf3', left: 1380, top: 300 }, { name: 'Shelf4', left: 1220, top: 350 },
    { name: 'Shelf5', left: 1300, top: 350 }, { name: 'Shelf6', left: 1380, top: 350 },
    { name: 'New_#', left: 990, top: 500 }, { name: 'Temporary1', left: 980, top: 850 },
    { name: 'Temporary2', left: 980, top: 900 }, { name: 'Temporary3', left: 980, top: 950 },
    { name: 'Temporary4', left: 980, top: 1000 }, { name: 'Temporary5', left: 980, top: 1050 },
    { name: 'Temporary6', left: 980, top: 1100 }, { name: 'Temporary7', left: 980, top: 1150 },
    { name: 'Temporary8', left: 1070, top: 850 }, { name: 'Temporary9', left: 1070, top: 900 },
    { name: 'Temporary10', left: 1070, top: 950 }, { name: 'Temporary11', left: 1070, top: 1000 },
    { name: 'Temporary12', left: 1070, top: 1050 }, { name: 'Temporary13', left: 1070, top: 1100 },
    { name: 'Temporary14', left: 1070, top: 1150 }
  ],
  dropZones: [
    { id: "SHIPPED", name: "SHIPPED", left: 1300, top: 1100, width: 160, height: 80, color: '#e74c3c' },
    { id: "TO-8412-OFFICE", name: "TO-8412-OFFICE", left: 1300, top: 950, width: 160, height: 80, color: '#2980b9' }
  ]
};

window.createGridLabels = function createGridLabels() {
  const container = document.querySelector('.grid-stack');
  container.innerHTML = '';
  const rows = window.locations.gridLabels.rows;
  const cols = window.locations.gridLabels.cols;
  const W = window.CELL_WIDTH;
  const H = window.CELL_HEIGHT;

  // --- MAIN GRID COORDINATES (1-11 TOP/BOTTOM, X-A LEFT) ---
  for (let c = 1; c <= cols; c++) {
    const topNum = document.createElement('div');
    topNum.className = 'coordinate-label';
    topNum.style.left = `${c * W}px`; topNum.style.top = `-${H}px`;
    topNum.style.width = `${W}px`; topNum.style.height = `${H}px`;
    topNum.innerText = c; container.appendChild(topNum);

    const botNum = document.createElement('div');
    botNum.className = 'coordinate-label';
    botNum.style.left = `${c * W}px`; botNum.style.top = `${rows.length * H}px`;
    botNum.style.width = `${W}px`; botNum.style.height = `${H}px`;
    botNum.innerText = c; container.appendChild(botNum);
  }
  for (let r = 0; r < rows.length; r++) {
    const leftLet = document.createElement('div');
    leftLet.className = 'coordinate-label';
    leftLet.style.left = `0px`; leftLet.style.top = `${r * H}px`;
    leftLet.style.width = `${W}px`; leftLet.style.height = `${H}px`;
    leftLet.innerText = rows[r]; container.appendChild(leftLet);
  }

  // --- MAIN GRID CELLS ---
  for (let r = 0; r < rows.length; r++) {
    for (let c = 1; c <= cols; c++) {
      const div = document.createElement('div');
      div.className = 'label-cell';
      div.style.left = `${c * W}px`; div.style.top = `${r * H}px`;
      div.style.width = `${W}px`; div.style.height = `${H}px`;
      div.innerText = `${rows[r]}${c}`; div.dataset.location = `${rows[r]}${c}`;
      container.appendChild(div);
    }
  }

  // --- TEMPORARY ZONE COORDINATES (Tem Header, 1-7 Left, 8-14 Right) ---
  const temHeader = document.createElement('div');
  temHeader.className = 'coordinate-label';
  temHeader.style.left = `980px`; temHeader.style.top = `800px`;
  temHeader.style.width = `${W * 2 + 10}px`; temHeader.style.height = `${H - 10}px`;
  temHeader.innerText = "Tem"; container.appendChild(temHeader);

  for (let i = 0; i < 7; i++) {
    const leftNum = document.createElement('div');
    leftNum.className = 'coordinate-label';
    leftNum.style.left = `950px`; leftNum.style.top = `${850 + (i * 50)}px`;
    leftNum.style.width = `25px`; leftNum.style.height = `40px`;
    leftNum.innerText = i + 1; container.appendChild(leftNum);

    const rightNum = document.createElement('div');
    rightNum.className = 'coordinate-label';
    rightNum.style.left = `${1155px}`; rightNum.style.top = `${850 + (i * 50)}px`;
    rightNum.style.width = `25px`; rightNum.style.height = `40px`;
    rightNum.innerText = i + 8; container.appendChild(rightNum);
  }

  // --- OFFICE AREA COORDINATES (1-6 Top) ---
  const off = window.locations.offices;
  for (let c = 0; c < off.cols; c++) {
    const div = document.createElement('div');
    div.className = 'coordinate-label';
    div.style.left = `${off.startLeft + c * off.cellWidth}px`; div.style.top = `-30px`;
    div.style.width = `${off.cellWidth}px`; div.style.height = `25px`;
    div.innerText = c + 1; container.appendChild(div);
  }

  // --- RENDER ALL STORAGE CELLS ---
  for (let i = 1; i <= off.count; i++) {
    const col = (i - 1) % off.cols; const row = Math.floor((i - 1) / off.cols);
    const div = document.createElement('div');
    div.className = 'label-cell office-zone';
    div.style.left = `${off.startLeft + col * off.cellWidth}px`; div.style.top = `${off.startTop + row * off.cellHeight}px`;
    div.style.width = `${off.cellWidth}px`; div.style.height = `${off.cellHeight}px`;
    div.innerText = `Office${i}`; div.dataset.location = `Office${i}`;
    container.appendChild(div);
  }
  window.locations.restroomsShelvesTemp.forEach(item => {
    const div = document.createElement('div');
    div.className = 'label-cell restroom-zone';
    div.style.left = `${item.left}px`; div.style.top = `${item.top}px`;
    div.style.width = `${item.width || W}px`; div.style.height = `${item.height || H}px`;
    div.innerText = item.name; div.dataset.location = item.name;
    container.appendChild(div);
  });
  window.locations.dropZones.forEach(zone => {
    const div = document.createElement('div');
    div.className = 'label-cell drop-zone';
    div.id = zone.id; div.style.left = `${zone.left}px`; div.style.top = `${zone.top}px`;
    div.style.width = `${zone.width}px`; div.style.height = `${zone.height}px`;
    div.style.backgroundColor = zone.color; div.innerText = zone.name;
    div.dataset.location = zone.name; container.appendChild(div);
  });
};

window.getLocationAtClientPoint = function(clientX, clientY) {
  const cells = document.querySelectorAll(".label-cell");
  for (const cell of cells) {
    const r = cell.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return cell.dataset.location;
  }
  return null;
};

window.createNewPallet = function(itemId, quantity, location = "New_#", record = true) {
  const id = "pallet-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const pallet = new window.Pallet(id, itemId, quantity, location);
  document.querySelector(".grid-stack").appendChild(pallet.el);
  window.pallets.push(pallet);
  if (!window.palletsByLocation[location]) window.palletsByLocation[location] = [];
  window.palletsByLocation[location].push(pallet);
  window.adjustPalletSizesAtLocation(location);
  window.upsertPalletToDB(pallet);
  if (record) window.recordHistory("new-product", itemId, quantity);
  return pallet;
};

window.adjustPalletSizesAtLocation = function(location) {
  if (!location) return;
  const stack = window.palletsByLocation[location] || [];
  stack.forEach((p, i) => {
    const locEl = Array.from(document.querySelectorAll('.label-cell')).find(el => el.dataset.location === location);
    if (locEl) {
      p.el.style.left = locEl.style.left; p.el.style.top = `${parseInt(locEl.style.top) + (i * 12)}px`;
      p.el.style.width = locEl.style.width; p.el.style.height = `45px`; p.el.style.zIndex = 1000 + i;
    }
  });
};

window.updateInventorySummary = function() {
  const summary = {};
  window.pallets.forEach(p => { if (p.location !== 'SHIPPED' && p.location !== 'TO-8412-OFFICE') summary[p.itemId] = (summary[p.itemId] || 0) + p.quantity; });
  const out = document.getElementById('inventory-summary-output');
  if (out) out.innerHTML = Object.entries(summary).map(([id, q]) => `<b>${id}</b>: ${q}<br>`).join('');
};

window.scaleGrid = function() {
  const container = document.querySelector('#warehouse-container');
  if (!container) return;
  window.scale = Math.min(window.innerWidth / 1730, window.innerHeight / 1350, 1);
  container.style.transform = `scale(${window.scale})`;
  container.style.left = `${(window.innerWidth - 1730 * window.scale) / 2}px`;
  container.style.top = `${(window.innerHeight - 1350 * window.scale) / 2}px`;
};

window.initWarehouseApp = function() {
  window.createGridLabels();
  window.setupEventListeners();
  window.scaleGrid();
  window.setEditMode(false);
};
