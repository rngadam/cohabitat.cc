(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AllocationsValidator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  function formatArea(areaSqM) {
    return `${areaSqM.toFixed(2)} m²`;
  }

  function calculateSubtotal(items, includeExterior = false) {
    // Round to 2 decimals to avoid floating point issues (e.g. 0.1 + 0.2)
    const sum = items.reduce((sum, item) => {
      const labels = getLabelsList(item);
      if (!includeExterior && labels.includes('extérieur')) {
        return sum; // Skip exterior items in GFA subtotal
      }
      return sum + item.area;
    }, 0);
    return Math.round(sum * 100) / 100;
  }

  function getLabelsList(item) {
    if (Array.isArray(item.labels)) {
      return item.labels;
    }
    if (typeof item.labels === 'string') {
      return [item.labels];
    }
    return [];
  }

  function getExpectedType(item, path) {
    const name = item.name.toLowerCase();
    const floorName = (path[0] || '').toLowerCase();
    const exteriorKeys = [
      'balcons privés',
      'terrasse',
      'préau',
      'jardin',
      'verger',
      'bbq',
      'circulation piétonne',
      'infrastructure verte',
      'plates-formes solaires',
      'éoliennes'
    ];
    const interiorBikeStorageKeys = [
      'stationnement vélos',
      'stationnement vélo',
      'vélos-cargos'
    ];
    const sharedKeys = [
      'resto',
      'café',
      'accueil',
      'zone d\'échange',
      'stockage service',
      'stockage',
      'circulation',
      'vestiaire',
      'atelier vélo',
      'fablab',
      'réparation',
      'logistique',
      'livraison',
      'maintenance',
      'support technique',
      'salon collectif',
      'coworking',
      'micro-fablab',
      'atelier créatif',
      'réunions',
      'formation',
      'buanderie',
      'conciergerie',
      'technique',
      'entretien',
      'sauna',
      'bain tourbillon',
      'espace détente'
    ];
    const privateKeys = [
      'studio',
      'espace principal',
      'salle de bain',
      'bain',
      'toilette',
      'douche',
      'kitchenette',
      'walk-in closet',
      'cage',
      'grillagée'
    ];

    if (name.includes('ascenseur') || name.includes('escalier')) {
      return 'partagé';
    }
    if (name.includes('partagé') || name.includes('partage')) {
      return 'partagé';
    }
    if (name.includes('studio') && (name.includes('média') || name.includes('podcast')) ) {
      return 'partagé';
    }
    if (exteriorKeys.some(key => name.includes(key))) {
      return 'extérieur';
    }
    if (interiorBikeStorageKeys.some(key => name.includes(key)) && floorName === 'sous-sol') {
      return 'partagé';
    }
    if (name.includes('privé')) {
      return 'privé';
    }
    if (name.includes('extérieur') || name.includes('exterieur')) {
      return 'extérieur';
    }

    if (name.includes('comptoir') && path.some(p => p.toLowerCase().includes('salle de bain'))) {
      return 'privé';
    }
    if (sharedKeys.some(key => name.includes(key))) {
      return 'partagé';
    }
    if (privateKeys.some(key => name.includes(key))) {
      return 'privé';
    }

    if (['cour', 'toit'].includes(floorName)) {
      return 'extérieur';
    }
    if (['mezzanine', 'sous-sol', 'rez-de-chaussée'].includes(floorName)) {
      return 'partagé';
    }

    return null;
  }

  function validateItem(item, path, issues) {
    const itemPath = [...path, item.name].join(' > ');
    const expectedType = getExpectedType(item, path);
    const labelsList = getLabelsList(item);
    const isExteriorChild = labelsList.includes('extérieur');

    if (!item.labels) {
      issues.push(`${itemPath}: labels manquant${expectedType ? ` (attendu: ${expectedType})` : ''}`);
    } else if (expectedType && !labelsList.includes(expectedType)) {
      issues.push(`${itemPath}: labels incorrects (${Array.isArray(item.labels) ? item.labels.join(' / ') : item.labels}) — attendu: ${expectedType}`);
    }

    if (item.subitems) {
      const subTotal = calculateSubtotal(item.subitems, isExteriorChild);
      const EPSILON = 0.05; // Tolerance for cumulative rounding offsets
      if (Math.abs(subTotal - item.area) > EPSILON) {
        issues.push(`${itemPath}: somme des sous-éléments (${formatArea(subTotal)}) ≠ total (${formatArea(item.area)})`);
      }
      item.subitems.forEach(subitem => validateItem(subitem, [...path, item.name], issues));
    }
  }

  function validateAllocationsData(data) {
    const issues = [];
    data.floors.forEach(floor => {
      const floorSum = calculateSubtotal(floor.items);
      const EPSILON = 0.05;
      const isOutdoorLevel = ['toit', 'cour'].includes(floor.name.toLowerCase());
      if (!isOutdoorLevel && Math.abs(floorSum - floor.total) > EPSILON) {
        issues.push(`${floor.name}: somme des éléments (${formatArea(floorSum)}) ≠ total (${formatArea(floor.total)})`);
      }
      floor.items.forEach(item => validateItem(item, [floor.name], issues, floor.name));
    });
    return issues;
  }

  function validateAllocationsFile(filePath) {
    if (!filePath) {
      throw new Error('Veuillez fournir le chemin du fichier allocations.json en argument.');
    }
    const fs = require('fs');
    const path = require('path');
    const resolvedPath = path.resolve(process.cwd(), filePath);
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const data = JSON.parse(raw);
    const issues = validateAllocationsData(data);
    return { data, issues };
  }

  function runCli() {
    const args = process.argv.slice(2);
    const filePath = args[0] || 'allocations.json';
    try {
      const { issues } = validateAllocationsFile(filePath);
      if (issues.length === 0) {
        console.log(`Validation OK pour ${filePath}`);
        process.exit(0);
      }
      console.error(`Validation échouée (${issues.length} problèmes) :`);
      issues.forEach(issue => console.error(`- ${issue}`));
      process.exit(1);
    } catch (error) {
      console.error(`Erreur de validation : ${error.message}`);
      process.exit(2);
    }
  }

  const api = {
    formatArea,
    calculateSubtotal,
    getExpectedType,
    validateItem,
    validateAllocationsData,
    validateAllocationsFile
  };

  if (typeof module === 'object' && module.exports && require.main === module) {
    runCli();
  }

  return api;
}));