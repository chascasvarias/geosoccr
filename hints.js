// Hint system management

const HINTS = {
    POSITION: { cost: 10, key: 'position', label: 'Posición' },
    TEAM: { cost: 20, key: 'team', label: 'Equipo' },
    DISTANCE: { cost: 30, key: null, label: 'Distancia Exacta' }, // Special hint
    SURNAME: { cost: 30, key: 'lastName', label: 'Apellido' },
    FULLNAME: { cost: 40, key: 'name', label: 'Nombre Completo' },
    FORMER_TEAMS: { cost: 50, key: null, label: 'Clubes Anteriores' }, // Special hint
    COMPASS: { cost: 70, key: null, label: 'Brújula' }, // Special hint
    BIRTH_CITY: { cost: 80, key: 'birthLocation', label: 'Ciudad de Nacimiento' },
};

class HintManager {
    constructor() {
        this.purchasedHints = new Set();
        this.lastAttemptedCountry = null;
    }

    /**
     * Check if player has enough points to purchase a hint
     * @param {number} currentPoints - Player's current points
     * @param {string} hintType - Type of hint
     * @returns {boolean} True if player can afford the hint
     */
    canPurchase(currentPoints, hintType) {
        const hint = HINTS[hintType];

        // Distance hint requires at least one attempt
        if (hintType === 'DISTANCE' && !this.lastAttemptedCountry) {
            return false;
        }

        return currentPoints >= hint.cost && !this.purchasedHints.has(hintType);
    }

    /**
     * Purchase a hint
     * @param {string} hintType - Type of hint to purchase
     * @param {number} currentPoints - Player's current points
     * @param {Object} playerData - Player data to reveal hint from
     * @param {Object} extraData - Extra data for special hints (distance, compass)
     * @returns {Object} Result with success status, new points, and hint value
     */
    purchase(hintType, currentPoints, playerData, extraData = {}) {
        if (!this.canPurchase(currentPoints, hintType)) {
            return {
                success: false,
                message: 'No tienes suficientes puntos o ya compraste esta pista'
            };
        }

        const hint = HINTS[hintType];
        this.purchasedHints.add(hintType);

        let hintValue;

        // Handle special hints
        if (hintType === 'DISTANCE') {
            hintValue = extraData.distanceText || 'N/A';
        } else if (hintType === 'COMPASS') {
            hintValue = extraData.compassDirection || 'N/A';
        } else if (hintType === 'FORMER_TEAMS') {
            hintValue = extraData.badgesHtml || 'N/A';
        } else {
            hintValue = playerData[hint.key];
        }

        return {
            success: true,
            newPoints: currentPoints - hint.cost,
            hintValue: hintValue,
            hintLabel: hint.label,
            cost: hint.cost
        };
    }

    /**
     * Check if a hint has been purchased
     * @param {string} hintType - Type of hint
     * @returns {boolean} True if hint was purchased
     */
    isPurchased(hintType) {
        return this.purchasedHints.has(hintType);
    }

    /**
     * Update last attempted country for distance hint
     * @param {string} countryName - Name of the country
     */
    setLastAttemptedCountry(countryName) {
        this.lastAttemptedCountry = countryName;
    }

    /**
     * Reset all purchased hints (for new game)
     */
    reset() {
        this.purchasedHints.clear();
        this.lastAttemptedCountry = null;
    }

    /**
     * Get all available hints with their status
     * @param {number} currentPoints - Player's current points
     * @returns {Array} Array of hint objects with availability status
     */
    getHintsStatus(currentPoints) {
        return Object.entries(HINTS).map(([type, hint]) => ({
            type,
            label: hint.label,
            cost: hint.cost,
            canAfford: currentPoints >= hint.cost,
            purchased: this.isPurchased(type)
        }));
    }
}
