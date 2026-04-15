const fs = require('fs');
const FILE_PATH = 'allocations.json';

const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));

function round(val) {
    return Math.round(val * 100) / 100;
}

data.floors.forEach(floor => {
    if (!['Étage 2', 'Étage 3', 'Étage 4', 'Étage 5', 'Étage 6'].includes(floor.name)) return;

    // Find all studios
    const studios = floor.items.filter(i => i.name.startsWith('Studio'));
    if (studios.length === 0) return;

    // Identify the last studio to convert
    const lastStudio = studios[studios.length - 1];
    const originalArea = lastStudio.area;

    // Determine config for floating rooms
    const isF6 = floor.name === 'Étage 6';
    const roomArea = isF6 ? 9.00 : 9.50;
    const totalRoomArea = roomArea * 2;
    const surplus = round(originalArea - totalRoomArea);

    console.log(`Reconfiguring ${floor.name}: converting ${lastStudio.name} (${originalArea}m2) to 2 floating rooms (${totalRoomArea}m2). Surplus: ${surplus}m2`);

    // Remove the last studio
    const lastIndex = floor.items.indexOf(lastStudio);
    floor.items.splice(lastIndex, 1);

    // Add floating rooms
    floor.items.push({
        name: "Chambre flottante A (invités/gardes)",
        area: roomArea,
        labels: ["partagé", "résidentiel"]
    });
    floor.items.push({
        name: "Chambre flottante B (invités/gardes)",
        area: roomArea,
        labels: ["partagé", "résidentiel"]
    });

    // Redistribute surplus to remaining studios
    const remainingStudios = studios.slice(0, -1);
    const split = round(surplus / remainingStudios.length);
    let distributed = 0;

    remainingStudios.forEach((s, idx) => {
        const itemInArray = floor.items.find(i => i === s);
        if (idx === remainingStudios.length - 1) {
            // Last one gets the actual remaining surplus to avoid rounding drift
            itemInArray.area = round(itemInArray.area + (surplus - distributed));
        } else {
            itemInArray.area = round(itemInArray.area + split);
            distributed = round(distributed + split);
        }
        
        // Adjust subitems if they exist (principal space gets the extra area)
        if (itemInArray.subitems) {
            const principal = itemInArray.subitems.find(si => si.name.includes('principal'));
            if (principal) {
                const subDiff = round(itemInArray.area - itemInArray.subitems.reduce((sum, si) => sum + si.area, 0));
                principal.area = round(principal.area + subDiff);
            }
        }
    });

    // Update floor description
    const numStudios = remainingStudios.length;
    floor.description = `${numStudios} studios individuels agrandis et 2 chambres flottantes pour invités/gardes. Cuisine et salon communautaires sur le palier.`;
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
console.log('Successfully reconfigured residential floors with floating rooms.');
