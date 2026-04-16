const fs = require('fs');
const FILE_PATH = 'allocations.json';

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

function round(val) {
    return Math.round(val * 100) / 100;
}

data.floors.forEach(floor => {
    // Only for residential floors 2-6
    if (!['Étage 2', 'Étage 3', 'Étage 4', 'Étage 5', 'Étage 6'].includes(floor.name)) return;

    const balcony = floor.items.find(i => i.name.includes('Balcons collectifs'));
    if (!balcony || balcony.area === 0) return;

    console.log(`Processing ${floor.name}: Moving ${balcony.area} m2 from balcony to studios...`);

    const areaToMove = balcony.area;
    balcony.area = 0; // The balcony is now "exterior bonus", non-GFA.
    
    // Some naming cleanup for the balcony item
    balcony.name = "Balcons collectifs (Bonus extérieur)";
    if (!balcony.labels) balcony.labels = [];
    if (!balcony.labels.includes('extérieur')) balcony.labels.push('extérieur');

    const studios = floor.items.filter(i => i.name.startsWith('Studio'));
    const addPerStudio = round(areaToMove / studios.length);

    studios.forEach(studio => {
        studio.area = round(studio.area + addPerStudio);
        if (!studio.subitems) studio.subitems = [];
        
        studio.subitems.push({
            name: "Walk-in closet / Rangement intégré",
            area: addPerStudio,
            labels: ["privé"]
        });
    });

    // Update design notes
    floor.design_notes = "Densité optimisée avec walk-in closets privés. Balcons collectifs désormais comptés en bonus extérieur (hors GFA).";
    floor.design_keywords = "Intimité & Rangement";
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('Successfully reallocated balcony space to walk-in closets on residential floors.');
