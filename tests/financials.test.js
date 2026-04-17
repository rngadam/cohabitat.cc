const test = require('node:test');
const assert = require('node:assert');
const CostCalculator = require('../costs.js');

test('CostCalculator - edge cases for coverage', () => {
    // Missing pre_development_breakdown
    const calcNoPreDev = new CostCalculator({ construction: { max_cost_m2: 1000 } }, { floors: [] }, {});
    assert.strictEqual(calcNoPreDev.calculatePreDevTotal(), 0);

    // Labels as strings and other types in calculateRentalIncome
    const params = { constants: { comm_rent_sqft_year: 10 } };
    const allocations = {
        floors: [
            { items: [
                { name: 'S1', area: 10, labels: 'location' }, // string label
                { name: 'S2', area: 10, labels: null },       // null label
                { name: 'S3', area: 10, labels: ['location'] } // array label
            ] }
        ]
    };
    const calcLabels = new CostCalculator(params, allocations, {});
    const rental = calcLabels.calculateRentalIncome();
    assert.strictEqual(rental.totalRentalAreaM2, 20); // S1 + S3
});

test('CostCalculator - basic area and pre-dev calculations', () => {
    const params = {
        pre_development_breakdown: {
            intervenants: [
                { name: 'Role 1', rate: 100, hours: 10 }, // 1000
                { name: 'Role 2', rate: 50, hours: 20 }   // 1000
            ]
        },
        construction: {
            max_cost_m2: 3000,
            land_cost: 500000
        },
        scenarios: {
            modular_reduction_pct: 10
        }
    };
    const allocations = {
        floors: [
            { name: 'F1', total: 100 },
            { name: 'F2', total: 100 }
        ]
    };
    const opex = {
        monthly_services: {},
        energy_costs: { electricity_heat_per_m2_year: 0 },
        equipment_amortization: []
    };

    const calc = new CostCalculator(params, allocations, opex);

    assert.strictEqual(calc.calculateTotalAreaM2(), 200);
    assert.strictEqual(calc.calculatePreDevTotal(), 2000);
    assert.strictEqual(calc.calculateTotalConstructionCost(), 600000); // 200 * 3000
    assert.strictEqual(calc.calculateTotalInvestment(), 1100000); // 600000 + 500000
});

test('CostCalculator - modular scenario', () => {
    const params = {
        construction: { max_cost_m2: 3000 },
        scenarios: { modular_reduction_pct: 10 }
    };
    const allocations = { floors: [{ total: 100 }] };
    const opex = {};

    // Without modular
    const calcNormal = new CostCalculator(params, allocations, opex);
    assert.strictEqual(calcNormal.calculateTotalConstructionCost(), 300000);

    // With modular
    const calcModular = new CostCalculator(params, allocations, opex, { modular: true });
    assert.strictEqual(calcModular.calculateTotalConstructionCost(), 270000); // 300000 * 0.9
});

test('CostCalculator - land grant scenario', () => {
    const params = {
        construction: { max_cost_m2: 3000, land_cost: 500000 }
    };
    const allocations = { floors: [{ total: 100 }] };

    // Normal
    const calcNormal = new CostCalculator(params, allocations, {});
    assert.strictEqual(calcNormal.calculateTotalInvestment(), 800000);

    // Land grant
    const calcGrant = new CostCalculator(params, allocations, {}, { landGrant: true });
    assert.strictEqual(calcGrant.calculateTotalInvestment(), 300000);
});

test('CostCalculator - mortgage details', () => {
    const params = {
        construction: { max_cost_m2: 1000, land_cost: 0 },
        mortgage: {
            downpayment_pct: 20,
            interest_rate_pct: 6,
            amortization_years: 25
        },
        scenarios: {
            target_interest_rate_pct: 3
        }
    };
    const allocations = { floors: [{ total: 1000 }] }; // 1,000,000 investment

    const calc = new CostCalculator(params, allocations, {});
    const details = calc.calculateMortgageDetails();

    assert.strictEqual(details.totalInvestment, 1000000);
    assert.strictEqual(details.downpayment, 200000);
    assert.strictEqual(details.principal, 800000);

    // Simple verification of PMT magnitude
    assert.ok(details.monthlyPayment > 5000 && details.monthlyPayment < 6000);

    // Test APH Select override
    const calcAPH = new CostCalculator(params, allocations, {}, { aphSelect: true });
    const detailsAPH = calcAPH.calculateMortgageDetails();
    assert.ok(detailsAPH.monthlyPayment < details.monthlyPayment);
});

