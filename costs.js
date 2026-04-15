class CostCalculator {
    constructor(params, allocations) {
        this.params = params;
        this.allocations = allocations;
    }

    calculateTotalArea() {
        // We use the same logic as in architecture.html
        return this.allocations.floors.reduce((sum, floor) => sum + floor.total, 0);
    }

    calculateTotalConstructionCost() {
        const totalAreaSqFt = this.calculateTotalArea();
        const totalAreaM2 = totalAreaSqFt * this.params.constants.sqft_to_m2;
        return totalAreaM2 * this.params.construction.max_cost_m2_2023;
    }

    calculateMortgageDetails() {
        const totalCost = this.calculateTotalConstructionCost();
        const downpayment = totalCost * (this.params.mortgage.downpayment_pct / 100);
        const principal = totalCost - downpayment;
        const annualRate = this.params.mortgage.interest_rate_pct / 100;
        const monthlyRate = annualRate / 12;
        const numberOfPayments = this.params.mortgage.amortization_years * 12;

        const monthlyPayment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        return {
            totalCost,
            downpayment,
            principal,
            monthlyPayment,
            annualPayment: monthlyPayment * 12
        };
    }

    calculateRecurringCosts() {
        const totalCost = this.calculateTotalConstructionCost();
        const municipalTax = totalCost * (this.params.taxes_and_fees.municipal_tax_rate_pct / 100);
        const schoolTax = totalCost * (this.params.taxes_and_fees.school_tax_rate_pct / 100);
        const insurance = totalCost * (this.params.taxes_and_fees.insurance_rate_pct / 100);
        const reserveFund = totalCost * (this.params.taxes_and_fees.reserve_fund_rate_pct / 100);

        const totalAnnual = municipalTax + schoolTax + insurance + reserveFund;

        return {
            municipalTax,
            schoolTax,
            insurance,
            reserveFund,
            totalAnnual,
            totalMonthly: totalAnnual / 12
        };
    }

    calculateRentalIncome() {
        let totalRentalAreaSqFt = 0;
        this.allocations.floors.forEach(floor => {
            floor.items.forEach(item => {
                const labels = Array.isArray(item.labels) ? item.labels : (typeof item.labels === 'string' ? [item.labels] : []);
                if (labels.includes('location')) {
                    totalRentalAreaSqFt += item.area;
                }
            });
        });

        const annualIncome = totalRentalAreaSqFt * this.params.constants.comm_rent_sqft_year;
        return {
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
        
        const totalAnnualGross = mortgage.annualPayment + recurring.totalAnnual + bonds.annualPayment;
        const totalAnnualNet = totalAnnualGross - rental.annualIncome;
        
        const totalMonthlyGross = totalAnnualGross / 12;
        const totalMonthlyNet = totalAnnualNet / 12;

        return {
            mortgage,
            recurring,
            rental,
            bonds,
            totalAnnualGross,
            totalAnnualNet,
            totalMonthlyGross,
            totalMonthlyNet
        };
    }

    calculatePerSuiteCosts() {
        const global = this.calculateGlobalCosts();
        const numSuites = this.params.population.total_suites;
        const numHolders = this.params.community_bonds.holders_count;

        const baseMonthlyNet = global.totalMonthlyNet / numSuites;

        return {
            totalMonthlyGross: global.totalMonthlyGross / numSuites,
            totalMonthlyNet: baseMonthlyNet,
            constructionCost: global.mortgage.totalCost / numSuites,
            downpaymentPerSuite: global.mortgage.downpayment / numSuites,
            downpaymentPerFounder: global.mortgage.downpayment / numHolders,
            monthlyMortgage: global.mortgage.monthlyPayment / numSuites,
            monthlyRecurring: global.recurring.totalMonthly / numSuites,
            monthlyRentalOffset: global.rental.monthlyIncome / numSuites,
            monthlyBondDebtService: global.bonds.monthlyPayment / numSuites,
            monthlyBondRepaymentToFounder: global.bonds.paymentPerHolder,
            totalMonthlyNetFounder: baseMonthlyNet - global.bonds.paymentPerHolder
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CostCalculator;
}
