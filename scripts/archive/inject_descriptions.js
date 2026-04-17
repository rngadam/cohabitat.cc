const fs = require('fs');
const path = 'allocations.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const floorMetadata = {
    "Sous-sol": {
        description: "Atelier vélo, fablab, logistique active, stockages techniques, zone de livraison et services de maintenance.",
        design_notes: "Espaces techniques intégrés, flux de livraison séparés et accès direct au RDC."
    },
    "Rez-de-chaussée": {
        description: "Resto solidaire, accueil, espace café, comptoir de service et zones d'échange pour habitants et quartier.",
        design_notes: "Front public attractif, relation directe avec la rue et terrasse partielle."
    },
    "Étage 1 (Mezzanine)": {
        description: "Espace polyvalent, coworking, atelier créatif et salon collectif ouvert sur le rez-de-chaussée.",
        design_notes: "Usage flexible, vues croisées et lumière naturelle."
    },
    "Étage 2": {
        description: "7 studios individuels optimisés (comptoir/kitchenette) avec grande cuisine et salon communautaires sur le palier.",
        design_notes: "Densité optimisée, interface douce entre privé et collectif, et cuisine partagée par étage."
    },
    "Étage 3": {
        description: "7 studios individuels optimisés (comptoir/kitchenette) avec grande cuisine et salon communautaires sur le palier.",
        design_notes: "Densité optimisée, interface douce entre privé et collectif, et cuisine partagée par étage."
    },
    "Étage 4": {
        description: "7 studios individuels optimisés (comptoir/kitchenette) avec grande cuisine et salon communautaires sur le palier.",
        design_notes: "Densité optimisée, interface douce entre privé et collectif, et cuisine partagée par étage."
    },
    "Étage 5": {
        description: "7 studios individuels optimisés (comptoir/kitchenette) avec grande cuisine et salon communautaires sur le palier.",
        design_notes: "Densité optimisée, interface douce entre privé et collectif, et cuisine partagée par étage."
    },
    "Étage 6": {
        description: "8 studios individuels optimisés (comptoir/kitchenette) avec grande cuisine et salon communautaires sur le palier.",
        design_notes: "Dernier niveau résidentiel maximisant la capacité d'accueil tout en préservant le partage."
    },
    "Toit": {
        description: "Plates-formes solaires, éoliennes, bien-être collectif (sauna, bain tourbillon) et espace technique.",
        design_notes: "Dédié à l'autonomie énergétique et au bien-être collectif panoramique."
    },
    "Cour": {
        description: "Jardin et verger urbain, BBQ communautaire, stationnement vélo abrité et espaces de détente.",
        design_notes: "Espace extérieur favorisant les rencontres sociales en lien avec le resto solidaire."
    }
};

data.floors.forEach(floor => {
    const meta = floorMetadata[floor.name];
    if (meta) {
        floor.description = meta.description;
        floor.design_notes = meta.design_notes;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Injected descriptions and design notes into allocations.json');
