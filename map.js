// Leaflet.js interactive map implementation

let map;
let countryMarkers = {};
let selectedCountry = null;

/**
 * Initialize the Leaflet map
 */
async function initMap() {
    // Create map centered on the world
    map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        worldCopyJump: true
    });

    // Add dark tile layer with neon styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Load countries and add markers
    await loadCountryMarkers();
}

/**
 * Load countries from JSON and create markers
 */
async function loadCountryMarkers() {
    try {
        const response = await fetch('countries.json');
        const countries = await response.json();

        // Create a custom icon for country markers
        const countryIcon = L.divIcon({
            className: 'country-marker',
            html: '<div class="marker-dot"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        // Add marker for each country
        for (const [countryName, coords] of Object.entries(countries)) {
            const marker = L.marker([coords.lat, coords.lon], {
                icon: countryIcon,
                title: countryName
            }).addTo(map);

            // Add click event
            marker.on('click', () => selectCountry(countryName, marker));

            // Store marker reference
            countryMarkers[countryName] = marker;
        }
    } catch (error) {
        console.error('Error loading countries:', error);
    }
}

/**
 * Handle country selection
 * @param {string} countryName - Selected country name
 * @param {Object} marker - Leaflet marker object
 */
function selectCountry(countryName, marker) {
    // Remove previous selection
    if (selectedCountry) {
        const prevMarker = countryMarkers[selectedCountry];
        if (prevMarker) {
            prevMarker.getElement().classList.remove('selected');
        }
    }

    // Set new selection
    selectedCountry = countryName;
    marker.getElement().classList.add('selected');

    // Trigger guess event
    if (window.onCountrySelected) {
        window.onCountrySelected(countryName);
    }
}

/**
 * Mark a country as attempted
 * @param {string} countryName - Country to mark as attempted
 */
function markCountryAsAttempted(countryName) {
    const marker = countryMarkers[countryName];
    if (marker) {
        marker.getElement().classList.add('attempted');
    }
}

/**
 * Reset map selection
 */
function resetMapSelection() {
    if (selectedCountry) {
        const marker = countryMarkers[selectedCountry];
        if (marker) {
            marker.getElement().classList.remove('selected');
        }
        selectedCountry = null;
    }
}

/**
 * Reset all marker colors (for new game)
 */
function resetAllMarkers() {
    Object.values(countryMarkers).forEach(marker => {
        const element = marker.getElement();
        if (element) {
            element.classList.remove('selected', 'attempted', 'correct');
        }
    });
    selectedCountry = null;
}

/**
 * Highlight the correct country
 * @param {string} countryName - Country to highlight
 */
function highlightCorrectCountry(countryName) {
    const marker = countryMarkers[countryName];
    if (marker) {
        marker.getElement().classList.add('correct');
        map.setView(marker.getLatLng(), 4, { animate: true });
    }
}

/**
 * Get currently selected country
 * @returns {string|null} Selected country name
 */
function getSelectedCountry() {
    return selectedCountry;
}
