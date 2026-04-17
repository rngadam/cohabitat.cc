const fs = require('fs');
const path = 'allocations.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const rentableSpaces = [
    "Resto solidaire", "Accueil / comptoir", "Café & zone d'échange", "Terrasse / préau",
    "Cuisine partagée", "Ateliers culinaires", "Salle polyvalente", "Espace formation",
    "Coworking / salon collectif", "Micro-fablab / atelier créatif", "Salon ouvert / détente",
    "Réunions / formation", "Studio média / podcast", "Espace bien-être", "Salle de projection / conférence"
];

data.floors.forEach(floor => {
    floor.items.forEach(item => {
        if (rentableSpaces.includes(item.name)) {
            if (!item.labels) item.labels = [];
            if (!item.labels.includes('location')) {
                item.labels.push('location');
            }
        }
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Updated allocations.json with location labels');
