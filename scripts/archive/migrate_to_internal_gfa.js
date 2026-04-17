const fs = require('fs');
const FILE_PATH = 'allocations.json';

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

function round(val) {
    return Math.round(val * 100) / 100;
}

function getLabelsList(item) {
    if (Array.isArray(item.labels)) return item.labels;
    if (typeof item.labels === 'string') return [item.labels];
    return [];
}

// 1. Process all floors to ensure internal sum matches total GFA
data.floors.forEach(floor => {
    // Skip Toit and Cour for strict sum matching as they are exterior levels
    if (['Toit', 'Cour'].includes(floor.name)) {
        if (floor.name === 'Cour') floor.total = 260.13; // Deduct RDC terrace
        return;
    }

    // Identify exterior items
    const internalItems = floor.items.filter(i => !getLabelsList(i).includes('extérieur'));

    const internalSum = round(internalItems.reduce((s, i) => s + i.area, 0));
    const targetInternalTotal = floor.total; // e.g., 278.71

    if (internalSum !== targetInternalTotal) {
        const diff = round(targetInternalTotal - internalSum);
        console.log(`Floor ${floor.name}: GFA Gap of ${diff} m2 (External items excluded). redistributing...`);

        // Find the "best" item to receive the extra space
        // For residential floors, distribute among studios
        const studios = internalItems.filter(i => i.name.startsWith('Studio'));
        if (studios.length > 0) {
            const addPerStudio = round(diff / studios.length);
            studios.forEach((studio, idx) => {
                const actualAdd = (idx === studios.length - 1) ? round(diff - addPerStudio * (studios.length - 1)) : addPerStudio;
                studio.area = round(studio.area + actualAdd);

                // Add to Walk-in closet subitem (created in previous turn)
                if (!studio.subitems) studio.subitems = [];
                let walkin = studio.subitems.find(s => s.name.includes('Walk-in'));
                if (!walkin) {
                    walkin = { name: "Rangement / Walk-in", area: 0, labels: ["privé"] };
                    studio.subitems.push(walkin);
                }
                walkin.area = round(walkin.area + actualAdd);
            });
        } else {
            // For common floors, add to the first prominent activity
            const mainItem = internalItems.find(i => !i.name.includes('Circulation') && !i.name.includes('Ascenseur')) || internalItems[0];
            mainItem.area = round(mainItem.area + diff);
            if (mainItem.subitems && mainItem.subitems.length > 0) {
                mainItem.subitems[0].area = round(mainItem.subitems[0].area + diff);
            }
        }
    }

    // Special case: Set balcony area to 3.72 (Exterior, doesn't count in internal sum)
    floor.items.forEach(item => {
        if (item.name.startsWith('Studio')) {
            if (!item.subitems) item.subitems = [];
            let balcony = item.subitems.find(s => s.name.includes('Balcon'));
            if (balcony) {
                balcony.area = 3.72;
                balcony.labels = ["privé", "extérieur"];
            }
        }
    });
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('--- Migration to Strict Internal GFA complete ---');
