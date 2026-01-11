function setupEventListeners() {
    // Add Product
    document.getElementById('add-product-btn').addEventListener('click',()=>{
        const itemId = document.getElementById('new-item').value.trim();
        const q = parseInt(document.getElementById('new-q').value);
        if(!itemId||isNaN(q)||q<1){ alert("Enter valid Item ID and Quantity"); return; }
        createNewPallet(itemId,q,'New_#');
        document.getElementById('new-item').value=''; document.getElementById('new-q').value='';
    });

    // Inventory summary toggle
    document.getElementById('inventory-summary-panel').addEventListener('click',()=>{
        updateInventorySummary();
        const out=document.getElementById('inventory-summary-output');
        out.style.display=out.style.display==='none'?'block':'none';
    });

    // History buttons
    document.querySelectorAll('.history-icon-btn').forEach(btn=>{
        btn.addEventListener('click',()=>showHistory(btn.dataset.type));
    });

    // Close modal
    document.querySelector('#history-modal .close-btn').addEventListener('click',()=>{
        document.getElementById('history-modal').style.display='none';
    });

    window.addEventListener('click',e=>{
        if(e.target===document.getElementById('history-modal')) document.getElementById('history-modal').style.display='none';
    });

    // Scale grid
    window.addEventListener('resize', scaleGrid);
    scaleGrid();
}

function scaleGrid(){
    const container=document.querySelector('#warehouse-container');
    const screenWidth=window.innerWidth, screenHeight=window.innerHeight;
    const originalWidth=1730, originalHeight=1350;
    const scale=Math.min(screenWidth/originalWidth,screenHeight/originalHeight,1);
    container.style.transform=`scale(${scale})`;
    container.style.left=`${(screenWidth-originalWidth*scale)/2}px`;
    container.style.top=`${(screenHeight-originalHeight*scale)/2}px`;
}
