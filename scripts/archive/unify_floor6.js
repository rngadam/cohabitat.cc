const fs = require('fs');
const FILE_PATH = 'allocations.json';

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

// 1. Get template from Étage 2
const floor2 = data.floors.find(f => f.name === 'Étage 2');
if (!floor2) {
    console.error('Étage 2 not found to use as template!');
    process.exit(1);
}

// 2. Locate Étage 6
const floor6 = data.floors.find(f => f.name === 'Étage 6');
if (!floor6) {
    console.error('Étage 6 not found!');
    process.exit(1);
}

console.log('Unifying Étage 6 using Étage 2 as template...');

// 3. Clone items from Floor 2 to Floor 6
// Note: We use JSON.parse(JSON.stringify()) for deep cloning
floor6.items = JSON.parse(JSON.stringify(floor2.items));

// 4. Update Floor 6 specific fields
floor6.description = "6 studios individuels et 2 chambres flottantes pour invités/gardes. Cuisine et salon communautaires sur le palier. (Étage standardisé)";
floor6.design_notes = "Dernier niveau résidentiel identique aux paliers inférieurs pour une efficacité de construction maximale.";

// 5. Ensure all items have the correct labels (including 'partagé' for circulation, from earlier task)
function updateLabels(item) {
    if (!item.labels) item.labels = [];
    if (!Array.isArray(item.labels)) item.labels = [item.labels];
    if (/circulation|escalier|ascenseur/i.test(item.name) && !item.labels.includes('partagé')) {
        item.labels.push('partagé');
    }
    if (item.subitems) item.subitems.forEach(updateLabels);
}
floor6.items.forEach(updateLabels);

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('Successfully unified Étage 6 with standard residential template.');
