class CostCalculator {
    constructor(params, allocations, opex) {
        this.params = params;
        this.allocations = allocations;
        this.opex = opex;
        this.M2_TO_SQFT = 10.7639104; // Used for display only
    }

    calculateTotalAreaM2() {
        return this.allocations.floors.reduce((sum, floor) => sum + floor.total, 0);
    }

    calculateTotalConstructionCost() {
        const totalAreaM2 = this.calculateTotalAreaM2();
        return totalAreaM2 * this.params.construction.max_cost_m2;
    }

    calculateTotalInvestment() {
        const landCost = this.params.construction.land_cost || 0;
        const constructionCost = this.calculateTotalConstructionCost();
        return landCost + constructionCost;
    }

    calculateMortgageDetails() {
        const totalInvestment = this.calculateTotalInvestment();
        const downpayment = totalInvestment * (this.params.mortgage.downpayment_pct / 100);
        const principal = totalInvestment - downpayment;
        const annualRate = this.params.mortgage.interest_rate_pct / 100;
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
        const municipalTax = totalInvestment * (this.params.taxes_and_fees.municipal_tax_rate_pct / 100);
        const schoolTax = totalInvestment * (this.params.taxes_and_fees.school_tax_rate_pct / 100);
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
        const totalConstruction = this.calculateTotalConstructionCost();
        const bondPrincipal = totalConstruction * (this.params.mortgage.downpayment_pct / 100);
        const annualRate = this.params.community_bonds.interest_rate_pct / 100;
        const monthlyRate = annualRate / 12;
        const numberOfPayments = this.params.community_bonds.amortization_years * 12;

        const monthlyPayment = bondPrincipal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        return {
            principal: bondPrincipal,
            monthlyPayment,
            annualPayment: monthlyPayment * 12,
            paymentPerHolder: monthlyPayment / this.params.community_bonds.holders_count
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
        const numHolders = this.params.community_bonds.holders_count;

        // Floating rooms revenue logic
        // They pay 50% price with 80% occupancy. 
        // Effective suite equivalents: 31 + (10 * 0.5 * 0.8) = 35
        const floatingConfig = this.params.floating_rooms;
        const suiteEquivalents = numSuites + (floatingConfig.count * (floatingConfig.price_pct / 100) * (floatingConfig.occupancy_rate_pct / 100));
        
        const baseMonthlyNet = global.totalMonthlyNet / suiteEquivalents;
        const floatingRoomRevenue = baseMonthlyNet * (suiteEquivalents - numSuites);

        return {
            totalMonthlyNet: baseMonthlyNet,
            constructionCost: global.mortgage.totalCost / numSuites, // Construction cost still shared by permanent residences
            downpaymentPerFounder: global.mortgage.downpayment / numHolders,
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
