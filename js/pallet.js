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
  }

  addEventListeners() {
    // ---------- TRUE DRAG ----------
    this.el.addEventListener("pointerdown", (e) => {
      // ✅ require edit mode for dragging
      if (!window.isEditMode) return;

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
      if (!window.isEditMode) return;
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
      if (!window.isEditMode) return;
      if (!this.el.classList.contains("dragging")) return;
      e.preventDefault();

      try { this.el.releasePointerCapture(e.pointerId); } catch (_) {}

      this.el.classList.remove("dragging");
      window.isDraggingPallet = false;

      const loc = window.getLocationAtClientPoint(e.clientX, e.clientY);

      if (loc) {
        this.moveToLocation(loc);
      } else {
        // snap back
        window.adjustPalletSizesAtLocation(this.location);
      }
    });

    this.el.addEventListener("pointercancel", () => {
      this.el.classList.remove("dragging");
      window.isDraggingPallet = false;
      window.adjustPalletSizesAtLocation(this.location);
    });

    // ---------- Split arrow ----------
    this.splitArrow.addEventListener("click", (e) => {
      e.stopPropagation();

      // ✅ require edit mode for splitting
      if (!window.isEditMode) {
        alert("Edit Mode is OFF. Turn on Edit Mode to split pallets.");
        return;
      }

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

        window.createNewPallet(this.itemId, num, this.location, false);

        window.saveWarehouseData();
        window.adjustPalletSizesAtLocation(this.location);
      }
    });
  }

  moveToLocation(newLoc) {
    const oldLoc = this.location;
    if (!newLoc) return;

    // ✅ Confirmation before removal zones
    if (newLoc === "SHIPPED" || newLoc === "TO-8412-OFFICE") {
      const label = (newLoc === "SHIPPED") ? "SHIPPED" : "TO-8412-OFFICE";
      const ok = confirm(`Are you sure you want to move ${this.itemId} (Q: ${this.quantity}) to ${label}? This will remove it from the map.`);
      if (!ok) {
        // snap back
        window.adjustPalletSizesAtLocation(oldLoc);
        return;
      }
    }

    // remove from old stack
    if (window.palletsByLocation[oldLoc]) {
      window.palletsByLocation[oldLoc] =
        window.palletsByLocation[oldLoc].filter(p => p !== this);
      if (window.palletsByLocation[oldLoc].length === 0) {
        delete window.palletsByLocation[oldLoc];
      }
    }

    // add to new stack
    if (!window.palletsByLocation[newLoc]) window.palletsByLocation[newLoc] = [];
    window.palletsByLocation[newLoc].push(this);

    this.location = newLoc;
    this.el.dataset.location = newLoc;

    // shipped / to office -> record + remove
    if (newLoc === "SHIPPED" || newLoc === "TO-8412-OFFICE") {
      window.recordHistory(newLoc, this.itemId, this.quantity);
      this.remove();
      window.pallets = window.pallets.filter(p => p !== this);
      window.updateInventorySummary();
    }

    // reposition both stacks
    window.adjustPalletSizesAtLocation(oldLoc);
    window.adjustPalletSizesAtLocation(newLoc);

    window.saveWarehouseData();
  }

  remove() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
};
