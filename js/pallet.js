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
    // ---------- TRUE DRAG (mouse + touch) ----------
    this.el.addEventListener("pointerdown", (e) => {
      if (e.target === this.splitArrow) return;
      e.preventDefault();

      const container = document.querySelector(".grid-stack");
      const containerRect = container.getBoundingClientRect();

      // pointer position in unscaled coordinates
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

      // IMPORTANT: detect the cell UNDER the pallet at drop time
      // Step 1: ignore the pallet itself
      this.el.style.pointerEvents = "none";

      // Step 2: find nearest label-cell using elementFromPoint + closest
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      const cell = elUnder ? elUnder.closest(".label-cell") : null;
      const loc = cell ? cell.dataset.location : null;

      // Step 3: restore pointer events
      this.el.style.pointerEvents = "auto";

      if (loc) {
        this.moveToLocation(loc, e.clientY); // allow stacking position based on drop Y
      } else {
        // dropped outside a cell -> snap back to its current location
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

  moveToLocation(newLoc, dropClientY = null) {
    const oldLoc = this.location;

    // If dropping into same location: reorder inside stack based on drop Y
    if (newLoc === oldLoc) {
      this.reorderWithinLocation(newLoc, dropClientY);
      window.saveWarehouseData();
      window.adjustPalletSizesAtLocation(newLoc);
      return;
    }

    // remove from old stack
    if (window.palletsByLocation[oldLoc]) {
      window.palletsByLocation[oldLoc] = window.palletsByLocation[oldLoc].filter(p => p !== this);
      if (window.palletsByLocation[oldLoc].length === 0) delete window.palletsByLocation[oldLoc];
    }

    // add to new stack (insert based on where user dropped)
    if (!window.palletsByLocation[newLoc]) window.palletsByLocation[newLoc] = [];
    const stack = window.palletsByLocation[newLoc];

    let insertIndex = stack.length; // default append

    if (dropClientY !== null) {
      const locEl = Array.from(document.querySelectorAll(".label-cell"))
        .find(el => el.dataset.location === newLoc);

      if (locEl) {
        const r = locEl.getBoundingClientRect(); // scaled rect
        const relY = Math.min(Math.max(dropClientY - r.top, 0), r.height - 1);
        const N = stack.length + 1;
        const slotH = r.height / N;
        insertIndex = Math.floor(relY / slotH);
        insertIndex = Math.min(Math.max(insertIndex, 0), stack.length);
      }
    }

    stack.splice(insertIndex, 0, this);

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

  reorderWithinLocation(loc, dropClientY) {
    const stack = window.palletsByLocation[loc] || [];
    if (stack.length <= 1) {
      window.positionPalletInLocation(this);
      return;
    }

    // remove first
    const idx = stack.indexOf(this);
    if (idx >= 0) stack.splice(idx, 1);

    // compute new index
    let insertIndex = stack.length;

    if (dropClientY !== null) {
      const locEl = Array.from(document.querySelectorAll(".label-cell"))
        .find(el => el.dataset.location === loc);

      if (locEl) {
        const r = locEl.getBoundingClientRect();
        const relY = Math.min(Math.max(dropClientY - r.top, 0), r.height - 1);
        const N = stack.length + 1;
        const slotH = r.height / N;
        insertIndex = Math.floor(relY / slotH);
        insertIndex = Math.min(Math.max(insertIndex, 0), stack.length);
      }
    }

    stack.splice(insertIndex, 0, this);
    window.positionPalletInLocation(this);
  }

  remove() {
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
};
