// Distance calculation utilities using Haversine formula

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate points based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {number} Points awarded (10-50)
 */
function calculatePoints(distance) {
    if (distance <= 500) return 50;
    if (distance <= 1500) return 40;
    if (distance <= 3000) return 30;
    if (distance <= 5000) return 20;
    return 10;
}

/**
 * Get country coordinates from countries.json
 * @param {string} countryName - Name of the country
 * @returns {Promise<{lat: number, lon: number}>} Country coordinates
 */
async function getCountryCoordinates(countryName) {
    const response = await fetch('countries.json');
    const countries = await response.json();
    return countries[countryName];
}

/**
 * Calculate distance between two countries
 * @param {string} country1 - First country name
 * @param {string} country2 - Second country name
 * @returns {Promise<number>} Distance in kilometers
 */
async function getDistanceBetweenCountries(country1, country2) {
    const coords1 = await getCountryCoordinates(country1);
    const coords2 = await getCountryCoordinates(country2);

    if (!coords1 || !coords2) {
        throw new Error('Country not found');
    }

    return calculateDistance(coords1.lat, coords1.lon, coords2.lat, coords2.lon);
}

/**
 * Calculate compass direction from one country to another
 * @param {string} fromCountry - Starting country
 * @param {string} toCountry - Destination country
 * @returns {Promise<string>} Compass direction (N, NE, E, SE, S, SW, W, NW)
 */
async function getCompassDirection(fromCountry, toCountry) {
    const coords1 = await getCountryCoordinates(fromCountry);
    const coords2 = await getCountryCoordinates(toCountry);

    if (!coords1 || !coords2) {
        throw new Error('Country not found');
    }

    // Calculate bearing
    const lat1 = toRadians(coords1.lat);
    const lat2 = toRadians(coords2.lat);
    const dLon = toRadians(coords2.lon - coords1.lon);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x);
    bearing = (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees

    // Convert bearing to compass direction
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;

    return directions[index];
}
