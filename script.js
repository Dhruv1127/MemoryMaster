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
        this.quitGameBtn = document.getElementById('quit-game-btn');
        this.quitGameplayBtn = document.getElementById('quit-game-gameplay-btn');
        this.quitConfirmationModal = document.getElementById('quit-confirmation-modal');
        this.confirmQuitBtn = document.getElementById('confirm-quit-btn');
        this.cancelQuitBtn = document.getElementById('cancel-quit-btn');

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

        // Quit game button (from start screen)
        this.quitGameBtn.addEventListener('click', () => {
            this.showQuitConfirmation();
        });

        // Quit game button (from gameplay)
        this.quitGameplayBtn.addEventListener('click', () => {
            this.showQuitConfirmation();
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

        // Quit confirmation modal events
        this.confirmQuitBtn.addEventListener('click', () => {
            this.confirmQuit();
        });

        this.cancelQuitBtn.addEventListener('click', () => {
            // Play happy "continue playing" sound
            this.playTone(800, 100, 0.12); // Quick positive tone
            setTimeout(() => this.playTone(1000, 100, 0.12), 100); // Second higher tone
            
            // Add a small celebration effect for choosing to continue
            const cancelBtn = document.getElementById('cancel-quit-btn');
            if (cancelBtn) {
                cancelBtn.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    cancelBtn.style.transform = '';
                }, 200);
            }
            
            this.hideQuitConfirmation();
        });

        // Close quit modal on background click
        this.quitConfirmationModal.addEventListener('click', (e) => {
            if (e.target === this.quitConfirmationModal) {
                this.hideQuitConfirmation();
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

    showQuitConfirmation() {
        this.quitConfirmationModal.classList.remove('hidden');
        
        // Add subtle audio feedback (using Web Audio API for a gentle sound)
        this.playTone(800, 150, 0.1); // Gentle notification tone
        
        feather.replace();
    }
    
    // Simple tone generator for UI feedback
    playTone(frequency, duration, volume = 0.1) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            // Audio context not supported, silently fail
        }
    }

    hideQuitConfirmation() {
        this.quitConfirmationModal.classList.add('hidden');
    }

    confirmQuit() {
        // Play goodbye sound
        this.playTone(400, 300, 0.15); // Lower tone for goodbye
        
        // Hide the confirmation modal
        this.hideQuitConfirmation();
        
        // Reset the game
        this.resetGame();
        
        // Show a farewell message and close the tab/window
        this.showFarewellMessage();
    }

    showFarewellMessage() {
        // Create a farewell overlay
        const farewellOverlay = document.createElement('div');
        farewellOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;
        
        // Add floating particles animation
        const particlesHtml = Array.from({length: 15}, (_, i) => 
            `<div style="
                position: absolute;
                width: 8px;
                height: 8px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s;
            "></div>`
        ).join('');
        
        farewellOverlay.innerHTML = `
            ${particlesHtml}
            <div class="farewell-content" style="
                text-align: center; 
                color: white; 
                transform: translateY(30px);
                opacity: 0;
                transition: all 0.8s ease-out;
                max-width: 600px;
                padding: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <div class="farewell-icon" style="
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 30px;
                    font-size: 4rem;
                    box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4);
                    position: relative;
                    animation: farewell-pulse 2s ease-in-out infinite;
                ">
                    <div style="
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                        opacity: 0.3;
                        animation: farewell-ripple 2s ease-out infinite;
                    "></div>
                    <span style="position: relative; z-index: 1;">👋</span>
                </div>
                <h1 style="
                    font-size: 3rem; 
                    margin-bottom: 20px; 
                    text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                    background: linear-gradient(45deg, #fff, #e0e7ff);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                    animation: farewell-glow 3s ease-in-out infinite;
                ">
                    Thanks for Playing!
                </h1>
                <p style="
                    font-size: 1.3rem; 
                    opacity: 0.9; 
                    margin-bottom: 30px;
                    line-height: 1.6;
                ">
                    Hope you enjoyed the Memory Master game ✨
                </p>
                <div class="countdown-container" style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px 25px;
                    border-radius: 50px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                ">
                    <p style="
                        font-size: 1.1rem; 
                        opacity: 0.8;
                        margin: 0;
                    ">
                        Closing in <span id="countdown" style="
                            font-weight: bold;
                            color: #4CAF50;
                            font-size: 1.3rem;
                        ">3</span> seconds...
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(farewellOverlay);
        
        // Add CSS animations for farewell screen
        const style = document.createElement('style');
        style.textContent = `
            @keyframes farewell-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes farewell-ripple {
                0% { transform: scale(1); opacity: 0.3; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            @keyframes farewell-glow {
                0%, 100% { text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
                50% { text-shadow: 2px 2px 16px rgba(255,255,255,0.4), 0 0 30px rgba(255,255,255,0.3); }
            }
        `;
        document.head.appendChild(style);
        
        // Trigger entrance animations
        setTimeout(() => {
            farewellOverlay.style.opacity = '1';
            const content = farewellOverlay.querySelector('.farewell-content');
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }, 100);
        
        // Countdown functionality
        let countdown = 3;
        const countdownElement = farewellOverlay.querySelector('#countdown');
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
                // Add pulse effect on countdown change
                countdownElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    countdownElement.style.transform = 'scale(1)';
                }, 150);
            }
            if (countdown <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        // Auto-close after 3 seconds or allow manual close
        setTimeout(() => {
            try {
                // Try to close the window/tab
                window.close();
                
                // If window.close() doesn't work (in some browsers), show close instruction
                if (!window.closed) {
                    farewellOverlay.innerHTML = `
                        <div style="text-align: center; color: white;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🎯</div>
                            <h1 style="font-size: 2.5rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                Game Ended
                            </h1>
                            <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px;">
                                You can safely close this tab or refresh to play again
                            </p>
                            <button onclick="location.reload()" style="
                                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                                color: white;
                                border: none;
                                padding: 15px 30px;
                                border-radius: 50px;
                                font-size: 1.1rem;
                                font-weight: bold;
                                cursor: pointer;
                                box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                            ">
                                Play Again
                            </button>
                        </div>
                    `;
                }
            } catch (e) {
                // If there's an error, just show the play again option
                farewellOverlay.innerHTML = `
                    <div style="text-align: center; color: white;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">🎯</div>
                        <h1 style="font-size: 2.5rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                            Game Ended
                        </h1>
                        <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px;">
                            You can safely close this tab or refresh to play again
                        </p>
                        <button onclick="location.reload()" style="
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 50px;
                            font-size: 1.1rem;
                            font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                        ">
                            Play Again
                        </button>
                    </div>
                `;
            }
        }, 3000);
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
        if (restartBtn && !document.getElementById('game-screen').classList.contains('hidden')) {
            restartBtn.click();
        }
    } else if (e.key === 'Escape') {
        // Close modals with Escape key
        const victoryModal = document.getElementById('victory-modal');
        const howToPlayModal = document.getElementById('how-to-play-modal');
        const quitModal = document.getElementById('quit-confirmation-modal');
        
        if (victoryModal && !victoryModal.classList.contains('hidden')) {
            victoryModal.classList.add('hidden');
        } else if (howToPlayModal && !howToPlayModal.classList.contains('hidden')) {
            howToPlayModal.classList.add('hidden');
        } else if (quitModal && !quitModal.classList.contains('hidden')) {
            quitModal.classList.add('hidden');
        }
    } else if (e.key === 'q' || e.key === 'Q') {
        // Quit game with 'Q' key
        const startScreen = document.getElementById('start-screen');
        const gameScreen = document.getElementById('game-screen');
        
        if (!startScreen.classList.contains('hidden') || !gameScreen.classList.contains('hidden')) {
            const quitModal = document.getElementById('quit-confirmation-modal');
            if (quitModal && quitModal.classList.contains('hidden')) {
                // Only show quit modal if no other modals are open
                const victoryModal = document.getElementById('victory-modal');
                const howToPlayModal = document.getElementById('how-to-play-modal');
                
                if ((!victoryModal || victoryModal.classList.contains('hidden')) && 
                    (!howToPlayModal || howToPlayModal.classList.contains('hidden'))) {
                    quitModal.classList.remove('hidden');
                    feather.replace();
                }
            }
        }
    } else if (e.key === 'h' || e.key === 'H') {
        // Show how to play with 'H' key (only on start screen)
        const startScreen = document.getElementById('start-screen');
        if (!startScreen.classList.contains('hidden')) {
            const howToPlayBtn = document.getElementById('how-to-play-btn');
            if (howToPlayBtn) {
                howToPlayBtn.click();
            }
        }
    }
});
