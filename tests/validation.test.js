const test = require('node:test');
const assert = require('node:assert');
const AllocationsValidator = require('../validate-allocations.js');

test('AllocationsValidator - calculateSubtotal', () => {
    const items = [
        { name: 'Room 1', area: 10, labels: ['privé'] },
        { name: 'Room 2', area: 20, labels: ['partagé'] },
        { name: 'Balcony', area: 5, labels: ['extérieur'] }
    ];

    // Default (exclude exterior)
    assert.strictEqual(AllocationsValidator.calculateSubtotal(items), 30);

    // Include exterior
    assert.strictEqual(AllocationsValidator.calculateSubtotal(items, true), 35);
});

test('AllocationsValidator - getExpectedType', () => {
    assert.strictEqual(AllocationsValidator.getExpectedType({ name: 'Studio 101' }, []), 'privé');
    assert.strictEqual(AllocationsValidator.getExpectedType({ name: 'Terrasse' }, []), 'extérieur');
    assert.strictEqual(AllocationsValidator.getExpectedType({ name: 'Salon collectif' }, []), 'partagé');
    assert.strictEqual(AllocationsValidator.getExpectedType({ name: 'Ascenseur' }, []), 'partagé');

    // Case sensitivity and context
    assert.strictEqual(AllocationsValidator.getExpectedType({ name: 'vélo' }, ['sous-sol']), 'partagé');
});

test('AllocationsValidator - validateAllocationsData - valid data', () => {
    const data = {
        floors: [
            {
                name: 'Etage 1',
                total: 30,
                items: [
                    { name: 'Studio', area: 20, labels: ['privé'] },
                    { name: 'Salon', area: 10, labels: ['partagé'] }
                ]
            }
        ]
    };
    const issues = AllocationsValidator.validateAllocationsData(data);
    assert.strictEqual(issues.length, 0);
});

test('AllocationsValidator - validateAllocationsData - issues', () => {
    const data = {
        floors: [
            {
                name: 'Etage 1',
                total: 100,
                items: [
                    { name: 'Studio', area: 50, labels: ['partagé'] }, // Wrong label: expected privé
                    { name: 'Unknown', area: 40 } // Missing labels
                ]
            }
        ]
    };
    const issues = AllocationsValidator.validateAllocationsData(data);
    assert.ok(issues.length >= 2);
    assert.ok(issues.some(i => i.includes('somme des éléments')));
    assert.ok(issues.some(i => i.includes('labels incorrects')));
});

test('AllocationsValidator - validateItem - nested subitems', () => {
    const item = {
        name: 'Suite',
        area: 30,
        labels: ['privé'],
        subitems: [
            { name: 'Room A', area: 15, labels: ['privé'] },
            { name: 'Room B', area: 15, labels: ['privé'] }
        ]
    };
    const issues = [];
    AllocationsValidator.validateItem(item, ['Floor'], issues);
    assert.strictEqual(issues.length, 0);

    // Mismatch
    item.subitems[0].area = 10;
    const issues2 = [];
    AllocationsValidator.validateItem(item, ['Floor'], issues2);
    assert.ok(issues2.some(i => i.includes('somme des sous-éléments')));
});
