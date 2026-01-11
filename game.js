// Main game controller

class FootballPlayerGame {
    constructor() {
        this.currentPlayer = null;
        this.points = 0;
        this.attempts = 0;
        this.maxAttempts = 10;
        this.hintManager = new HintManager();
        this.gameOver = false;

        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        // UI Elements
        this.playerImage = document.getElementById('playerImage');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.pointsDisplay = document.getElementById('points');
        this.attemptsDisplay = document.getElementById('attempts');
        this.submitBtn = document.getElementById('submitGuess');
        this.mapInfo = document.getElementById('mapInfo');
        this.feedbackPanel = document.getElementById('feedbackPanel');
        this.feedbackIcon = document.getElementById('feedbackIcon');
        this.feedbackText = document.getElementById('feedbackText');
        this.revealedHints = document.getElementById('revealedHints');
        this.pointsAddedDisplay = document.getElementById('pointsAdded');

        // Modals
        this.winModal = document.getElementById('winModal');
        this.loseModal = document.getElementById('loseModal');
        this.winPlayerInfo = document.getElementById('winPlayerInfo');
        this.losePlayerInfo = document.getElementById('losePlayerInfo');

        // Hint buttons
        this.hintButtons = {
            POSITION: document.getElementById('hintPosition'),
            BIRTH_CITY: document.getElementById('hintBirthCity'),
            TEAM: document.getElementById('hintTeam'),
            DISTANCE: document.getElementById('hintDistance'),
            SURNAME: document.getElementById('hintSurname'),
            FULLNAME: document.getElementById('hintFullname'),
            FORMER_TEAMS: document.getElementById('hintFormerteams'),
            COMPASS: document.getElementById('hintCompass')
        };
    }

    attachEventListeners() {
        // Submit guess button
        this.submitBtn.addEventListener('click', () => this.submitGuess());

        // Hint buttons
        Object.entries(this.hintButtons).forEach(([type, button]) => {
            button.addEventListener('click', () => this.purchaseHint(type));
        });

        // New game buttons
        document.getElementById('btnNewGameWin').addEventListener('click', () => this.startNewGame());
        document.getElementById('btnNewGameLose').addEventListener('click', () => this.startNewGame());

        // Map country selection callback
        window.onCountrySelected = (countryName) => this.onCountrySelected(countryName);
    }

    async startNewGame() {
        // Reset game state
        this.points = 0;
        this.attempts = 0;
        this.gameOver = false;
        this.hintManager.reset();

        // Hide modals
        this.winModal.classList.remove('active');
        this.loseModal.classList.remove('active');

        // Clear feedback
        this.feedbackPanel.style.display = 'none';
        this.revealedHints.innerHTML = '';

        // Reset map
        if (typeof resetAllMarkers === 'function') {
            resetAllMarkers();
        }

        // Update UI
        this.updateUI();
        this.updateHintButtons();

        // Show loading
        this.playerImage.style.display = 'none';
        this.loadingSpinner.style.display = 'flex';

        // Load new player
        try {
            const player = await fetchRandomPlayer();
            this.currentPlayer = extractPlayerData(player);

            // Display player image
            this.playerImage.src = this.currentPlayer.image;
            this.playerImage.style.display = 'block';
            this.loadingSpinner.style.display = 'none';

            console.log('Game started with player:', this.currentPlayer.name);

            // Initialize map
            if (!map) {
                await initMap();
            }
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Error al cargar el jugador. Por favor, recarga la página.');
        }
    }

    onCountrySelected(countryName) {
        this.mapInfo.textContent = `País seleccionado: ${countryName}`;
        this.submitBtn.disabled = false;
    }