test('CostCalculator - rental income', () => {
    const params = {
        constants: { comm_rent_sqft_year: 30 }
    };
    const allocations = {
        floors: [
            { items: [{ name: 'Shop', area: 50, labels: ['location'] }] }
        ]
    };
    const calc = new CostCalculator(params, allocations, {});
    const rental = calc.calculateRentalIncome();

    assert.strictEqual(rental.totalRentalAreaM2, 50);
    // 50 * 10.7639... * 30 / 12
    assert.ok(rental.monthlyIncome > 1300 && rental.monthlyIncome < 1400);
});

test('CostCalculator - recurring costs', () => {
    const params = {
        construction: { max_cost_m2: 1000, land_cost: 0 },
        taxes_and_fees: {
            municipal_tax_rate_pct: 1,
            school_tax_rate_pct: 0.1,
            insurance_rate_pct: 0.2,
            reserve_fund_rate_pct: 0.5
        }
    };
    const allocations = { floors: [{ total: 1000 }] }; // 1M investment
    const opex = {
        monthly_services: { s1: 100, s2: 200 },
        energy_costs: { electricity_heat_per_m2_year: 12 }, // 1000 * 12 / 12 = 1000/mo
        equipment_amortization: [
            { capital_value: 12000, lifespan_years: 10 } // 1200/yr = 100/mo
        ]
    };

    const calc = new CostCalculator(params, allocations, opex);
    const recurring = calc.calculateRecurringCosts();

    assert.strictEqual(recurring.municipalTax, 10000);
    assert.strictEqual(recurring.monthlyServices, 300);
    assert.strictEqual(recurring.monthlyEnergy, 1000);
    assert.strictEqual(recurring.monthlyAmortization, 100);

    // Test tax exemption
    const calcExempt = new CostCalculator(params, allocations, opex, { taxExemption: true });
    const recurringExempt = calcExempt.calculateRecurringCosts();
    assert.strictEqual(recurringExempt.municipalTax, 0);
    assert.strictEqual(recurringExempt.schoolTax, 0);
});

test('CostCalculator - global and per-suite costs', () => {
    const params = {
        pre_development_breakdown: { intervenants: [] },
        construction: { max_cost_m2: 1000, land_cost: 0 },
        mortgage: { downpayment_pct: 20, interest_rate_pct: 6, amortization_years: 25 },
        taxes_and_fees: { municipal_tax_rate_pct: 0, school_tax_rate_pct: 0, insurance_rate_pct: 0, reserve_fund_rate_pct: 0 },
        constants: { comm_rent_sqft_year: 0 },
        community_bonds: { interest_rate_pct: 4, amortization_years: 10, holders_count: 12 },
        population: { total_suites: 35 },
        floating_rooms: { count: 10, price_pct: 50, occupancy_rate_pct: 80 }
    };
    const allocations = { floors: [{ total: 1000, items: [] }] };
    const opex = { monthly_services: {}, energy_costs: { electricity_heat_per_m2_year: 0 }, equipment_amortization: [] };

    const calc = new CostCalculator(params, allocations, opex);
    const global = calc.calculateGlobalCosts();
    const perSuite = calc.calculatePerSuiteCosts();

    assert.ok(global.totalMonthlyNet > 0);
    assert.ok(perSuite.totalMonthlyNet > 0);
    assert.strictEqual(perSuite.constructionCost, 1000000 / 35);
});

test('CostCalculator - community bonds details', () => {
    const params = {
        construction: { max_cost_m2: 1000, land_cost: 0 },
        mortgage: { downpayment_pct: 20 },
        pre_development_breakdown: { intervenants: [{ rate: 100, hours: 100 }] }, // 10k
        community_bonds: { interest_rate_pct: 4, amortization_years: 10, holders_count: 10 }
    };
    const allocations = { floors: [{ total: 1000 }] }; // 1M
    // Cash downpayment = 200k. Sweat = 10k. Total bond = 210k.

    const calc = new CostCalculator(params, allocations, {});
    const bonds = calc.calculateCommunityBondsDetails();

    assert.strictEqual(bonds.cashPrincipal, 200000);
    assert.strictEqual(bonds.sweatPrincipal, 10000);
    assert.strictEqual(bonds.principal, 210000);

    // Test Fonds Plancher override
    const calcSubsidized = new CostCalculator(params, allocations, {}, { fondsPlancher: true });
    const bondsSub = calcSubsidized.calculateCommunityBondsDetails();
    assert.strictEqual(bondsSub.sweatPrincipal, 0);
    assert.strictEqual(bondsSub.principal, 200000);
});
