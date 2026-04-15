const fs = require('fs');
const FILE_PATH = 'allocations.json';

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

function round(val) {
    return Math.round(val * 100) / 100;
}

function fixItems(items, expectedTotal) {
    if (!items || items.length === 0) return;
    
    // First, fix subitems for each item
    items.forEach(item => {
        if (item.subitems && item.subitems.length > 0) {
            fixItems(item.subitems, item.area);
        }
    });

    const currentSum = round(items.reduce((s, i) => s + i.area, 0));
    const diff = round(expectedTotal - currentSum);
    
    if (Math.abs(diff) > 0.001) {
        console.log(`Adjusting last item of group (target ${expectedTotal}): was sum ${currentSum}, diff ${diff}`);
        items[items.length - 1].area = round(items[items.length - 1].area + diff);
    }
}

data.floors.forEach(floor => {
    fixItems(floor.items, floor.total);
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('Fixed precision discrepancies in allocations.json.');
