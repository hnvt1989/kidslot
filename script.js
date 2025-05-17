document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const slots = document.querySelectorAll('.slot-inner');
    const spinButton = document.getElementById('spin-button');
    const resetButton = document.getElementById('reset-button');
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');
    const bgm = document.getElementById('bgm');
    const confettiContainer = document.getElementById('confetti-container');
    
    // Audio context for iOS compatibility
    let audioContext;
    let audioInitialized = false;
    
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
        
        // Clear any previous confetti
        confettiContainer.classList.add('hidden');
        confettiContainer.innerHTML = '';
        
        // Set up error handling for audio elements
        setupAudioErrorHandling();
        
        // We'll start background music after user interaction
        bgm.volume = 0.3;
        
        // Create an overlay to prompt user to tap for sound (iOS requirement)
        createAudioPrompt();
    }
    
    // Create overlay to prompt for interaction (required for iOS audio)
    function createAudioPrompt() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (!isIOS && !navigator.userAgent.includes('Safari')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'audio-prompt-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.cursor = 'pointer';
        
        const message = document.createElement('div');
        message.style.color = 'white';
        message.style.fontSize = '24px';
        message.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
        message.style.textAlign = 'center';
        message.style.padding = '20px';
        message.style.backgroundColor = '#ff6b6b';
        message.style.borderRadius = '15px';
        message.style.maxWidth = '80%';
        message.innerHTML = '👆 Tap to start the game with sound! 🔊';
        
        overlay.appendChild(message);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            // Initialize audio
            initAudioContext();
            
            // Play background music
            if (bgm) {
                bgm.muted = false;
                bgm.play().catch(error => console.log('Background music play error: ', error));
            }
            
            // Remove overlay
            overlay.remove();
        });
    }
    
    // Handle audio loading errors and initialize for iOS
    function setupAudioErrorHandling() {
        const audioElements = [spinSound, winSound, bgm];
        
        audioElements.forEach(audio => {
            // Make audio play on iOS (needs to be muted initially)
            audio.muted = true;
            audio.playsInline = true;
            audio.preload = 'auto';
            
            // Handle loading errors
            audio.addEventListener('error', (e) => {
                console.log(`Error loading audio file: ${audio.src}`, e);
                // The game will still work without sounds
            });
        });
    }
    
    // Initialize audio context for iOS Safari
    function initAudioContext() {
        if (audioInitialized) return true;
        
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Fix for iOS Safari - need to play and immediately pause all sounds
            const audioElements = [spinSound, winSound, bgm];
            
            // Unmute all audio elements
            audioElements.forEach(audio => {
                audio.muted = false;
                
                // Play and immediately pause to initialize audio
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }).catch(error => {
                        console.log('Audio play error: ', error);
                    });
                }
            });
            
            audioInitialized = true;
            return true;
        } catch (e) {
            console.error('Audio context initialization failed', e);
            return false;
        }
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
        
        // Play spin sound (if available)
        // Initialize audio context if needed (for iOS)
        if (!audioInitialized) {
            initAudioContext();
        }
        
        if (spinSound && spinSound.play) {
            spinSound.currentTime = 0;
            spinSound.muted = false;
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
        // Make sure audio is initialized (for iOS)
        if (!audioInitialized) {
            initAudioContext();
        }
        
        if (winSound && winSound.play) {
            winSound.currentTime = 0;
            winSound.muted = false;
            winSound.play().catch(err => console.log('Could not play win sound', err));
        }
        
        // Show confetti
        createConfetti();
        
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
        
        // Set new random items
        slots.forEach((slot, index) => {
            const randomItem = getRandomItem();
            slot.textContent = randomItem.emoji;
            currentItems[index] = randomItem;
        });
    });
    
    // Handle user interaction to enable audio (for compatibility with all browsers)
    document.addEventListener('click', () => {
        // Initialize audio if not already done
        if (!audioInitialized) {
            initAudioContext();
        }
        
        // Try to play background music
        if (bgm && bgm.paused) {
            bgm.muted = false;
            bgm.play().catch(error => console.log('Could not play audio: ', error));
        }
    }, { once: true });
    
    // Additional event listeners for iOS touch devices
    document.addEventListener('touchstart', () => {
        if (!audioInitialized) {
            initAudioContext();
        }
    }, { once: true });
    
    // Initialize the game
    initGame();
});