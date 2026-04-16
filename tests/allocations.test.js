const test = require('node:test');
const assert = require('node:assert');
const AllocationsLogic = require('../allocations-logic.js');

test('AllocationsLogic.calculateSubtotal - excludes exterior by default', (t) => {
    const items = [
        { name: 'Room 1', area: 10, labels: ['privé'] },
        { name: 'Balcony', area: 5, labels: ['extérieur'] }
    ];
    const result = AllocationsLogic.calculateSubtotal(items);
    assert.strictEqual(result, 10);
});

test('AllocationsLogic.calculateSubtotal - includes exterior if requested', (t) => {
    const items = [
        { name: 'Room 1', area: 10, labels: ['privé'] },
        { name: 'Balcony', area: 5, labels: ['extérieur'] }
    ];
    const result = AllocationsLogic.calculateSubtotal(items, true);
    assert.strictEqual(result, 15);
});

test('AllocationsLogic.formatArea - handles conversion correctly', (t) => {
    // 10.7639 sqft = 1 m2 (approx)
    // formatArea uses 0.09290304 conversion
    // 1 / 0.09290304 = 10.7639
    const result = AllocationsLogic.formatArea(1);
    assert.ok(result.includes('1,00 m²'));
    assert.ok(result.includes('11 pi²')); // Math.round(10.76)
});

test('AllocationsLogic.validateSums - handles outdoor levels', (t) => {
    const floor = {
        name: 'Cour',
        total: 278.71,
        items: [{ area: 100, labels: ['extérieur'] }]
    };
    // Cour is always valid regardless of GFA sum
    assert.strictEqual(AllocationsLogic.validateSums(floor), true);
});

test('AllocationsLogic.calculateConstructionCost', (t) => {
    const cost = AllocationsLogic.calculateConstructionCost(100, 3000);
    assert.strictEqual(cost, 300000);
});
