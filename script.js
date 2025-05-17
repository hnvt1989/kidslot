document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const slots = document.querySelectorAll('.slot-inner');
    const spinButton = document.getElementById('spin-button');
    const resetButton = document.getElementById('reset-button');
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');
    const bgm = document.getElementById('bgm');
    const confettiContainer = document.getElementById('confetti-container');
    const winBanner = document.getElementById('win-banner');
    
    // Array of items for the slot machine
    const items = [
        { emoji: '🐶', name: 'dog' },
        { emoji: '🐱', name: 'cat' },
        { emoji: '🐵', name: 'monkey' },
        { emoji: '🐰', name: 'rabbit' },
        { emoji: '🦁', name: 'lion' },
        { emoji: '🐼', name: 'panda' },
        { emoji: '🦊', name: 'fox' },
        { emoji: '🐻', name: 'bear' },
        { emoji: '🐨', name: 'koala' },
        { emoji: '🦄', name: 'unicorn' }
    ];
    
    // Game state
    let isSpinning = false;
    let currentItems = Array(3).fill(null);
    
    // Initialize the game
    function initGame() {
        // Set initial random items
        slots.forEach((slot, index) => {
            const randomItem = getRandomItem();
            slot.textContent = randomItem.emoji;
            currentItems[index] = randomItem;
        });
        
        // Set up error handling for audio elements
        setupAudioErrorHandling();
        
        // Play background music at low volume
        bgm.volume = 0.3;
        bgm.play().catch(error => console.log('Auto-play blocked: ', error));
    }
    
    // Handle audio loading errors
    function setupAudioErrorHandling() {
        const audioElements = [spinSound, winSound, bgm];
        
        audioElements.forEach(audio => {
            audio.addEventListener('error', (e) => {
                console.log(`Error loading audio file: ${audio.src}`, e);
                // The game will still work without sounds
            });
        });
    }
    
    // Get a random item with higher chance of matching
    function getRandomItem() {
        // Reduce the effective items pool to increase match chances
        // Use subset of items (first 4 items) with 80% probability
        const useReducedPool = Math.random() < 0.8;
        
        if (useReducedPool) {
            // Use only the first 4 items from the array to increase matching probability
            const reducedPoolSize = 4;
            const randomIndex = Math.floor(Math.random() * reducedPoolSize);
            return items[randomIndex];
        } else {
            // Use any item with 20% probability
            const randomIndex = Math.floor(Math.random() * items.length);
            return items[randomIndex];
        }
    }
    
    // Spin animation
    function spin() {
        if (isSpinning) return;
        
        isSpinning = true;
        spinButton.disabled = true;
        confettiContainer.classList.add('hidden');
        confettiContainer.innerHTML = '';
        winBanner.classList.add('hidden');
        
        // Play spin sound (if available)
        if (spinSound && spinSound.play) {
            spinSound.currentTime = 0;
            spinSound.play().catch(err => console.log('Could not play spin sound', err));
        }
        
        // Add spinning class
        slots.forEach(slot => {
            slot.parentElement.classList.add('spinning');
        });
        
        // Set different timeouts for each slot
        const stopTimes = [1000, 1500, 2000];
        
        // Stop each slot at different times
        slots.forEach((slot, index) => {
            setTimeout(() => {
                // Stop spinning
                slot.parentElement.classList.remove('spinning');
                
                // Set the result
                if (index === 2) {
                    // For the last slot, increase chance of matching by 50%
                    const shouldForceMatch = Math.random() < 0.5;
                    
                    if (shouldForceMatch && currentItems[0] && currentItems[1]) {
                        // Make it match one of the previous slots
                        const matchIndex = Math.random() < 0.5 ? 0 : 1;
                        slot.textContent = currentItems[matchIndex].emoji;
                        currentItems[index] = currentItems[matchIndex];
                    } else {
                        // Normal random item
                        const randomItem = getRandomItem();
                        slot.textContent = randomItem.emoji;
                        currentItems[index] = randomItem;
                    }
                } else {
                    // Normal random item for slots 1 and 2
                    const randomItem = getRandomItem();
                    slot.textContent = randomItem.emoji;
                    currentItems[index] = randomItem;
                }
                
                // Check if all slots have stopped
                if (index === slots.length - 1) {
                    setTimeout(() => {
                        checkResult();
                        isSpinning = false;
                        spinButton.disabled = false;
                    }, 500);
                }
            }, stopTimes[index]);
        });
    }
    
    // Check the result
    function checkResult() {
        // Speak the result
        speakResult();
        
        // Check for jackpot (all items match)
        if (currentItems[0].name === currentItems[1].name && 
            currentItems[1].name === currentItems[2].name) {
            celebrate();
        }
    }
    
    // Speak the results using speech synthesis
    function speakResult() {
        const resultText = `${currentItems[0].name}, ${currentItems[1].name}, ${currentItems[2].name}!`;
        const utterance = new SpeechSynthesisUtterance(resultText);
        utterance.rate = 0.9; // Slightly slower for kids
        utterance.pitch = 1.2; // Slightly higher pitch for kids
        window.speechSynthesis.speak(utterance);
    }
    
    // Celebration for jackpot
    function celebrate() {
        // Play win sound (if available)
        if (winSound && winSound.play) {
            winSound.currentTime = 0;
            winSound.play().catch(err => console.log('Could not play win sound', err));
        }
        
        // Show confetti
        createConfetti();
        
        // Show win banner
        winBanner.classList.remove('hidden');
        
        // Hide win banner after 5 seconds
        setTimeout(() => {
            winBanner.classList.add('hidden');
        }, 5000);
        
        // Add jackpot speech after a short delay
        setTimeout(() => {
            const congratsText = `Wow! You got three ${currentItems[0].name}s! Amazing job!`;
            const utterance = new SpeechSynthesisUtterance(congratsText);
            utterance.rate = 0.9;
            utterance.pitch = 1.3;
            window.speechSynthesis.speak(utterance);
        }, 1500);
    }
    
    // Create confetti effect
    function createConfetti() {
        confettiContainer.classList.remove('hidden');
        
        // Create 100 confetti pieces
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.position = 'absolute';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-10px`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            confettiContainer.appendChild(confetti);
        }
        
        // Add falling animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Get random bright color
    function getRandomColor() {
        const colors = [
            '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
            '#F72585', '#7209B7', '#3A0CA3', '#4CC9F0', '#4361EE'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Event listeners
    spinButton.addEventListener('click', spin);
    
    resetButton.addEventListener('click', () => {
        // Reset game state and start fresh
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        isSpinning = false;
        spinButton.disabled = false;
        confettiContainer.classList.add('hidden');
        confettiContainer.innerHTML = '';
        winBanner.classList.add('hidden');
        
        // Set new random items
        slots.forEach((slot, index) => {
            const randomItem = getRandomItem();
            slot.textContent = randomItem.emoji;
            currentItems[index] = randomItem;
        });
    });
    
    // Handle user interaction to enable audio
    document.addEventListener('click', () => {
        if (bgm.paused) {
            bgm.play().catch(error => console.log('Could not play audio: ', error));
        }
    }, { once: true });
    
    // Initialize the game
    initGame();
});