    async submitGuess() {
        if (this.gameOver) return;

        const selectedCountry = getSelectedCountry();
        if (!selectedCountry) {
            alert('Por favor, selecciona un país del mapa');
            return;
        }

        this.attempts++;
        this.updateUI();

        try {
            // Calculate distance and points
            const distance = await getDistanceBetweenCountries(
                selectedCountry,
                this.currentPlayer.nationality
            );
            const earnedPoints = calculatePoints(distance);
            this.points += earnedPoints;
            this.updateUI(earnedPoints);

            // Mark country as attempted
            markCountryAsAttempted(selectedCountry);

            // Track last attempted country for distance hint
            this.hintManager.setLastAttemptedCountry(selectedCountry);

            // Check if correct
            if (selectedCountry === this.currentPlayer.nationality) {
                this.handleWin();
                return;
            }

            // Show feedback
            this.showFeedback(
                `📍 ${selectedCountry}: ${distance} km de distancia. +${earnedPoints} puntos`,
                'success'
            );

            // Check if game over
            if (this.attempts >= this.maxAttempts) {
                this.handleLose();
                return;
            }

            // Update UI
            this.updateHintButtons();

            // Reset selection
            resetMapSelection();
            this.submitBtn.disabled = true;
            this.mapInfo.textContent = 'Haz clic en un país del mapa';

        } catch (error) {
            console.error('Error processing guess:', error);
            this.showFeedback('❌ Error al procesar la selección', 'error');
        }
    }

    async purchaseHint(hintType) {
        if (this.gameOver) return;

        let extraData = {};

        // Calculate special hint data
        if (hintType === 'DISTANCE' && this.hintManager.lastAttemptedCountry) {
            try {
                const distance = await getDistanceBetweenCountries(
                    this.hintManager.lastAttemptedCountry,
                    this.currentPlayer.nationality
                );
                extraData.distanceText = `${this.hintManager.lastAttemptedCountry} a ${distance} km`;
            } catch (error) {
                console.error('Error calculating distance:', error);
                extraData.distanceText = 'Error al calcular';
            }
        } else if (hintType === 'COMPASS' && this.hintManager.lastAttemptedCountry) {
            try {
                const direction = await getCompassDirection(
                    this.hintManager.lastAttemptedCountry,
                    this.currentPlayer.nationality
                );
                const directionNames = {
                    'N': 'Norte',
                    'NE': 'Noreste',
                    'E': 'Este',
                    'SE': 'Sureste',
                    'S': 'Sur',
                    'SW': 'Suroeste',
                    'W': 'Oeste',
                    'NW': 'Noroeste'
                };
                extraData.compassDirection = `${this.hintManager.lastAttemptedCountry} hacia el ${directionNames[direction]}`;
            } catch (error) {
                console.error('Error calculating compass:', error);
                extraData.compassDirection = 'Error al calcular';
            }
        } else if (hintType === 'FORMER_TEAMS') {
            try {
                const formerTeams = await fetchFormerTeams(this.currentPlayer.id);
                if (formerTeams && formerTeams.length > 0) {
                    // Filter duplicates and limit to 8
                    const seenTeams = new Set();
                    const uniqueTeams = [];

                    for (const team of formerTeams) {
                        if (!seenTeams.has(team.strFormerTeam) && team.strBadge) {
                            seenTeams.add(team.strFormerTeam);
                            uniqueTeams.push(team);
                        }
                        if (uniqueTeams.length >= 8) break;
                    }

                    if (uniqueTeams.length > 0) {
                        extraData.badgesHtml = `<div class="badge-list">
                            ${uniqueTeams.map(team => `<img src="${team.strBadge}" class="badge-item">`).join('')}
                        </div>`;
                    } else {
                        extraData.badgesHtml = 'No se encontraron clubes anteriores con escudo';
                    }
                } else {
                    extraData.badgesHtml = 'No se encontraron clubes anteriores';
                }
            } catch (error) {
                console.error('Error fetching former teams for hint:', error);
                extraData.badgesHtml = 'Error al consultar clubes anteriores';
            }
        }

        const result = this.hintManager.purchase(
            hintType,
            this.points,
            this.currentPlayer,
            extraData
        );

        if (result.success) {
            this.points = result.newPoints;
            this.updateUI();
            this.updateHintButtons();

            let hintValue = result.hintValue;

            // Special processing for birth city (remove country)
            if (hintType === 'BIRTH_CITY' && hintValue) {
                hintValue = hintValue.split(',')[0].trim();
            }

            this.revealHint(result.hintLabel, hintValue);
        } else {
            this.showFeedback('❌ ' + result.message, 'error');
        }
    }

