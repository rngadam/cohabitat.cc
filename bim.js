// 3D Visualization Logic
const buildingData = {
    roof: {
        title: "Toit - Oasis Urbaine",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="sun" class="w-4 h-4"></i></div><span>Jardin communautaire productif</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="waves" class="w-4 h-4"></i></div><span>Jacuzzi et sauna nordique</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="droplets" class="w-4 h-4"></i></div><span>Système de collecte d'eau de pluie</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="mountain" class="w-4 h-4"></i></div><span>Vues panoramiques sur la ville</span></li>
                </ul>`,
        icon: "sun"
    },
    residential: {
        title: "Étages 2 à 5 - Résidentiel",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="bed-double" class="w-4 h-4"></i></div><span>Suites privées (SDB, Walk-in, Balcon)</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="users" class="w-4 h-4"></i></div><span>Cuisine et salon partagé au cœur de chaque étage</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="shirt" class="w-4 h-4"></i></div><span>Buanderie annexée à l'escalier de secours</span></li>
                </ul>`,
        icon: "home"
    },
    coworking: {
        title: "1er Étage - Vie Active",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="briefcase" class="w-4 h-4"></i></div><span>Espace de Coworking & Bureaux</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="coffee" class="w-4 h-4"></i></div><span>Café-bar pour les résidents</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="film" class="w-4 h-4"></i></div><span>Cinéma-maison & Salle de réunion</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="door-open" class="w-4 h-4"></i></div><span>Sas d'entrée résidentiel sécurisé</span></li>
                </ul>`,
        icon: "briefcase"
    },
    rdc: {
        title: "Rez-de-chaussée - Ancrage",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="utensils" class="w-4 h-4"></i></div><span>Restaurant Solidaire (Resto Danny)</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="map-pin" class="w-4 h-4"></i></div><span>Ouverture sur le quartier</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="heart-handshake" class="w-4 h-4"></i></div><span>Espace d'accueil et de mixité sociale</span></li>
                </ul>`,
        icon: "utensils"
    },
    basement: {
        title: "Sous-sol - Logistique",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="hammer" class="w-4 h-4"></i></div><span>Fablab complet (Mécanique, Bois, Élec)</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="bike" class="w-4 h-4"></i></div><span>Garage vélos sécurisé</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="package" class="w-4 h-4"></i></div><span>Espace de stockage (effets personnels)</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="recycle" class="w-4 h-4"></i></div><span>Système de bio-digesteur</span></li>
                </ul>`,
        icon: "hammer"
    },
    engineering: {
        title: "Vue Ingénierie",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="activity" class="w-4 h-4"></i></div><span>Poutres de support apparentes (Mass Timber)</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="pipette" class="w-4 h-4"></i></div><span>Colonnes de plomberie centralisées</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="zap" class="w-4 h-4"></i></div><span>Système électrique intelligent</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="arrow-up-down" class="w-4 h-4"></i></div><span>Ascenseur en verre (Puit de lumière)</span></li>
                </ul>`,
        icon: "cpu"
    }
};

function selectFloor(floorId) {
    // Update Visuals
    document.querySelectorAll('.floor-plate').forEach(el => el.classList.remove('active'));
    if(floorId !== 'engineering') {
        const activeEl = document.querySelector(`.layer-${floorId}`);
        if(activeEl) activeEl.classList.add('active');
    }

    // Update Info Panel
    const infoPanel = document.getElementById('floor-info');
    const data = buildingData[floorId];

    infoPanel.style.opacity = 0;
    setTimeout(() => {
        infoPanel.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <div class="p-3 bg-primary text-secondary rounded-xl shadow-lg">
                    <i data-lucide="${data.icon}" class="w-8 h-8"></i>
                </div>
                <h3 class="font-serif text-3xl text-primary">${data.title}</h3>
            </div>
            <div class="text-stone-600 leading-relaxed text-lg">
                ${data.content}
            </div>
        `;
        lucide.createIcons();
        infoPanel.style.opacity = 1;
    }, 300);
}

function toggleEngineering() {
    const stack = document.getElementById('building-stack');
    stack.classList.toggle('engineering');

    if (stack.classList.contains('engineering')) {
        selectFloor('engineering');
    } else {
        selectFloor('roof'); // Reset to roof or clear
    }
}
