class CostCalculator {
    constructor(params, allocations, opex, overrides = {}) {
        this.params = params;
        this.allocations = allocations;
        this.opex = opex;
        this.overrides = overrides; // { landGrant, modular, aphSelect, taxExemption }
        this.M2_TO_SQFT = 10.7639104; // Used for display only
    }

    calculateTotalAreaM2() {
        return this.allocations.floors.reduce((sum, floor) => sum + floor.total, 0);
    }

    calculatePreDevTotal() {
        if (!this.params.pre_development_breakdown) return 0;
        return this.params.pre_development_breakdown.intervenants.reduce((sum, item) => {
            return sum + (item.rate * item.hours);
        }, 0);
    }

    calculateTotalConstructionCost() {
        const totalAreaM2 = this.calculateTotalAreaM2();
        let cost = totalAreaM2 * this.params.construction.max_cost_m2;
        
        // Scenario: Modular Construction
        if (this.overrides.modular) {
            const reduction = this.params.scenarios.modular_reduction_pct / 100;
            cost = cost * (1 - reduction);
        }
        
        return cost;
    }

    calculateTotalInvestment() {
        const constructionCost = this.calculateTotalConstructionCost();
        
        // Scenario: Municipal Land Grant (Eases land cost)
        if (this.overrides.landGrant) {
            return constructionCost;
        }
        
        const landCost = this.params.construction.land_cost || 0;
        return landCost + constructionCost;
    }

    calculateMortgageDetails() {
        const totalInvestment = this.calculateTotalInvestment();
        const downpayment = totalInvestment * (this.params.mortgage.downpayment_pct / 100);
        const principal = totalInvestment - downpayment;
        
        // Scenario: APH Select Interest Rate
        let annualRate = this.params.mortgage.interest_rate_pct / 100;
        if (this.overrides.aphSelect) {
            annualRate = this.params.scenarios.target_interest_rate_pct / 100;
        }
        
        const monthlyRate = annualRate / 12;
        const numberOfPayments = this.params.mortgage.amortization_years * 12;

        const monthlyPayment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        return {
            totalInvestment,
            downpayment,
            principal,
            monthlyPayment,
            annualPayment: monthlyPayment * 12
        };
    }

    calculateRecurringCosts() {
        const totalInvestment = this.calculateTotalInvestment();
        const totalAreaM2 = this.calculateTotalAreaM2();
        
        // Taxes and Insurance
        let municipalTax = totalInvestment * (this.params.taxes_and_fees.municipal_tax_rate_pct / 100);
        let schoolTax = totalInvestment * (this.params.taxes_and_fees.school_tax_rate_pct / 100);
        
        // Scenario: Tax Exemption
        if (this.overrides.taxExemption) {
            municipalTax = 0;
            schoolTax = 0;
        }

        const insurance = totalInvestment * (this.params.taxes_and_fees.insurance_rate_pct / 100);
        const reserveFund = totalInvestment * (this.params.taxes_and_fees.reserve_fund_rate_pct / 100);

        // Operational Expenses (OPEX) from opex.json
        const monthlyServices = Object.values(this.opex.monthly_services).reduce((a, b) => a + b, 0);
        const monthlyEnergy = (this.opex.energy_costs.electricity_heat_per_m2_year * totalAreaM2) / 12;
        
        // Amortization
        let annualAmortization = 0;
        this.opex.equipment_amortization.forEach(equip => {
            annualAmortization += equip.capital_value / equip.lifespan_years;
        });
        const monthlyAmortization = annualAmortization / 12;

        const totalMonthlyFixed = (municipalTax + schoolTax + insurance + reserveFund) / 12;
        const totalMonthlyOpex = monthlyServices + monthlyEnergy + monthlyAmortization;

        return {
            municipalTax,
            schoolTax,
            insurance,
            reserveFund,
            monthlyServices,
            monthlyEnergy,
            monthlyAmortization,
            totalMonthly: totalMonthlyFixed + totalMonthlyOpex
        };
    }

