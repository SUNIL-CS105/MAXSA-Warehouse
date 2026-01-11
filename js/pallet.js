// --- Pallet Class ---
class Pallet {
  constructor(id, itemId, quantity, location = "New_#") {
    this.id = id;
    this.itemId = itemId;
    this.quantity = quantity;
    this.location = location;

    this.el = document.createElement('div');
    this.el.className = 'pallet';
    this.el.dataset.id = id;
    this.el.dataset.itemId = itemId;
    this.el.dataset.quantity = quantity;
    this.el.dataset.location = location;

    this.splitArrow = document.createElement('div');
    this.splitArrow.className = 'split-arrow';
    this.splitArrow.innerHTML = '◮';
    this.el.appendChild(this.splitArrow);

    this.updateText();
    this.addEventListeners();
  }

  updateText() {
    this.el.innerHTML = `${this.itemId}<br>Q: ${this.quantity}`;
    this.el.appendChild(this.splitArrow);
  }

  addEventListeners() {
    this.el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', this.id);
      e.dataTransfer.effectAllowed = "move";
      this.el.classList.add('dragging');
      isDraggingPallet = true;
    });

    this.el.addEventListener('dragend', e => {
      this.el.classList.remove('dragging');
      isDraggingPallet = false;
      const loc = findLocationUnder(e.clientX, e.clientY);
      if (loc) this.moveToLocation(loc);
    });

    this.splitArrow.addEventListener('click', e => {
      e.stopPropagation();
      const splitQ = prompt(`Enter quantity to split from "${this.itemId}" (max ${this.quantity - 1}):`, Math.floor(this.quantity / 2));
      const num = parseInt(splitQ);
      if (!isNaN(num) && num > 0 && num < this.quantity) {
        this.quantity -= num;
        this.updateText();
        const newPallet = createNewPallet(this.itemId, num, this.location, false);
        pallets.push(newPallet);
        saveWarehouseData();
        adjustPalletSizesAtLocation(this.location);
      }
    });
  }

  moveToLocation(newLoc) {
    const oldLoc = this.location;
    if (newLoc === oldLoc) return;

    if (palletsByLocation[oldLoc]) {
      palletsByLocation[oldLoc] = palletsByLocation[oldLoc].filter(p => p !== this);
      if (palletsByLocation[oldLoc].length === 0) delete palletsByLocation[oldLoc];
    }

    if (!palletsByLocation[newLoc]) palletsByLocation[newLoc] = [];
    palletsByLocation[newLoc].push(this);

    this.location = newLoc;
    this.el.dataset.location = newLoc;

    if (newLoc === 'SHIPPED' || newLoc === 'TO-8412-OFFICE') {
      recordHistory(newLoc, this.itemId, this.quantity);
      this.remove();
      pallets = pallets.filter(p => p !== this);
      updateInventorySummary();
    } else {
      positionPalletInLocation(this);
    }

    saveWarehouseData();
    adjustPalletSizesAtLocation(oldLoc);
    adjustPalletSizesAtLocation(newLoc);
  }

  remove() {
    if(this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
}

// Helper
function createNewPallet(itemId, quantity, location="New_#", record=true){
  const id = 'pallet-' + Date.now() + '-' + Math.floor(Math.random()*1000);
  const pallet = new Pallet(id, itemId, quantity, location);
  document.querySelector('.grid-stack').appendChild(pallet.el);
  pallets.push(pallet);
  if(!palletsByLocation[location]) palletsByLocation[location]=[];
  palletsByLocation[location].push(pallet);
  positionPalletInLocation(pallet);
  adjustPalletSizesAtLocation(location);
  if(record) { recordHistory('new-product', itemId, quantity); saveWarehouseData(); }
  return pallet;
}
