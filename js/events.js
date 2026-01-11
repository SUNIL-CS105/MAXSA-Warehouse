function setupEventListeners() {
    document.getElementById('add-product-btn').onclick = () => {
        const item = newItem.value.trim();
        const q = parseInt(newQ.value);
        if (!item || q < 1) return alert("Invalid input");
        createNewPallet(item, q, 'New_#');
    };
}
