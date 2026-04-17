const fs = require('fs');
const FILE_PATH = 'allocations.json';
const SQFT_TO_M2 = 0.09290304;

function convertArea(sqFt) {
    if (typeof sqFt !== 'number') return sqFt;
    // We use a high precision to calculate, then round to 2 decimals (cm)
    return Math.round(sqFt * SQFT_TO_M2 * 100) / 100;
}

function processItems(items) {
    if (!items) return;
    items.forEach(item => {
        item.area = convertArea(item.area);
        if (item.subitems) {
            processItems(item.subitems);
        }
    });
}

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

data.floors.forEach(floor => {
    floor.total = convertArea(floor.total);
    processItems(floor.items);
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('Successfully migrated allocations.json to metric (xx.xx m).');
