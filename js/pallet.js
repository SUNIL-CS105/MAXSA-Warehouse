class Pallet {
    constructor(id, itemId, quantity, location) {
        this.id = id;
        this.itemId = itemId;
        this.quantity = quantity;
        this.location = location;

        this.el = document.createElement('div');
        this.el.className = 'pallet';
        this.el.dataset.id = id;
        this.updateText();
    }

    updateText() {
        this.el.innerHTML = `${this.itemId}<br>Q: ${this.quantity}`;
    }
}
