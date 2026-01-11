// --- Warehouse App Variables ---
const CELL_WIDTH = 80;
const CELL_HEIGHT = 50;
let pallets = [];
let palletsByLocation = {};
let scale = 1.0;
let isDraggingPallet = false;

// --- Locations ---
const locations = {
    gridLabels: { rows: [...'XWVUTSRQPONMLKJIHGFEDCBA'], cols: 11 },
    offices: { count: 30, startLeft: 980, startTop: 0, cols: 6, cellWidth: 80, cellHeight: 50 },
    restroomsShelvesTemp: [ /* copy all your original locations here */ ],
    dropZones: [
        { id: "SHIPPED", name: "SHIPPED", left: 1300, top: 1100, width: 160, height: 80, color: '#e74c3c' },
        { id: "TO-8412-OFFICE", name: "TO-8412-OFFICE", left: 1300, top: 950, width: 160, height: 80, color: '#2980b9' }
    ]
};

// --- Pallet Class ---
class Pallet {
    constructor(id, itemId, quantity, location="New_#") {
        this.id = id;
        this.itemId = itemId;
        this.quantity = quantity;
        this.location = location;
        this.el = document.createElement('div');
        this.el.className = 'pallet';
        this.el.setAttribute('draggable', 'true');
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
        // drag & touch events (same as your original code)
        // moveToLocation, split arrow logic
        this.el.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', this.id);
            this.el.classList.add('dragging'); isDraggingPallet = true;
        });
        this.el.addEventListener('dragend', e => {
            this.el.classList.remove('dragging'); isDraggingPallet = false;
            const loc = findLocationUnder(e.clientX, e.clientY);
            if (loc) this.moveToLocation(loc);
        });

        this.splitArrow.addEventListener('click', e => {
            e.stopPropagation();
            const splitQ = prompt(`Enter quantity to split from "${this.itemId}" (max ${this.quantity-1})`, Math.floor(this.quantity/2));
            const num = parseInt(splitQ);
            if(!isNaN(num) && num>0 && num<this.quantity){
                this.quantity -= num; this.updateText();
                const newPallet = createNewPallet(this.itemId, num, this.location, false);
                pallets.push(newPallet);
                saveWarehouseData(); adjustPalletSizesAtLocation(this.location);
            }
        });
    }

    moveToLocation(newLoc) {
        const oldLoc = this.location;
        if(newLoc===oldLoc) return;

        if(palletsByLocation[oldLoc]){
            palletsByLocation[oldLoc] = palletsByLocation[oldLoc].filter(p => p!==this);
            if(palletsByLocation[oldLoc].length===0) delete palletsByLocation[oldLoc];
        }

        if(!palletsByLocation[newLoc]) palletsByLocation[newLoc]=[];
        palletsByLocation[newLoc].push(this);

        this.location = newLoc; this.el.dataset.location=newLoc;

        if(newLoc==='SHIPPED'||newLoc==='TO-8412-OFFICE'){
            recordHistory(newLoc,this.itemId,this.quantity);
            this.remove(); pallets = pallets.filter(p=>p!==this);
            updateInventorySummary();
        } else { positionPalletInLocation(this); }

        saveWarehouseData();
        adjustPalletSizesAtLocation(oldLoc);
        adjustPalletSizesAtLocation(newLoc);
    }

    remove(){ if(this.el.parentNode) this.el.parentNode.removeChild(this.el); }
}

// --- Core Functions ---
function createGridLabels() { /* copy all your original createGridLabels code */ }
function findLocationUnder(x,y){ /* original code */ }
function createNewPallet(itemId,q,loc="New_#",record=true){ /* original code */ }
function positionPalletInLocation(pallet){ /* original code */ }
function adjustPalletSizesAtLocation(loc){ /* original code */ }
function updateInventorySummary(){ /* original code */ }

// --- Firebase Save/Load ---
function loadWarehouseData(){ /* original code */ }
function saveWarehouseData(){ /* original code */ }
function recordHistory(type,itemId,q){ /* original code */ }
function showHistory(type){ /* original code */ }

// --- Init Function ---
function initWarehouseApp(){
    createGridLabels();
    loadWarehouseData();
    setupEventListeners();
}
