window.Pallet = class Pallet {
  constructor(id, itemId, quantity, location) {
    this.id = id;
    this.itemId = itemId;
    this.quantity = quantity;
    this.location = location || "New_#";

    this.el = document.createElement('div');
    this.el.className = 'pallet';
    this.el.setAttribute('draggable', 'true');
    this.el.dataset.id = id;
    this.el.dataset.itemId = itemId;
    this.el.dataset.quantity = quantity;
    this.el.dataset.location = this.location;

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
    // Drag (desktop)
    this.el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', this.id);
      e.dataTransfer.effectAllowed = "move";
      this.el.classList.add('dragging');
      window.isDraggingPallet = true;
    });

    this.el.addEventListener('dragend', e => {
      this.el.classList.remove('dragging');
      window.isDraggingPallet = false;

      const loc = window.findLocationUnder(e.clientX, e.clientY);
      if (loc) this.moveToLocation(loc);
    });

    // Touch (mobile)
    this.el.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      const palletRect = this.el.getBoundingClientRect();
      this.offsetX = touch.clientX - palletRect.left;
      this.offsetY = touch.clientY - palletRect.top;

      this.el.style.position = 'absolute';
      this.el.style.zIndex = 1000;
      this.el.classList.add('dragging');
      window.isDraggingPallet = true;
      e.preventDefault();
    }, { passive: false });

    this.el.addEventListener('touchmove', e => {
      if (window.isDraggingPallet) {
        const touch = e.touches[0];
        const container = document.querySelector('.grid-stack');
        const containerRect = container.getBoundingClientRect();

        // Use GLOBAL scale set by scaleGrid()
        const newLeft = (touch.clientX - containerRect.left - this.offsetX) / window.scale;
        const newTop = (touch.clientY - containerRect.top - this.offsetY) / window.scale;

        this.el.style.left = `${newLeft}px`;
        this.el.style.top = `${newTop}px`;
        e.preventDefault();
      }
    }, { passive: false });

    this.el.addEventListener('touchend', e => {
      if (window.isDraggingPallet) {
        const touch = e.changedTouches[0];
        const dropX = touch.clientX;
        const dropY = touch.clientY;

        const nearestLocation = window.findLocationUnder(dropX, dropY);
        if (nearestLocation) this.moveToLocation(nearestLocation);

        this.el.classList.remove('dragging');
        window.isDraggingPallet = false;
        e.preventDefault();
      }
    }, { passive: false });

    // Split arrow
    this.splitArrow.addEventListener('click', e => {
      e.stopPropagation();

      const maxSplit = this.quantity - 1;
      if (maxSplit < 1) return alert("Cannot split a quantity of 1.");

      const splitQ = prompt(
        `Enter quantity to split from "${this.itemId}" (max ${maxSplit}):`,
        Math.floor(this.quantity / 2)
      );

      const num = parseInt(splitQ, 10);
      if (!isNaN(num) && num > 0 && num < this.quantity) {
        this.quantity -= num;
        this.updateText();

        const newPallet = window.createNewPallet(this.itemId, num, this.location, false);
        window.pallets.push(newPallet);

        window.saveWarehouseData();
        window.adjustPalletSizesAtLocation(this.location);
      }
    });
  }

  moveToLocation(newLoc) {
    const oldLoc = this.location;
    if (newLoc === oldLoc) return;

    // remove from old stack
    if (window.palletsByLocation[oldLoc]) {
      window.palletsByLocation[oldLoc] = window.palletsByLocation[oldLoc].filter(p => p !== this);
      if (window.palletsByLocation[oldLoc].length === 0) delete window.palletsByLocation[oldLoc];
    }

    // add to new stack
    if (!window.palletsByLocation[newLoc]) window.palletsByLocation[newLoc] = [];
    window.palletsByLocation[newLoc].push(this);

    this.location = newLoc;
    this.el.dataset.location = newLoc;

    // shipped / to office behavior
    if (newLoc === 'SHIPPED' || newLoc === 'TO-8412-OFFICE') {
      window.recordHistory(newLoc, this.itemId, this.quantity);
      this.remove();
      window.pallets = window.pallets.filter(p => p !== this);
      window.updateInventorySummary();
    } else {
      window.positionPalletInLocation(this);
    }

    window.saveWarehouseData();
    window.adjustPalletSizesAtLocation(oldLoc);
    window.adjustPalletSizesAtLocation(newLoc);
  }

  remove() {
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
};
