const test = require('node:test');
const assert = require('node:assert');
const AllocationsLogic = require('../allocations-logic.js');

test('AllocationsLogic.calculateSurfaceBreakdown', () => {
    const items = [
        { name: 'Room 1', area: 10, labels: ['privé'] },
        { name: 'Balcony', area: 5, labels: ['extérieur'] }
    ];
    const result = AllocationsLogic.calculateSurfaceBreakdown(items);
    assert.strictEqual(result.gfa, 10);
    assert.strictEqual(result.exterior, 5);
});

test('AllocationsLogic.calculateConstructionCost - dual rates', () => {
    const breakdown = { gfa: 100, exterior: 50 };
    const interiorRate = 3000;
    const exteriorRate = 1000;
    // (100 * 3000) + (50 * 1000) = 300,000 + 50,000 = 350,000
    const cost = AllocationsLogic.calculateConstructionCost(breakdown, interiorRate, exteriorRate);
    assert.strictEqual(cost, 350000);
});

test('AllocationsLogic.calculateSubtotal - excludes exterior by default', () => {
    assert.strictEqual(AllocationsLogic.calculateSubtotal([{ area: 10, labels: ['privé'] }, { area: 5, labels: ['exterieur'] }]), 15);
    assert.strictEqual(AllocationsLogic.calculateSubtotal(null), 0);
    assert.strictEqual(AllocationsLogic.calculateSubtotal({}), 0);
});

test('AllocationsLogic.formatArea', () => {
    assert.strictEqual(AllocationsLogic.formatArea(100), '100,00 m² (1,076 pi²)');
    assert.strictEqual(AllocationsLogic.formatArea('invalid'), '0,00 m² (0 pi²)');
});

test('AllocationsLogic.validateSums', () => {
    // Standard level
    assert.strictEqual(AllocationsLogic.validateSums({ name: 'Etage 1', total: 100, items: [{ area: 100 }] }), true);
    assert.strictEqual(AllocationsLogic.validateSums({ name: 'Etage 1', total: 100, items: [{ area: 90 }] }), false);

    // Outdoor levels
    assert.strictEqual(AllocationsLogic.validateSums({ name: 'Toit', total: 100, items: [{ area: 50 }] }), true);
    assert.strictEqual(AllocationsLogic.validateSums({ name: 'Cour', total: 100, items: [{ area: 10 }] }), true);
});
