window.Pallet = class Pallet {
  constructor(id, itemId, quantity, location) {
    this.id = id;
    this.itemId = itemId;
    this.quantity = parseFloat(quantity); // Use float for decimals
    this.location = location || "New_#";

    this.el = document.createElement("div");
    this.el.className = "pallet";
    
    // Split Button (Right side)
    this.splitBtn = document.createElement("div");
    this.splitBtn.className = "split-arrow";
    this.splitBtn.innerHTML = "◮";
    
    // Add Button (Top Left - New Feature)
    this.addBtn = document.createElement("div");
    this.addBtn.className = "add-btn";
    this.addBtn.innerHTML = "+";

    this.el.appendChild(this.splitBtn);
    this.el.appendChild(this.addBtn);
    this.updateText();
    this.addEventListeners();
  }

  updateText() {
    // Show decimals if they exist
    const displayQty = Number.isInteger(this.quantity) ? this.quantity : this.quantity.toFixed(2);
    this.el.innerHTML = `${this.itemId}<br>Q: ${displayQty}`;
    this.el.appendChild(this.splitBtn);
    this.el.appendChild(this.addBtn);
    
    if (!window.editMode) {
      this.el.classList.add("view-only");
    } else {
      this.el.classList.remove("view-only");
    }
  }

  addEventListeners() {
    // Merge Logic (+)
    this.addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!window.editMode) return;
      
      const sourceId = prompt("Enter the ID of the pallet to take quantity FROM:");
      const source = window.pallets.find(p => p.id === sourceId);
      
      if (!source) return alert("Pallet ID not found.");
      if (source.itemId !== this.itemId) return alert("Error: Product IDs do not match!");
      if (source.id === this.id) return alert("Cannot merge a pallet with itself.");

      const amt = parseFloat(prompt(`How much to move? (Current source quantity: ${source.quantity})`));
      if (isNaN(amt) || amt <= 0 || amt > source.quantity) return alert("Invalid amount.");

      this.quantity += amt;
      source.quantity -= amt;

      if (source.quantity <= 0) source.remove();
      else source.updateText();
      
      this.updateText();
      window.saveWarehouseData();
      window.recordHistory({
        action: 'merge',
        itemId: this.itemId,
        quantity: amt,
        fromLocation: source.id,
        toLocation: this.id
      });
    });

    // Split Logic
    this.splitBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!window.editMode) return;
      const amount = parseFloat(prompt(`Enter quantity to split (Max: ${this.quantity}):`));
      if (isNaN(amount) || amount <= 0 || amount >= this.quantity) return;

      this.quantity -= amount;
      this.updateText();
      window.createNewPallet(this.itemId, amount, this.location);
      window.saveWarehouseData();
    });

    // Drag and Drop (Standard pointer events - similar to your original code)
    this.el.addEventListener("pointerdown", (e) => {
      if (!window.editMode) return;
      this.onPointerDown(e);
    });
  }

  // ... (Keep your standard onPointerDown, onPointerMove, onPointerUp logic here)
  remove() {
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    window.pallets = window.pallets.filter(p => p !== this);
  }
};
