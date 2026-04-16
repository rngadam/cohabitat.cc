const test = require('node:test');
const assert = require('node:assert');
const AllocationsLogic = require('../allocations-logic.js');

test('AllocationsLogic.calculateSurfaceBreakdown', (t) => {
    const items = [
        { name: 'Room 1', area: 10, labels: ['privé'] },
        { name: 'Balcony', area: 5, labels: ['extérieur'] }
    ];
    const result = AllocationsLogic.calculateSurfaceBreakdown(items);
    assert.strictEqual(result.gfa, 10);
    assert.strictEqual(result.exterior, 5);
});

test('AllocationsLogic.calculateConstructionCost - dual rates', (t) => {
    const breakdown = { gfa: 100, exterior: 50 };
    const interiorRate = 3000;
    const exteriorRate = 1000;
    // (100 * 3000) + (50 * 1000) = 300,000 + 50,000 = 350,000
    const cost = AllocationsLogic.calculateConstructionCost(breakdown, interiorRate, exteriorRate);
    assert.strictEqual(cost, 350000);
});

test('AllocationsLogic.calculateSubtotal - excludes exterior by default', (t) => {
    const items = [
        { name: 'Room 1', area: 10, labels: ['privé'] },
        { name: 'Balcony', area: 5, labels: ['extérieur'] }
    ];
    const result = AllocationsLogic.calculateSubtotal(items);
    assert.strictEqual(result, 10);
});
