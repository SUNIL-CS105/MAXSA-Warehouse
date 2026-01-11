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
        // Temporarily ignore the pallet so elementFromPoint can "see" the cell under it
    this.el.style.pointerEvents = "none";
    const loc = window.findLocationUnder(e.clientX, e.clientY);
    this.el.style.pointerEvents = "auto";

    if (loc) {
    this.moveToLocation(loc, e.clientY); // pass drop Y position
} 
    else {
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

  moveToLocation(newLoc, dropClientY = null)
 {
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
// add to new stack (insert based on where user dropped inside the cell)
if (!window.palletsByLocation[newLoc]) window.palletsByLocation[newLoc] = [];
const stack = window.palletsByLocation[newLoc];

// Default: append
let insertIndex = stack.length;

if (dropClientY !== null) {
  const locEl = Array.from(document.querySelectorAll('.label-cell'))
    .find(el => el.dataset.location === newLoc);

  if (locEl) {
    const r = locEl.getBoundingClientRect(); // scaled rect
    const relY = Math.min(Math.max(dropClientY - r.top, 0), r.height - 1);

    // if there will be N pallets after insert, divide the cell into N slots
    const N = stack.length + 1;
    const slotH = r.height / N;
    insertIndex = Math.floor(relY / slotH);
  }
}

// Insert pallet in that slot
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

  remove() {
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
  }
};
