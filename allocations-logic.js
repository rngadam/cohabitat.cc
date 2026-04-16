/**
 * Logic for Cohabitat.cc spatial and financial calculations.
 */

const AllocationsLogic = {
    /**
     * Formats an area in m2 and sqft.
     */
    formatArea: function(areaSqM) {
        if (typeof areaSqM !== 'number') return '0.00 m² (0 pi²)';
        const areaSqFt = Math.round(areaSqM / 0.09290304);
        return `${areaSqM.toFixed(2).replace('.', ',')} m² (${areaSqFt} pi²)`;
    },

    /**
     * Gets labels list from an item.
     */
    getLabelsList: function(item) {
        if (Array.isArray(item.labels)) return item.labels;
        if (typeof item.labels === 'string') return [item.labels];
        return [];
    },

    /**
     * Calculates the subtotal of a list of items.
     * By default, excludes items labeled 'extérieur' from the sum (Strict GFA).
     */
    calculateSubtotal: function(items, includeExterior = false) {
        if (!items || !Array.isArray(items)) return 0;
        const sum = items.reduce((sum, item) => {
            const labels = this.getLabelsList(item);
            if (!includeExterior && labels.includes('extérieur')) {
                return sum;
            }
            return sum + (item.area || 0);
        }, 0);
        return Math.round(sum * 100) / 100;
    },

    /**
     * Returns true if the floor's internal GFA matches its target total.
     */
    validateSums: function(floor) {
        const floorSubtotal = this.calculateSubtotal(floor.items);
        const EPSILON = 0.05;
        const isOutdoorLevel = ['toit', 'cour'].includes(floor.name.toLowerCase());
        return isOutdoorLevel || Math.abs(floorSubtotal - floor.total) < EPSILON;
    },

    /**
     * Calculates construction cost for a given area.
     */
    calculateConstructionCost: function(areaSqM, ratePerM2) {
        return Math.round(areaSqM * ratePerM2);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AllocationsLogic;
}
