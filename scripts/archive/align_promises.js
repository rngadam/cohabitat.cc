const fs = require('fs');
const FILE_PATH = 'allocations.json';

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

function round(val) {
    return Math.round(val * 100) / 100;
}

function updateLabels(item) {
    if (!item.labels) item.labels = [];
    if (!Array.isArray(item.labels)) item.labels = [item.labels];

    // Promise: All circulation is shared
    if (/circulation|escalier|ascenseur/i.test(item.name)) {
        if (!item.labels.includes('partagé')) {
            item.labels.push('partagé');
        }
    }

    if (item.subitems) {
        item.subitems.forEach(updateLabels);
    }
}

data.floors.forEach(floor => {
    // 1. Labeling
    floor.items.forEach(updateLabels);

    // 2. Resizing on Ground Floor (Rez-de-chaussée)
    if (floor.name === 'Rez-de-chaussée') {
        const atelier = floor.items.find(i => i.name === 'Ateliers culinaires');
        const formation = floor.items.find(i => i.name === 'Espace formation');
        const cafe = floor.items.find(i => i.name === 'Café & zone d\'échange');
        const resto = floor.items.find(i => i.name === 'Resto solidaire');
        const polyvalente = floor.items.find(i => i.name === 'Salle polyvalente');

        const TARGET_SIZE = 23.23; // 250 pi2

        const atelierDiff = round(TARGET_SIZE - atelier.area);
        const formationDiff = round(TARGET_SIZE - formation.area);
        const totalIncrease = round(atelierDiff + formationDiff);

        console.log(`Expanding Ateliers on Ground Floor by ${totalIncrease} m2`);

        atelier.area = TARGET_SIZE;
        formation.area = TARGET_SIZE;

        // Balance by reducing others
        polyvalente.area = round(polyvalente.area - 4.65);
        cafe.area = round(cafe.area - 9.29);
        resto.area = round(resto.area - (totalIncrease - 4.65 - 9.29));

        // Adjust resto subitems
        if (resto.subitems) {
            const dining = resto.subitems.find(s => s.name.includes('Salle à manger'));
            const subDiff = round(resto.area - resto.subitems.reduce((s, si) => s + si.area, 0));
            dining.area = round(dining.area + subDiff);
        }
    }
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('Successfully aligned allocations.json with marketing promises.');