    revealHint(label, value) {
        const hintElement = document.createElement('div');
        hintElement.className = 'revealed-hint';
        hintElement.innerHTML = `
            <span class="revealed-hint-label">${label}:</span>
            <span class="revealed-hint-value">${value}</span>
        `;
        this.revealedHints.appendChild(hintElement);
    }

    updateHintButtons() {
        Object.entries(this.hintButtons).forEach(([type, button]) => {
            const canPurchase = this.hintManager.canPurchase(this.points, type);
            const isPurchased = this.hintManager.isPurchased(type);

            button.disabled = !canPurchase || isPurchased;

            if (isPurchased) {
                button.classList.add('purchased');
            }
        });
    }

    showFeedback(message, type) {
        this.feedbackPanel.style.display = 'block';
        this.feedbackPanel.className = 'feedback-panel ' + type;
        this.feedbackText.textContent = message;
        this.feedbackIcon.textContent = type === 'success' ? '✅' : '❌';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.feedbackPanel.style.display = 'none';
        }, 3000);
    }

    handleWin() {
        this.gameOver = true;
        highlightCorrectCountry(this.currentPlayer.nationality);

        this.winPlayerInfo.innerHTML = `
            <p><strong>Jugador:</strong> ${this.currentPlayer.name}</p>
            <p><strong>Nacionalidad:</strong> ${this.currentPlayer.nationality}</p>
            <p><strong>Equipo:</strong> ${this.currentPlayer.team || 'N/A'}</p>
            <p><strong>Posición:</strong> ${this.currentPlayer.position || 'N/A'}</p>
            <p><strong>Intentos:</strong> ${this.attempts}/${this.maxAttempts}</p>
            <p><strong>Puntos finales:</strong> ${this.points}</p>
        `;

        this.winModal.classList.add('active');
    }

    handleLose() {
        this.gameOver = true;
        highlightCorrectCountry(this.currentPlayer.nationality);

        this.losePlayerInfo.innerHTML = `
            <p><strong>El jugador era:</strong> ${this.currentPlayer.name}</p>
            <p><strong>Nacionalidad:</strong> ${this.currentPlayer.nationality}</p>
            <p><strong>Equipo:</strong> ${this.currentPlayer.team || 'N/A'}</p>
            <p><strong>Posición:</strong> ${this.currentPlayer.position || 'N/A'}</p>
            <p><strong>Puntos obtenidos:</strong> ${this.points}</p>
        `;

        this.loseModal.classList.add('active');
    }

    updateUI(pointsAdded = 0) {
        this.pointsDisplay.textContent = this.points;
        this.attemptsDisplay.textContent = `${this.attempts}/${this.maxAttempts}`;

        if (pointsAdded > 0) {
            this.showPointsAdded(pointsAdded);
        }
    }

    showPointsAdded(points) {
        this.pointsAddedDisplay.textContent = `(+${points})`;
        this.pointsAddedDisplay.style.display = 'block';

        // Reset animation
        this.pointsAddedDisplay.style.animation = 'none';
        this.pointsAddedDisplay.offsetHeight; // trigger reflow
        this.pointsAddedDisplay.style.animation = '';

        // Hide after animation finishes (1.5s as defined in CSS)
        setTimeout(() => {
            if (!this.gameOver) {
                this.pointsAddedDisplay.style.display = 'none';
            }
        }, 1500);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new FootballPlayerGame();
});
