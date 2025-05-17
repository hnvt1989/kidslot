document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const slots = document.querySelectorAll('.slot-inner');
    const spinButton = document.getElementById('spin-button');
    const resetButton = document.getElementById('reset-button');
    const confettiContainer = document.getElementById('confetti-container');
    const audioPermissionMessage = document.getElementById('audio-permission');
    
    // Audio elements
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');
    const bgm = document.getElementById('bgm');
    
    // Audio initialization state
    let audioInitialized = false;
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // Array of items for the slot machine
    const items = [
        // Animals
        { emoji: '🐶', name: 'puppy' },
        { emoji: '🐱', name: 'kitty' },
        { emoji: '🐵', name: 'monkey' },
        { emoji: '🐰', name: 'bunny' },
        { emoji: '🦁', name: 'lion' },
        { emoji: '🐼', name: 'panda' },
        { emoji: '🦊', name: 'fox' },
        { emoji: '🐻', name: 'bear' },
        { emoji: '🦄', name: 'unicorn' },
        
        // Princess and magical characters
        { emoji: '👸', name: 'princess' },
        { emoji: '🧚', name: 'fairy' },
        { emoji: '🧜‍♀️', name: 'mermaid' },
        { emoji: '🧙‍♂️', name: 'wizard' },
        { emoji: '🦸‍♀️', name: 'superhero' },
        
        // Emotions and faces
        { emoji: '😃', name: 'happy face' },
        { emoji: '😄', name: 'laughing face' },
        { emoji: '🤗', name: 'hugging face' },
        { emoji: '😲', name: 'wow face' },
        { emoji: '🥳', name: 'party face' },
        
        // Extra fun items
        { emoji: '🌈', name: 'rainbow' },
        { emoji: '⭐', name: 'star' },
        { emoji: '🍦', name: 'ice cream' },
        { emoji: '🎈', name: 'balloon' },
        { emoji: '🎁', name: 'present' }
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
        
        // Show audio instructions for mobile devices
        if (isIOS || isAndroid) {
            audioPermissionMessage.style.display = 'block';
            
            // Handle dismiss button
            document.getElementById('dismiss-audio-warning').addEventListener('click', () => {
                audioPermissionMessage.style.display = 'none';
            });
            
            // Handle enable audio button
            document.getElementById('enable-audio').addEventListener('click', () => {
                initializeAudio();
                
                // Show feedback to the user
                const enableButton = document.getElementById('enable-audio');
                enableButton.textContent = "Audio Enabled!";
                enableButton.style.backgroundColor = "#4CAF50";
                
                // Hide the overlay after a short delay
                setTimeout(() => {
                    audioPermissionMessage.style.display = 'none';
                }, 1500);
            });
            
            // Handle test audio button
            document.getElementById('test-audio').addEventListener('click', () => {
                try {
                    // Play a test sound
                    const testAudio = new Audio("https://cdn.freesound.org/previews/242/242758_4484625-lq.mp3");
                    testAudio.volume = 1.0;
                    
                    const testButton = document.getElementById('test-audio');
                    testButton.textContent = "Playing test...";
                    
                    testAudio.play().then(() => {
                        testButton.textContent = "Audio Works! ✓";
                        testButton.style.backgroundColor = "#4CAF50";
                    }).catch(error => {
                        console.error("Test audio error:", error);
                        testButton.textContent = "Audio Failed! Try again";
                        testButton.style.backgroundColor = "#F44336";
                    });
                } catch (error) {
                    console.error("Error setting up test audio:", error);
                }
            });
        }
        
        // Initialize audio on any user interaction
        document.body.addEventListener('click', initializeAudio, { once: true });
    }
    
    // Function to initialize audio context and speech synthesis
    function initializeAudio() {
        if (audioInitialized) return;
        
        console.log("Initializing audio...");
        
        // Create a short silent sound and play it to initialize audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioContext = new AudioContext();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0; // Silent
            gainNode.connect(audioContext.destination);
            
            // Create and play a short sound
            const oscillator = audioContext.createOscillator();
            oscillator.connect(gainNode);
            oscillator.start();
            oscillator.stop(0.001);
        }
        
        // Try to initialize speech synthesis
        if ('speechSynthesis' in window) {
            // Create a short utterance and speak it silently
            const speech = new SpeechSynthesisUtterance('');
            speech.volume = 0;
            window.speechSynthesis.speak(speech);
        }
        
        // Play a silent audio to unlock audio playback on iOS
        const silentAudio = new Audio("data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgAAAAA=");
        silentAudio.play().catch(e => console.log("Silent audio play error:", e));
        
        // Attempt to unlock all audio elements
        const audioElements = [spinSound, winSound, bgm];
        audioElements.forEach(audio => {
            if (audio) {
                // Make sure audio is not muted
                audio.muted = false;
                
                // Load and try to play/pause to unlock
                audio.load();
                audio.play()
                    .then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        console.log(`Unlocked audio: ${audio.id}`);
                    })
                    .catch(error => {
                        console.log(`Failed to unlock audio ${audio.id}:`, error);
                    });
            }
        });
        
        // Set background music volume
        if (bgm) {
            bgm.volume = 0.3;
            
            // Start background music
            bgm.play().catch(e => console.log("BGM play error:", e));
        }
        
        audioInitialized = true;
        console.log("Audio initialization complete!");
        
        return true;
    }
    
    // Get a random item with higher chance of matching
    function getRandomItem() {
        // Create a weighted selection system to increase chance of matches
        
        // Define which groups of items are likely to be selected
        const itemGroups = [
            // Popular items group (higher probability)
            items.slice(0, 9),     // Animals (most common)
            items.slice(9, 14),    // Princess and magical characters
            items.slice(14, 19),   // Emotions/faces
            items.slice(19, 24)    // Extra fun items
        ];
        
        // Weights for each group - animals appear more often
        const groupWeights = [0.5, 0.2, 0.15, 0.15]; // Adds to 1.0
        
        // First decide which group to pick from
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedGroup = 0;
        
        for (let i = 0; i < groupWeights.length; i++) {
            cumulativeWeight += groupWeights[i];
            if (randomValue < cumulativeWeight) {
                selectedGroup = i;
                break;
            }
        }
        
        // Pick a random item from the selected group
        const group = itemGroups[selectedGroup];
        const randomIndex = Math.floor(Math.random() * group.length);
        
        // Special case to increase winning chances: 25% of the time, return a previously selected item
        if (currentItems[0] && Math.random() < 0.25) {
            return currentItems[0];
        }
        
        return group[randomIndex];
    }
    
    // Spin animation
    function spin() {
        if (isSpinning) return;
        
        isSpinning = true;
        spinButton.disabled = true;
        confettiContainer.classList.add('hidden');
        confettiContainer.innerHTML = '';
        
        // Initialize audio if needed and play spin sound
        if (!audioInitialized) {
            initializeAudio();
        }
        
        // Play spin sound
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
        // Initialize audio if needed and play win sound
        if (!audioInitialized) {
            initializeAudio();
        }
        
        // Play win sound
        if (winSound && winSound.play) {
            winSound.currentTime = 0;
            winSound.muted = false;
            winSound.play().catch(err => console.log('Could not play win sound', err));
        }
        
        // Show confetti
        createConfetti();
        
        // Add jackpot speech after a short delay
        setTimeout(() => {
            const congratsText = `HOORAY! You got three ${currentItems[0].name}s! WOW! You're AWESOME! That's AMAZING!`;
            const utterance = new SpeechSynthesisUtterance(congratsText);
            utterance.rate = 0.9;
            utterance.pitch = 1.3;
            window.speechSynthesis.speak(utterance);
        }, 1500);
    }
    
    // Create confetti effect
    function createConfetti() {
        confettiContainer.classList.remove('hidden');
        
        // Create 150 confetti pieces with different shapes
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            
            // Randomly choose between different shapes
            const shapeType = Math.floor(Math.random() * 4);
            
            if (shapeType === 0) {
                // Square confetti
                confetti.style.width = `${Math.random() * 15 + 10}px`;
                confetti.style.height = `${Math.random() * 15 + 10}px`;
                confetti.style.backgroundColor = getRandomColor();
            } else if (shapeType === 1) {
                // Circle confetti
                const size = Math.random() * 15 + 10;
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.backgroundColor = getRandomColor();
                confetti.style.borderRadius = '50%';
            } else if (shapeType === 2) {
                // Star emoji confetti
                confetti.style.fontSize = `${Math.random() * 15 + 20}px`;
                confetti.innerHTML = '⭐';
                confetti.style.color = getRandomColor();
            } else {
                // Party emoji confetti - random selection of fun emojis
                const emojis = ['🎉', '🎊', '🎈', '🎂', '🎁', '🥳', '😃', '👏', '💯', '🦄', '🌈'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.fontSize = `${Math.random() * 20 + 20}px`;
                confetti.innerHTML = emoji;
            }
            
            confetti.style.position = 'absolute';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `-20px`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = `${Math.random() * 0.5 + 0.5}`;
            
            // Add some wobble and spin to the animation
            const fallDuration = Math.random() * 3 + 3;
            const spinDirection = Math.random() > 0.5 ? 1 : -1;
            const spinAmount = Math.random() * 5 + 3;
            
            confetti.style.animation = `fall ${fallDuration}s ease-in forwards, spin ${spinAmount}s linear infinite ${spinDirection > 0 ? '' : 'reverse'}`;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0); opacity: 1; }
                25% { transform: translateY(25vh) translateX(${Math.random() * 10 - 5}vw) rotate(${Math.random() * 180}deg); }
                50% { transform: translateY(50vh) translateX(${Math.random() * -10 + 5}vw) rotate(${Math.random() * 360}deg); }
                75% { transform: translateY(75vh) translateX(${Math.random() * 10 - 5}vw) rotate(${Math.random() * 540}deg); }
                100% { transform: translateY(100vh) rotate(${Math.random() * 720}deg); opacity: 0; }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Remove confetti after animation completes
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 8000);
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
    function setupAudioEventListeners() {
        // Add event listener to hidden button for iOS specific unlocking
        if (audioUnlockButton) {
            audioUnlockButton.addEventListener('touchend', function(e) {
                e.preventDefault();
                if (!audioInitialized) {
                    unlockAudioForIOS();
                    playBackgroundMusic();
                }
            });
            
            // Programmatically trigger a click after a short delay
            setTimeout(() => {
                audioUnlockButton.click();
            }, 1000);
        }
        
        // Click event for all devices
        document.addEventListener('click', () => {
            // Unlock audio for iOS
            if (!audioInitialized) {
                unlockAudioForIOS();
                playBackgroundMusic();
            }
        }, { once: true });
        
        // Touch events specifically for iOS
        document.addEventListener('touchstart', () => {
            if (!audioInitialized) {
                unlockAudioForIOS();
                playBackgroundMusic();
            }
        }, { once: true });
        
        // Touchend event (crucial for iOS Safari)
        document.body.addEventListener('touchend', () => {
            if (!audioInitialized) {
                unlockAudioForIOS();
                setTimeout(() => {
                    playBackgroundMusic();
                }, 100);
            }
        }, { once: true });
        
        // Special handling for spinButton 
        spinButton.addEventListener('touchend', function(e) {
            if (!audioInitialized) {
                e.preventDefault(); // Prevent default just once for audio initialization
                unlockAudioForIOS();
                playBackgroundMusic();
            }
        }, { once: true });
    }
    
    // Call setup for audio events
    setupAudioEventListeners();
    
    // Initialize the game
    initGame();
});