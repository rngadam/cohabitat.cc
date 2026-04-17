const fs = require('fs');
const path = 'allocations.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Find residential floors (Étages 2-6)
const resFloors = ['Étage 2', 'Étage 3', 'Étage 4', 'Étage 5', 'Étage 6'];

data.floors.forEach(floor => {
    if (resFloors.includes(floor.name)) {
        const numStudios = (floor.name === 'Étage 6') ? 8 : 7;
        const totalShared = 1180;
        const remainingForStudios = floor.total - totalShared;
        const areaPerStudio = Math.floor(remainingForStudios / numStudios);

        floor.items = [
            // Shared items on each floor
            {
                name: "Grande cuisine & salle à manger communautaire",
                area: 400,
                labels: ["partagé", "résidentiel"]
            },
            {
                name: "Grand salon de palier / espace détente",
                area: 300,
                labels: ["partagé", "résidentiel"]
            },
            {
                name: "Buanderie & services techniques",
                area: 180,
                labels: ["partagé", "résidentiel"]
            },
            {
                name: "Balcons collectifs partagés",
                area: 150,
                labels: ["partagé", "résidentiel", "extérieur"]
            },
            {
                name: "Circulations / Ascenseur / Escalier",
                area: 150,
                labels: ["partagé", "résidentiel", "circulation"]
            }
        ];

        // Add studios
        for (let i = 1; i <= numStudios; i++) {
            floor.items.push({
                name: `Studio ${i}`,
                area: areaPerStudio,
                labels: ["privé", "résidentiel"],
                subitems: [
                    { name: "Espace principal (Lit/Bureau/Comptoir)", area: areaPerStudio - 85, labels: ["privé"] },
                    { name: "Kitchenette optimisée", area: 35, labels: ["privé"] },
                    { name: "Salle d'eau (Douche/WC)", area: 50, labels: ["privé"] }
                ]
            });
        }
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Reconfigured Étages 2-6 with 36 studios and shared spaces');
