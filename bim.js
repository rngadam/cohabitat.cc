// 3D Visualization Logic

// Global State
let currentUnit = 'metric'; // 'metric' or 'imperial'
let currentFloorId = null;

// Helper to format area size
function formatArea(sqm) {
    if (currentUnit === 'metric') {
        return `${sqm} m²`;
    } else {
        return `${Math.round(sqm * 10.7639)} pi²`;
    }
}

// Data Definition
const buildingData = {
    roof: {
        title: "Toit - Oasis Urbaine",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="sun" class="w-4 h-4"></i></div><span>Jardin communautaire productif</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="waves" class="w-4 h-4"></i></div><span>Jacuzzi et sauna nordique</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="droplets" class="w-4 h-4"></i></div><span>Système de collecte d'eau de pluie</span></li>
                </ul>`,
        icon: "sun",
        floorPlan: {
            width: 20, depth: 15,
            walls: [
                { x: 0, y: 0, w: 100, h: 2 }, { x: 0, y: 98, w: 100, h: 2 }, // Top/Bottom borders
                { x: 0, y: 0, w: 2, h: 100 }, { x: 98, y: 0, w: 2, h: 100 }, // Left/Right borders
                { x: 60, y: 0, w: 2, h: 40 }, // Divider
            ],
            areas: [
                { label: "Jardin", x: 5, y: 5, w: 50, h: 90, sqm: 80 },
                { label: "Terrasse", x: 65, y: 5, w: 30, h: 50, sqm: 40 },
                { label: "Technique", x: 65, y: 60, w: 30, h: 35, sqm: 25 },
            ],
            furniture: [
                { type: "flower-2", x: 15, y: 20 }, { type: "flower-2", x: 15, y: 50 }, { type: "flower-2", x: 15, y: 80 },
                { type: "waves", x: 75, y: 20 }, // Jacuzzi
                { type: "armchair", x: 70, y: 40 }, { type: "armchair", x: 80, y: 40 }
            ],
            doors: [
                { x: 60, y: 30, w: 2, h: 5, vertical: true }
            ]
        }
    },
    residential: {
        title: "Étages 2 à 5 - Résidentiel",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="bed-double" class="w-4 h-4"></i></div><span>Suites privées (SDB, Walk-in, Balcon)</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="users" class="w-4 h-4"></i></div><span>Cuisine et salon partagé au cœur</span></li>
                </ul>`,
        icon: "home",
        floorPlan: {
            width: 20, depth: 15,
            walls: [
                { x: 0, y: 0, w: 100, h: 2 }, { x: 0, y: 98, w: 100, h: 2 },
                { x: 0, y: 0, w: 2, h: 100 }, { x: 98, y: 0, w: 2, h: 100 },
                // Central corridor walls
                { x: 35, y: 0, w: 2, h: 100 }, { x: 65, y: 0, w: 2, h: 100 },
                // Room dividers
                { x: 0, y: 33, w: 35, h: 2 }, { x: 0, y: 66, w: 35, h: 2 },
                { x: 65, y: 50, w: 35, h: 2 },
            ],
            areas: [
                { label: "Suite 101", x: 5, y: 5, w: 28, h: 25, sqm: 22 },
                { label: "Suite 102", x: 5, y: 38, w: 28, h: 25, sqm: 22 },
                { label: "Suite 103", x: 5, y: 71, w: 28, h: 25, sqm: 22 },
                { label: "Cuisine / Salon", x: 40, y: 5, w: 22, h: 90, sqm: 60 },
                { label: "Suite 104", x: 70, y: 5, w: 25, h: 42, sqm: 30 },
                { label: "Suite 105", x: 70, y: 55, w: 25, h: 40, sqm: 30 },
            ],
            furniture: [
                { type: "bed-double", x: 10, y: 10 }, { type: "bed-double", x: 10, y: 45 }, { type: "bed-double", x: 10, y: 80 },
                { type: "sofa", x: 48, y: 45 }, { type: "utensils", x: 48, y: 20 },
                { type: "bed-double", x: 80, y: 15 }, { type: "bed-double", x: 80, y: 65 }
            ],
            doors: [
                { x: 35, y: 15, w: 2, h: 4, vertical: true }, { x: 35, y: 48, w: 2, h: 4, vertical: true }, { x: 35, y: 81, w: 2, h: 4, vertical: true },
                { x: 65, y: 20, w: 2, h: 4, vertical: true }, { x: 65, y: 70, w: 2, h: 4, vertical: true }
            ]
        }
    },
    coworking: {
        title: "1er Étage - Vie Active",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="briefcase" class="w-4 h-4"></i></div><span>Espace de Coworking & Bureaux</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="coffee" class="w-4 h-4"></i></div><span>Café-bar</span></li>
                </ul>`,
        icon: "briefcase",
        floorPlan: {
            width: 20, depth: 15,
            walls: [
                { x: 0, y: 0, w: 100, h: 2 }, { x: 0, y: 98, w: 100, h: 2 },
                { x: 0, y: 0, w: 2, h: 100 }, { x: 98, y: 0, w: 2, h: 100 },
                { x: 0, y: 40, w: 100, h: 2 }, // Split Top/Bottom
                { x: 60, y: 40, w: 2, h: 60 }, // Split Bottom Right
            ],
            areas: [
                { label: "Open Space", x: 5, y: 5, w: 90, h: 32, sqm: 120 },
                { label: "Café", x: 5, y: 45, w: 50, h: 50, sqm: 80 },
                { label: "Salle Réunion", x: 65, y: 45, w: 30, h: 50, sqm: 45 },
            ],
            furniture: [
                { type: "monitor", x: 10, y: 10 }, { type: "monitor", x: 30, y: 10 }, { type: "monitor", x: 50, y: 10 },
                { type: "coffee", x: 20, y: 70 },
                { type: "presentation", x: 80, y: 70 }
            ],
            doors: [
                { x: 40, y: 40, w: 6, h: 2, vertical: false },
                { x: 60, y: 70, w: 2, h: 4, vertical: true }
            ]
        }
    },
    rdc: {
        title: "Rez-de-chaussée - Ancrage",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="utensils" class="w-4 h-4"></i></div><span>Restaurant Solidaire</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="heart-handshake" class="w-4 h-4"></i></div><span>Accueil</span></li>
                </ul>`,
        icon: "utensils",
        floorPlan: {
            width: 20, depth: 15,
            walls: [
                { x: 0, y: 0, w: 100, h: 2 }, { x: 0, y: 98, w: 100, h: 2 },
                { x: 0, y: 0, w: 2, h: 100 }, { x: 98, y: 0, w: 2, h: 100 },
                { x: 40, y: 0, w: 2, h: 100 }, // Split Left/Right
            ],
            areas: [
                { label: "Restaurant", x: 45, y: 5, w: 50, h: 90, sqm: 140 },
                { label: "Lobby / Accueil", x: 5, y: 5, w: 32, h: 90, sqm: 80 },
            ],
            furniture: [
                { type: "utensils-crossed", x: 60, y: 30 }, { type: "utensils-crossed", x: 80, y: 30 },
                { type: "utensils-crossed", x: 60, y: 70 }, { type: "utensils-crossed", x: 80, y: 70 },
                { type: "armchair", x: 15, y: 50 }
            ],
            doors: [
                { x: 40, y: 50, w: 2, h: 6, vertical: true },
                { x: 20, y: 98, w: 8, h: 2, vertical: false } // Entrance
            ]
        }
    },
    basement: {
        title: "Sous-sol - Logistique",
        content: `<ul class="space-y-4">
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="hammer" class="w-4 h-4"></i></div><span>Fablab</span></li>
                    <li class="flex items-start gap-3"><div class="mt-1 p-1 bg-primary/10 rounded text-primary"><i data-lucide="bike" class="w-4 h-4"></i></div><span>Garage vélos</span></li>
                </ul>`,
        icon: "hammer",
        floorPlan: {
            width: 20, depth: 15,
            walls: [
                { x: 0, y: 0, w: 100, h: 2 }, { x: 0, y: 98, w: 100, h: 2 },
                { x: 0, y: 0, w: 2, h: 100 }, { x: 98, y: 0, w: 2, h: 100 },
                { x: 0, y: 50, w: 100, h: 2 },
                { x: 50, y: 0, w: 2, h: 50 },
            ],
            areas: [
                { label: "Fablab", x: 5, y: 5, w: 42, h: 42, sqm: 60 },
                { label: "Stockage", x: 55, y: 5, w: 40, h: 42, sqm: 50 },
                { label: "Vélos & Tech", x: 5, y: 55, w: 90, h: 40, sqm: 110 },
            ],
            furniture: [
                { type: "hammer", x: 20, y: 20 },
                { type: "package", x: 70, y: 20 },
                { type: "bike", x: 20, y: 70 }, { type: "bike", x: 40, y: 70 }, { type: "zap", x: 80, y: 80 }
            ],
            doors: [
                { x: 25, y: 50, w: 4, h: 2, vertical: false },
                { x: 50, y: 25, w: 2, h: 4, vertical: true }
            ]
        }
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

// Main Interaction Function
function selectFloor(floorId) {
    currentFloorId = floorId;

    // Update Visuals
    document.querySelectorAll('.floor-plate').forEach(el => el.classList.remove('active'));
    if(floorId !== 'engineering') {
        const activeEl = document.querySelector(`.layer-${floorId}`);
        if(activeEl) activeEl.classList.add('active');
    }

    // Update Info Panel
    const infoPanel = document.getElementById('floor-info');
    const data = buildingData[floorId];

    if (!data) return;

    infoPanel.style.opacity = 0;
    setTimeout(() => {
        // Base Content
        let htmlContent = `
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-primary text-secondary rounded-xl shadow-lg">
                        <i data-lucide="${data.icon}" class="w-8 h-8"></i>
                    </div>
                    <h3 class="font-serif text-3xl text-primary">${data.title}</h3>
                </div>
                ${data.floorPlan ? `
                <button onclick="toggleUnit()" class="unit-toggle-btn">
                    <i data-lucide="ruler" class="w-4 h-4"></i>
                    <span>${currentUnit === 'metric' ? 'Métrique (m²)' : 'Impérial (pi²)'}</span>
                </button>
                ` : ''}
            </div>
        `;

        // Add 3D Floor Plan if available
        if (data.floorPlan) {
            htmlContent += renderFloorPlan(data.floorPlan);
            // Append textual description below
             htmlContent += `
            <div class="mt-6 text-stone-600 leading-relaxed text-lg border-t border-stone-200 pt-6">
                ${data.content}
            </div>`;
        } else {
            htmlContent += `
            <div class="text-stone-600 leading-relaxed text-lg">
                ${data.content}
            </div>
            `;
        }

        infoPanel.innerHTML = htmlContent;
        lucide.createIcons();
        infoPanel.style.opacity = 1;
    }, 300);
}

function toggleUnit() {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    if (currentFloorId) {
        selectFloor(currentFloorId);
    }
}

function renderFloorPlan(plan) {
    let html = `<div class="floor-plan-wrapper"><div class="floor-plan-scene">`;

    // Render Walls
    plan.walls.forEach(wall => {
        html += `<div class="fp-wall" style="left: ${wall.x}%; top: ${wall.y}%; width: ${wall.w}%; height: ${wall.h}%;"></div>`;
    });

    // Render Doors
    if (plan.doors) {
        plan.doors.forEach(door => {
             html += `<div class="fp-door" style="left: ${door.x}%; top: ${door.y}%; width: ${door.w}%; height: ${door.h}%;"></div>`;
        });
    }

    // Render Areas
    plan.areas.forEach(area => {
        const size = formatArea(area.sqm);
        html += `
            <div class="fp-area" style="left: ${area.x}%; top: ${area.y}%; width: ${area.w}%; height: ${area.h}%;" title="${area.label} (${size})">
                <span class="fp-label">${area.label}</span>
                <span class="fp-size">${size}</span>
            </div>
        `;
    });

    // Render Furniture
    if (plan.furniture) {
        plan.furniture.forEach(item => {
            html += `<i data-lucide="${item.type}" class="fp-furniture" style="left: ${item.x}%; top: ${item.y}%; width: 24px; height: 24px;"></i>`;
        });
    }

    html += `</div></div>`;
    return html;
}

function toggleEngineering() {
    const stack = document.getElementById('building-stack');
    stack.classList.toggle('engineering');

    if (stack.classList.contains('engineering')) {
        selectFloor('engineering');
    } else {
        selectFloor('roof'); // Reset to roof
    }
}
