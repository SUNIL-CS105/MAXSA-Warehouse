const CELL_WIDTH = 80;
const CELL_HEIGHT = 50;

let pallets = [];
let palletsByLocation = {};
let scale = 1;
let isDraggingPallet = false;

const locations = {
    gridLabels: {
        rows: ['X','W','V','U','T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'],
        cols: 11
    },
    offices: {
        count: 30,
        startLeft: 980,
        startTop: 0,
        cols: 6,
        cellWidth: 80,
        cellHeight: 50
    },
    restroomsShelvesTemp: [
        { name: 'Restroom1', left: 980, top: 300 },
        { name: 'Restroom2', left: 1060, top: 300 },
        { name: 'New_#', left: 990, top: 500 }
    ],
    dropZones: [
        { id: "SHIPPED", name: "SHIPPED", left: 1300, top: 1100, width: 160, height: 80 },
        { id: "TO-8412-OFFICE", name: "TO-8412-OFFICE", left: 1300, top: 950, width: 160, height: 80 }
    ]
};

function createGridLabels() {
    const container = document.querySelector('.grid-stack');
    container.innerHTML = '';

    locations.gridLabels.rows.forEach((row, r) => {
        for (let c = 1; c <= locations.gridLabels.cols; c++) {
            const div = document.createElement('div');
            div.className = 'label-cell';
            div.style.left = `${c * CELL_WIDTH}px`;
            div.style.top = `${r * CELL_HEIGHT}px`;
            div.style.width = `${CELL_WIDTH}px`;
            div.style.height = `${CELL_HEIGHT}px`;
            div.dataset.location = `${row}${c}`;
            div.innerText = `${row}${c}`;
            container.appendChild(div);
        }
    });
}
