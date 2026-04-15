const fs = require('fs');
const CostCalculator = require('./costs.js');

const params = JSON.parse(fs.readFileSync('parametres.json', 'utf8'));
const allocations = JSON.parse(fs.readFileSync('allocations.json', 'utf8'));
const opex = JSON.parse(fs.readFileSync('opex.json', 'utf8'));

const calculator = new CostCalculator(params, allocations, opex);

const globalCosts = calculator.calculateGlobalCosts();
const perSuite = calculator.calculatePerSuiteCosts();

const output = {
    "Surface Totale (m2)": calculator.calculateTotalAreaM2().toFixed(2),
    "Surface Locative (m2)": globalCosts.rental.totalRentalAreaM2.toFixed(2),
    "Revenus Locatifs Mensuels": globalCosts.rental.monthlyIncome.toFixed(2) + " $",
    "Coût Construction Global": globalCosts.mortgage.totalCost.toFixed(2) + " $",
    "Coût Mensuel Net Bâtiment": globalCosts.totalMonthlyNet.toFixed(2) + " $",
    "OPEX Mensuel (Services + Énergie + Amort.)": (globalCosts.recurring.monthlyServices + globalCosts.recurring.monthlyEnergy + globalCosts.recurring.monthlyAmortization).toFixed(2) + " $",
    [`Pour Standard (36 suites)`]: {
        "Coût Net / mois": perSuite.totalMonthlyNet.toFixed(2) + " $",
        "Part OPEX / mois": (perSuite.monthlyRecurring).toFixed(2) + " $"
    },
    [`Pour Co-fondateur (12 co-fondateurs)`]: {
        "Mise de fonds initial": perSuite.downpaymentPerFounder.toFixed(2) + " $",
        "Remboursement mensuel recu": perSuite.monthlyBondRepaymentToFounder.toFixed(2) + " $",
        "Coût Net Effectif / mois": perSuite.totalMonthlyNetFounder.toFixed(2) + " $"
    }
};

console.log(JSON.stringify(output, null, 2));
