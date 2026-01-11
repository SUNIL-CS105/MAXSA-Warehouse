window.Pallet = class Pallet {
  constructor(id, itemId, quantity, location) {
    this.id = id;
    this.itemId = itemId;
    this.quantity = quantity;
    this.location = location || "New_#";

    this.el = document.createElement("div");
    this.el.className = "pallet";

    // IMPORTANT: do NOT use HTML5 draggable
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
  }

  addEventListeners() {
    // ---------- TRUE DRAG (mouse + touch) ----------
    this.el.addEventListener("pointerdown", (e) => {
      // If clicking split arrow, don't drag
      if (e.target === this.splitArrow) return;

      e.preventDefault();

      const container = document.querySelector(".grid-stack");
      const containerRect = container.getBoundingClientRect();
      const palletRect = this.el.getBoundingClientRect();

      // Convert pointer position to "unscaled" map coordinates
      const pointerX = (e.clientX - containerRect.left) / window.scale;
      const pointerY = (e.clientY - containerRect.top) / window.scale;

      // Current pallet position in unscaled coords
      const currentLeft = parseFloat(this.el.style.left || "0");
      const currentTop = parseFloat(this.el.style.top || "0");

      // Offset between pointer and top-left of pallet
      this.dragOffsetX = pointerX - currentLeft;
      this.dragOffsetY = pointerY - currentTop;

      this.el.classList.add("dragging");
      window.isDraggingPallet = true;

      // Capture pointer so we keep receiving move events
      this.el.setPointerCapture(e.pointerId);
    });

    this.el.addEventListener("pointermove", (e) => {
      if (!window.isDraggingPallet || !this.el.classList.contains("dragging")) return;

      e.preventDefault();

      const container = document.querySelector(".grid-stack");
      const containerRect = container.getBoundingClientRect();

      const pointerX = (e.clientX - containerRect.left) / window.scale;
      const pointerY = (e.clientY - containerRect.top) / window.scale;

      const newLeft = pointerX - this.dragOffsetX;
      const newTop = pointerY - this.dragOffsetY;

      this.el.style.left = `${newLeft}px`;
      this.el.style.top = `${newTop}px`;
    });

    this.el.addEventListener("pointerup", (e) => {
      if (!this.el.classList.contains("dragging")) return;

      e.preventDefault();

      this.el.classList.remove("dragging");
      window.isDraggingPallet = false;

      // Use viewport coordinates directly for elementFromPoint
      const loc = window.findLocationUnder(e.clientX, e.clientY);
      if (loc) {
        this.moveToLocation(loc);
      } else {
        // If dropped outside any location, snap back to its location
        window.positionPalletInLocation(this);
      }
    });

    this.el.addEventListener("pointercancel", () => {
      this.el.classList.remove("dragging");
      window.isDraggingPallet = false;
      window.positionPalletInLocation(this);
    });

    // ---------- Split arrow ----------
    this.splitArrow.addEventListener("click", (e) => {
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
    if (newLoc === oldLoc) {
      window.positionPalletInLocation(this);
      return;
    }

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
    if (newLoc === "SHIPPED" || newLoc === "TO-8412-OFFICE") {
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
