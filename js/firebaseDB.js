function saveWarehouseData() {
    const data = {};
    pallets.forEach(p => {
        data[p.id] = {
            itemId: p.itemId,
            quantity: p.quantity,
            location: p.location
        };
    });
    database.ref('warehouse/pallets').set(data);
}

function loadWarehouseData() {
    database.ref('warehouse/pallets').on('value', snap => {
        const data = snap.val();
        pallets = [];
        palletsByLocation = {};

        if (data) {
            Object.values(data).forEach(p => {
                createNewPallet(p.itemId, p.quantity, p.location, false);
            });
        }
    });
}
