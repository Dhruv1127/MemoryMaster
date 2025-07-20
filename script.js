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
        this.currentDifficulty = 'easy';
        this.gridConfig = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 4, cols: 5, pairs: 10 },
            hard: { rows: 5, cols: 6, pairs: 15 }
        };

        // Card symbols using Feather icons
        this.allCardSymbols = [
            'heart', 'star', 'sun', 'moon', 'cloud', 'umbrella', 'camera', 'music',
            'gift', 'coffee', 'home', 'bell', 'book', 'globe', 'key', 'lock',
            'mail', 'phone', 'shield', 'user', 'watch', 'wifi', 'zap', 'anchor'
        ];

        // DOM elements
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.gameBoard = document.getElementById('game-board');
        this.timerElement = document.getElementById('timer');
        this.triesElement = document.getElementById('tries');
        this.matchesElement = document.getElementById('matches');
        this.restartBtn = document.getElementById('restart-btn');
        this.backBtn = document.getElementById('back-to-menu-btn');
        this.victoryModal = document.getElementById('victory-modal');
        this.finalTimeElement = document.getElementById('final-time');
        this.finalTriesElement = document.getElementById('final-tries');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.howToPlayBtn = document.getElementById('how-to-play-btn');
        this.howToPlayModal = document.getElementById('how-to-play-modal');
        this.closeHelpBtn = document.getElementById('close-help-btn');
        this.gotItBtn = document.getElementById('got-it-btn');

        this.init();
    }

    init() {
        this.bindStartScreenEvents();
        // Initialize Feather icons
        feather.replace();
        // Show start screen initially
        this.showStartScreen();
    }

    createCards() {
        this.cards = [];
        const config = this.gridConfig[this.currentDifficulty];
        
        // Select symbols based on difficulty
        this.cardSymbols = this.allCardSymbols.slice(0, config.pairs);
        
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
            cardElement.className = 'card entrance';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.symbol = card.symbol;
            
            cardElement.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">
                    <i data-feather="${card.symbol}"></i>
                </div>
            `;
            
            // Add entrance animation delay for each card
            cardElement.style.animationDelay = `${index * 0.1}s`;
            
            this.gameBoard.appendChild(cardElement);
        });

        // Update grid layout based on difficulty
        const config = this.gridConfig[this.currentDifficulty];
        this.gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        
        // Initialize Feather icons
        feather.replace();
        
        // Remove entrance class after animation completes
        setTimeout(() => {
            document.querySelectorAll('.card.entrance').forEach(card => {
                card.classList.remove('entrance');
            });
        }, 1600);
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
    }

    showGameScreen() {
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        // Initialize game after screen transition
        setTimeout(() => {
            this.startNewGame();
        }, 400);
    }

    startNewGame() {
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.bindGameEvents();
        this.updateUI();
    }

    bindStartScreenEvents() {
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.difficulty;
            });
        });

        // Start game button
        this.startGameBtn.addEventListener('click', () => {
            this.showGameScreen();
        });

        // How to play button
        this.howToPlayBtn.addEventListener('click', () => {
            this.showHowToPlayModal();
        });

        // Back to menu button
        this.backBtn.addEventListener('click', () => {
            this.showStartScreen();
            this.resetGame();
        });

        // How to play modal events
        this.closeHelpBtn.addEventListener('click', () => {
            this.hideHowToPlayModal();
        });

        this.gotItBtn.addEventListener('click', () => {
            this.hideHowToPlayModal();
        });

        // Close modal on background click
        this.howToPlayModal.addEventListener('click', (e) => {
            if (e.target === this.howToPlayModal) {
                this.hideHowToPlayModal();
            }
        });
    }

    showHowToPlayModal() {
        this.howToPlayModal.classList.remove('hidden');
        feather.replace();
    }

    hideHowToPlayModal() {
        this.howToPlayModal.classList.add('hidden');
    }

    bindGameEvents() {
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
            this.animateStatUpdate('tries');
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
        // Add celebration animation
        card1.classList.add('match-celebration');
        card2.classList.add('match-celebration');
        
        // Mark cards as matched after celebration
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.remove('match-celebration');
            card2.classList.remove('match-celebration');
        }, 800);
        
        // Add to matched cards array
        this.matchedCards.push(card1, card2);
        
        // Update matches count
        this.matches++;
        this.updateUI();
        this.animateStatUpdate('matches');

        // Check if game is completed
        const config = this.gridConfig[this.currentDifficulty];
        if (this.matches === config.pairs) {
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
        
        // Create confetti effect
        this.createConfetti();
        
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
        this.resetGame();
        this.startNewGame();
    }

    resetGame() {
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

        // Hide victory modal if shown
        this.hideVictoryModal();
    }

    updateUI() {
        this.triesElement.textContent = this.tries;
        const config = this.gridConfig[this.currentDifficulty];
        this.matchesElement.textContent = `${this.matches}/${config.pairs}`;
    }

    animateStatUpdate(statType) {
        let element;
        if (statType === 'tries') {
            element = this.triesElement.closest('.stat');
        } else if (statType === 'matches') {
            element = this.matchesElement.closest('.stat');
        }
        
        if (element) {
            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 500);
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 100);
        }
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
