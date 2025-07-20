class MemoryGame {
    constructor() {
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.tries = 0;
        this.matches = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.startTime = null;
        this.timerInterval = null;

        // Card symbols using Feather icons
        this.cardSymbols = [
            'heart', 'star', 'sun', 'moon',
            'cloud', 'umbrella', 'camera', 'music'
        ];

        // DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.timerElement = document.getElementById('timer');
        this.triesElement = document.getElementById('tries');
        this.matchesElement = document.getElementById('matches');
        this.restartBtn = document.getElementById('restart-btn');
        this.victoryModal = document.getElementById('victory-modal');
        this.finalTimeElement = document.getElementById('final-time');
        this.finalTriesElement = document.getElementById('final-tries');
        this.playAgainBtn = document.getElementById('play-again-btn');

        this.init();
    }

    init() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.bindEvents();
        this.updateUI();
    }

    createCards() {
        this.cards = [];
        // Create pairs of cards
        this.cardSymbols.forEach((symbol, index) => {
            // Create two cards with the same symbol
            this.cards.push({
                id: index * 2,
                symbol: symbol,
                isFlipped: false,
                isMatched: false
            });
            this.cards.push({
                id: index * 2 + 1,
                symbol: symbol,
                isFlipped: false,
                isMatched: false
            });
        });
    }

    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderCards() {
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.symbol = card.symbol;
            
            cardElement.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">
                    <i data-feather="${card.symbol}"></i>
                </div>
            `;
            
            this.gameBoard.appendChild(cardElement);
        });

        // Initialize Feather icons
        feather.replace();
    }

    bindEvents() {
        // Card click events
        this.gameBoard.addEventListener('click', (e) => {
            const cardElement = e.target.closest('.card');
            if (cardElement) {
                this.handleCardClick(cardElement);
            }
        });

        // Restart button
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });

        // Play again button
        this.playAgainBtn.addEventListener('click', () => {
            this.hideVictoryModal();
            this.restartGame();
        });

        // Modal close on background click
        this.victoryModal.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) {
                this.hideVictoryModal();
            }
        });
    }

    handleCardClick(cardElement) {
        // Prevent clicking on already flipped or matched cards
        if (cardElement.classList.contains('flip') || 
            cardElement.classList.contains('matched') ||
            this.gameCompleted) {
            return;
        }

        // Start timer on first card click
        if (!this.gameStarted) {
            this.startGame();
        }

        // Prevent clicking more than 2 cards at once
        if (this.flippedCards.length >= 2) {
            return;
        }

        // Flip the card
        this.flipCard(cardElement);
        
        // Add to flipped cards array
        this.flippedCards.push(cardElement);

        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.tries++;
            this.updateUI();
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }

    flipCard(cardElement) {
        cardElement.classList.add('flip');
    }

    unflipCard(cardElement) {
        cardElement.classList.remove('flip');
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const symbol1 = card1.dataset.symbol;
        const symbol2 = card2.dataset.symbol;

        if (symbol1 === symbol2) {
            // Match found
            this.handleMatch(card1, card2);
        } else {
            // No match
            this.handleNoMatch(card1, card2);
        }

        // Clear flipped cards array
        this.flippedCards = [];
    }

    handleMatch(card1, card2) {
        // Mark cards as matched
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        // Add to matched cards array
        this.matchedCards.push(card1, card2);
        
        // Update matches count
        this.matches++;
        this.updateUI();

        // Check if game is completed
        if (this.matches === this.cardSymbols.length) {
            this.completeGame();
        }
    }

    handleNoMatch(card1, card2) {
        // Unflip cards with animation
        setTimeout(() => {
            this.unflipCard(card1);
            this.unflipCard(card2);
        }, 200);
    }

    startGame() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            this.timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    completeGame() {
        this.gameCompleted = true;
        this.stopTimer();
        
        // Show victory modal after a short delay
        setTimeout(() => {
            this.showVictoryModal();
        }, 500);
    }

    showVictoryModal() {
        this.finalTimeElement.textContent = this.timerElement.textContent;
        this.finalTriesElement.textContent = this.tries;
        this.victoryModal.classList.remove('hidden');
    }

    hideVictoryModal() {
        this.victoryModal.classList.add('hidden');
    }

    restartGame() {
        // Reset game state
        this.flippedCards = [];
        this.matchedCards = [];
        this.tries = 0;
        this.matches = 0;
        this.gameStarted = false;
        this.gameCompleted = false;
        this.startTime = null;

        // Stop timer
        this.stopTimer();

        // Reset timer display
        this.timerElement.textContent = '00:00';

        // Recreate and shuffle cards
        this.createCards();
        this.shuffleCards();
        this.renderCards();

        // Update UI
        this.updateUI();

        // Hide victory modal if shown
        this.hideVictoryModal();
    }

    updateUI() {
        this.triesElement.textContent = this.tries;
        this.matchesElement.textContent = `${this.matches}/${this.cardSymbols.length}`;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        // Restart game with 'R' key
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.click();
        }
    } else if (e.key === 'Escape') {
        // Close victory modal with Escape key
        const victoryModal = document.getElementById('victory-modal');
        if (victoryModal && !victoryModal.classList.contains('hidden')) {
            victoryModal.classList.add('hidden');
        }
    }
});