    calculateRentalIncome() {
        let totalRentalAreaM2 = 0;
        this.allocations.floors.forEach(floor => {
            floor.items.forEach(item => {
                const labels = Array.isArray(item.labels) ? item.labels : (typeof item.labels === 'string' ? [item.labels] : []);
                if (labels.includes('location')) {
                    totalRentalAreaM2 += item.area;
                }
            });
        });

        // Current rent constant is $/sqft/year. Let's convert area to sqft for the calculation
        const totalRentalAreaSqFt = totalRentalAreaM2 * this.M2_TO_SQFT;
        const annualIncome = totalRentalAreaSqFt * this.params.constants.comm_rent_sqft_year;
        
        return {
            totalRentalAreaM2,
            totalRentalAreaSqFt,
            annualIncome,
            monthlyIncome: annualIncome / 12
        };
    }

    calculateCommunityBondsDetails() {
        const totalConstructionAndLand = this.calculateTotalInvestment();
        const cashDownpayment = totalConstructionAndLand * (this.params.mortgage.downpayment_pct / 100);
        
        // Sweat Equity (Pre-dev)
        let preDevTotal = this.calculatePreDevTotal();
        if (this.overrides.fondsPlancher) {
            preDevTotal = 0; // Subsidized
        }

        const bondPrincipal = cashDownpayment + preDevTotal;
        const annualRate = this.params.community_bonds.interest_rate_pct / 100;
        const monthlyRate = annualRate / 12;
        const numberOfPayments = this.params.community_bonds.amortization_years * 12;

        const monthlyPayment = bondPrincipal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        return {
            cashPrincipal: cashDownpayment,
            sweatPrincipal: preDevTotal,
            principal: bondPrincipal,
            monthlyPayment,
            annualPayment: monthlyPayment * 12,
            paymentPerHolder: monthlyPayment / (this.overrides.holdersCount || this.params.community_bonds.holders_count)
        };
    }

    calculateGlobalCosts() {
        const mortgage = this.calculateMortgageDetails();
        const recurring = this.calculateRecurringCosts();
        const rental = this.calculateRentalIncome();
        const bonds = this.calculateCommunityBondsDetails();
        
        const totalMonthlyNet = mortgage.monthlyPayment + recurring.totalMonthly + bonds.monthlyPayment - rental.monthlyIncome;

        return {
            mortgage,
            recurring,
            rental,
            bonds,
            totalMonthlyNet
        };
    }

    calculatePerSuiteCosts() {
        const global = this.calculateGlobalCosts();
        const numSuites = this.params.population.total_suites;
        const numHolders = this.overrides.holdersCount || this.params.community_bonds.holders_count;

        // Floating rooms revenue logic
        // They pay 50% price with 80% occupancy. 
        // Effective suite equivalents: 31 + (10 * 0.5 * 0.8) = 35
        const floatingConfig = this.params.floating_rooms;
        const suiteEquivalents = numSuites + (floatingConfig.count * (floatingConfig.price_pct / 100) * (floatingConfig.occupancy_rate_pct / 100));
        
        const baseMonthlyNet = global.totalMonthlyNet / suiteEquivalents;
        const floatingRoomRevenue = baseMonthlyNet * (suiteEquivalents - numSuites);

        return {
            totalMonthlyNet: baseMonthlyNet,
            constructionCost: global.mortgage.totalInvestment / numSuites, 
            downpaymentPerFounder: global.bonds.cashPrincipal / numHolders,
            sweatEquityPerFounder: global.bonds.sweatPrincipal / numHolders,
            monthlyMortgage: global.mortgage.monthlyPayment / numSuites,
            monthlyRecurring: global.recurring.totalMonthly / numSuites,
            monthlyRentalOffset: global.rental.monthlyIncome / numSuites,
            monthlyBondDebtService: global.bonds.monthlyPayment / numSuites,
            monthlyBondRepaymentToFounder: global.bonds.paymentPerHolder,
            totalMonthlyNetFounder: baseMonthlyNet - global.bonds.paymentPerHolder,
            floatingRoomRevenue,
            floatingRoomPrice: baseMonthlyNet * (floatingConfig.price_pct / 100)
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CostCalculator;
}
