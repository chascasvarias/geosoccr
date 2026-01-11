// TheSportsDB API integration

const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const PLAYER_ID_MIN = 34145400;
const PLAYER_ID_RANGE = 16400;

/**
 * Generate a random player ID within the valid range
 * @returns {number} Random player ID
 */
function generateRandomPlayerId() {
    return PLAYER_ID_MIN + Math.floor(Math.random() * (PLAYER_ID_RANGE + 1));
}

/**
 * Fetch player data from TheSportsDB API
 * @param {number} playerId - Player ID to fetch
 * @returns {Promise<Object|null>} Player data or null if not found
 */
async function fetchPlayer(playerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookupplayer.php?id=${playerId}`);
        const data = await response.json();

        // Check if player exists
        if (!data.players || data.players === null || data.players.length === 0) {
            return null;
        }

        return data.players[0];
    } catch (error) {
        console.error('Error fetching player:', error);
        return null;
    }
}

/**
 * Fetch former teams for a player from TheSportsDB API
 * @param {number} playerId - Player ID
 * @returns {Promise<Array|null>} Array of former teams or null if not found
 */
async function fetchFormerTeams(playerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookupformerteams.php?id=${playerId}`);
        const data = await response.json();

        if (!data.formerteams || data.formerteams === null || data.formerteams.length === 0) {
            return null;
        }

        return data.formerteams;
    } catch (error) {
        console.error('Error fetching former teams:', error);
        return null;
    }
}

/**
 * Fetch a valid random player (retry if player not found or not a soccer player)
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<Object>} Valid player data
 */
async function fetchRandomPlayer(maxRetries = 20) {
    let attempts = 0;

    while (attempts < maxRetries) {
        const playerId = generateRandomPlayerId();
        console.log(`Attempting to fetch player ID: ${playerId} (Attempt ${attempts + 1}/${maxRetries})`);

        const player = await fetchPlayer(playerId);

        // Check if player exists, is a soccer player, and has an image
        if (player && player.strSport === 'Soccer' && (player.strCutout || player.strThumb)) {
            console.log('Soccer player found:', player.strPlayer);
            return player;
        }

        if (player && player.strSport !== 'Soccer') {
            console.log(`Skipping non-soccer player: ${player.strPlayer} (${player.strSport})`);
        }

        if (player && player.strSport === 'Soccer' && !player.strCutout && !player.strThumb) {
            console.log(`Skipping soccer player without image: ${player.strPlayer}`);
        }

        attempts++;
    }

    throw new Error('Failed to fetch a valid soccer player after maximum retries');
}

/**
 * Extract relevant player data
 * @param {Object} player - Raw player data from API
 * @returns {Object} Formatted player data
 */
function extractPlayerData(player) {
    return {
        id: player.idPlayer,
        name: player.strPlayer,
        lastName: player.strLastName,
        nationality: player.strNationality,
        team: player.strTeam,
        position: player.strPosition,
        image: player.strCutout || player.strThumb, // Use strThumb as fallback if strCutout is null
        birthLocation: player.strBirthLocation,
        number: player.strNumber,
        height: player.strHeight,
        weight: player.strWeight,
        side: player.strSide,
        dateBorn: player.dateBorn
    };
}
