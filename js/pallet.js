window.Pallet = class Pallet {
  constructor(id, itemId, quantity, location) {
    this.id = id;
    this.itemId = itemId;
    this.quantity = quantity;
    this.location = location || "New_#";

    this.el = document.createElement("div");
    this.el.className = "pallet";
    this.el.setAttribute("draggable", "false");

    this.el.dataset.id = id;
    this.el.dataset.itemId = itemId;
    this.el.dataset.quantity = quantity;
    this.el.dataset.location = this.location;

    this.splitArrow = document.createElement("div");
    this.splitArrow.className = "split-arrow";
    this.splitArrow.innerHTML = "◮";
    this.el.appendChild(this.splitArrow);

    this.updateText();
    this.addEventListeners();
  }

  updateText() {
    this.el.innerHTML = `${this.itemId}<br>Q: ${this.quantity}`;
    this.el.appendChild(this.splitArrow);
    this.el.dataset.quantity = this.quantity;
    this.el.dataset.location = this.location;

    if (!window.editMode) {
      this.el.classList.add("view-only");
      this.splitArrow.classList.add("disabled");
    } else {
      this.el.classList.remove("view-only");
      this.splitArrow.classList.remove("disabled");
    }
  }

  addEventListeners() {
    this.el.addEventListener("pointerdown", (e) => {
      if (!window.editMode) return;
      if (e.target === this.splitArrow) return;

      e.preventDefault();

      const container = document.querySelector(".grid-stack");
      const containerRect = container.getBoundingClientRect();

      const pointerX = (e.clientX - containerRect.left) / window.scale;
      const pointerY = (e.clientY - containerRect.top) / window.scale;

      const currentLeft = parseFloat(this.el.style.left || "0");
      const currentTop = parseFloat(this.el.style.top || "0");

      this.dragOffsetX = pointerX - currentLeft;
      this.dragOffsetY = pointerY - currentTop;

      this.el.classList.add("dragging");
      window.isDraggingPallet = true;

      this.el.setPointerCapture(e.pointerId);
    });

    this.el.addEventListener("pointermove", (e) => {
      if (!window.editMode) return;
      if (!window.isDraggingPallet || !this.el.classList.contains("dragging")) return;

      e.preventDefault();

      const container = document.querySelector(".grid-stack");
      const containerRect = container.getBoundingClientRect();

      const pointerX = (e.clientX - containerRect.left) / window.scale;
      const pointerY = (e.clientY - containerRect.top) / window.scale;

      this.el.style.left = `${pointerX - this.dragOffsetX}px`;
      this.el.style.top = `${pointerY - this.dragOffsetY}px`;
    });

    this.el.addEventListener("pointerup", (e) => {
      if (!window.editMode) return;
      if (!this.el.classList.contains("dragging")) return;

      e.preventDefault();

      try {
        this.el.releasePointerCapture(e.pointerId);
      } catch (_) {}

      this.el.classList.remove("dragging");
      window.isDraggingPallet = false;

      const loc = window.getLocationAtClientPoint(e.clientX, e.clientY);

      if (loc) {
        this.moveToLocation(loc);
      } else {
        window.adjustPalletSizesAtLocation(this.location);
      }
    });

    this.el.addEventListener("pointercancel", () => {
      this.el.classList.remove("dragging");
      window.isDraggingPallet = false;
      window.adjustPalletSizesAtLocation(this.location);
    });

    this.splitArrow.addEventListener("click", (e) => {
      e.stopPropagation();

      if (!window.editMode) {
        alert("Edit mode is OFF. Turn it ON to split pallets.");
        return;
      }

      const maxSplit = this.quantity - 1;
      if (maxSplit < 1) {
        alert("Cannot split a quantity of 1.");
        return;
      }

      const splitQ = prompt(
        `Enter quantity to split from "${this.itemId}" (max ${maxSplit}):`,
        Math.floor(this.quantity / 2)
      );

      const num = parseInt(splitQ, 10);

      if (!isNaN(num) && num > 0 && num < this.quantity) {
        this.quantity -= num;
        this.updateText();

        window.createNewPallet(this.itemId, num, this.location, false);

        window.recordHistory({
          action: 'split',
          itemId: this.itemId,
          quantity: num,
          fromLocation: this.location,
          toLocation: this.location
        });

        window.saveWarehouseData();
        window.adjustPalletSizesAtLocation(this.location);
        window.updateInventorySummary();
      }
    });
  }

  moveToLocation(newLoc, options = {}) {
    const {
      recordHistory = true,
      pushUndo = true
    } = options;

    const oldLoc = this.location;
    if (!newLoc || newLoc === oldLoc) {
      window.adjustPalletSizesAtLocation(this.location);
      return;
    }

    if (pushUndo && typeof window.registerUndoAction === 'function') {
      window.registerUndoAction({
        type: 'move',
        palletId: this.id,
        itemId: this.itemId,
        quantity: this.quantity,
        fromLocation: oldLoc,
        toLocation: newLoc
      });
    }

    if (window.palletsByLocation[oldLoc]) {
      window.palletsByLocation[oldLoc] =
        window.palletsByLocation[oldLoc].filter(p => p !== this);

      if (window.palletsByLocation[oldLoc].length === 0) {
        delete window.palletsByLocation[oldLoc];
      }
    }

    if (newLoc === "SHIPPED" || newLoc === "TO-8412-OFFICE") {
      if (recordHistory) {
        window.recordHistory({
          action: 'move',
          itemId: this.itemId,
          quantity: this.quantity,
          fromLocation: oldLoc,
          toLocation: newLoc
        });
      }

      this.location = newLoc;
      this.el.dataset.location = newLoc;

      this.remove();
      window.pallets = window.pallets.filter(p => p !== this);

      window.adjustPalletSizesAtLocation(oldLoc);
      window.saveWarehouseData();
      window.updateInventorySummary();
      return;
    }

    if (!window.palletsByLocation[newLoc]) window.palletsByLocation[newLoc] = [];
    window.palletsByLocation[newLoc].push(this);

    this.location = newLoc;
    this.el.dataset.location = newLoc;

    if (recordHistory) {
      window.recordHistory({
        action: 'move',
        itemId: this.itemId,
        quantity: this.quantity,
        fromLocation: oldLoc,
        toLocation: newLoc
      });
    }

    window.adjustPalletSizesAtLocation(oldLoc);
    window.adjustPalletSizesAtLocation(newLoc);

    window.saveWarehouseData();
    window.updateInventorySummary();
    this.updateText();
  }

  remove() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
};
