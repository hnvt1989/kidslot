document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const slots = document.querySelectorAll('.slot-inner');
    const spinButton = document.getElementById('spin-button');
    const resetButton = document.getElementById('reset-button');
    const confettiContainer = document.getElementById('confetti-container');
    const princessContainer = document.getElementById('princess-container');
    const audioPermissionMessage = document.getElementById('audio-permission');
    const winsCountElement = document.getElementById('wins-count');
    
    // Audio elements
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');
    const bgm = document.getElementById('bgm');
    const spinningSound = document.getElementById('spinning-sound');
    
    // Audio initialization state
    let audioInitialized = false;
    
    // Win counter
    let winCount = 0;
    
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
        
        // Clear any previous confetti and princess animation
        confettiContainer.classList.add('hidden');
        confettiContainer.innerHTML = '';
        princessContainer.classList.add('hidden');
        
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
        const audioElements = [spinSound, winSound, bgm, spinningSound];
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
        // Disable both buttons during spin
        spinButton.disabled = true;
        resetButton.disabled = true;
        confettiContainer.classList.add('hidden');
        confettiContainer.innerHTML = '';
        princessContainer.classList.add('hidden');
        
        // Initialize audio if needed
        if (!audioInitialized) {
            initializeAudio();
        }
        
        // Play initial spin sound
        if (spinSound && spinSound.play) {
            spinSound.currentTime = 0;
            spinSound.muted = false;
            spinSound.volume = 0.7; // Set volume for spin sound
            spinSound.play().catch(err => console.log('Could not play spin sound', err));
        }
        
        // Play continuous spinning sound while reels are spinning
        if (spinningSound && spinningSound.play) {
            spinningSound.currentTime = 0;
            spinningSound.muted = false;
            spinningSound.volume = 0.5;
            spinningSound.loop = true; // Make it loop while spinning
            spinningSound.play().catch(err => console.log('Could not play spinning sound', err));
        }
        
        // Add spinning class
        slots.forEach(slot => {
            slot.parentElement.classList.add('spinning');
        });
        
        // Set different timeouts for each slot
        const stopTimes = [1000, 1500, 2000];
        
        // Determine if this spin should be a win (30% probability)
        const isWinningRound = Math.random() < 0.3;
        
        // Select a random item for the winning combination
        const winningItem = getRandomItem();
        
        // Stop each slot at different times
        slots.forEach((slot, index) => {
            setTimeout(() => {
                // Stop spinning
                slot.parentElement.classList.remove('spinning');
                
                if (isWinningRound) {
                    // For winning rounds, all slots show the same item
                    slot.textContent = winningItem.emoji;
                    currentItems[index] = winningItem;
                } else {
                    // For non-winning rounds
                    if (index === 2) {
                        // For the last slot, make sure it's different from at least one of the previous slots
                        // to ensure it's not a win
                        let randomItem;
                        
                        // Check if first two slots are the same
                        if (currentItems[0].name === currentItems[1].name) {
                            // If first two match, make sure the third is different
                            do {
                                randomItem = getRandomItem();
                            } while (randomItem.name === currentItems[0].name);
                        } else {
                            // If first two are already different, just pick any random item
                            randomItem = getRandomItem();
                        }
                        
                        slot.textContent = randomItem.emoji;
                        currentItems[index] = randomItem;
                    } else {
                        // Normal random item for slots 1 and 2
                        const randomItem = getRandomItem();
                        slot.textContent = randomItem.emoji;
                        currentItems[index] = randomItem;
                    }
                }
                
                // Check if all slots have stopped
                if (index === slots.length - 1) {
                    setTimeout(() => {
                        // Stop the spinning sound
                        if (spinningSound && spinningSound.pause) {
                            spinningSound.pause();
                            spinningSound.currentTime = 0;
                            spinningSound.loop = false;
                        }
                        
                        checkResult();
                        isSpinning = false;
                        
                        // Keep buttons disabled for 6 seconds after spin completes
                        setTimeout(() => {
                            spinButton.disabled = false;
                            resetButton.disabled = false;
                        }, 6000);
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
            winSound.volume = 1.0; // Ensure full volume for celebration
            winSound.play().catch(err => console.log('Could not play win sound', err));
        }
        
        // Increment win counter and update display
        winCount++;
        winsCountElement.textContent = winCount;
        
        // Animate the win counter
        winsCountElement.style.animation = 'none';
        setTimeout(() => {
            winsCountElement.style.animation = 'rainbow 2s linear infinite';
            
            // Add a larger size temporarily
            winsCountElement.style.fontSize = '2.5rem';
            winsCountElement.style.transition = 'all 0.3s';
            
            // Return to normal size after animation
            setTimeout(() => {
                winsCountElement.style.fontSize = '';
            }, 1000);
        }, 10);
        
        // Show confetti
        createConfetti();
        
        // Display princess animation
        showPrincessAnimation();
        
        // Make slots bounce to celebrate
        slots.forEach(slot => {
            slot.parentElement.style.animation = 'bounce 0.5s ease-in-out 3';
        });
        
        // Add jackpot speech after a short delay
        setTimeout(() => {
            // Simple congratulation message
            const congratsText = "Good job, you win!";
            
            const utterance = new SpeechSynthesisUtterance(congratsText);
            utterance.rate = 0.9;
            utterance.pitch = 1.3;
            window.speechSynthesis.speak(utterance);
        }, 1500);
    }
    
    // Show princess animation
    function showPrincessAnimation() {
        // Clear any previous animation
        princessContainer.innerHTML = '';
        
        // Create princess character
        const princessChar = document.createElement('div');
        princessChar.className = 'princess-character';
        princessChar.textContent = '👸';
        princessContainer.appendChild(princessChar);
        
        // Show the container
        princessContainer.classList.remove('hidden');
        
        // Hide the container after animation completes
        setTimeout(() => {
            princessContainer.classList.add('hidden');
        }, 3000);
    }
    
    // Create confetti effect
    function createConfetti() {
        confettiContainer.classList.remove('hidden');
        
        // Create 250 confetti pieces with different shapes (increased count)
        for (let i = 0; i < 250; i++) {
            const confetti = document.createElement('div');
            
            // Randomly choose between different shapes with more fun options
            const shapeType = Math.floor(Math.random() * 6); // Increased shape variety
            
            if (shapeType === 0) {
                // Square confetti
                confetti.style.width = `${Math.random() * 20 + 10}px`; // Larger squares
                confetti.style.height = `${Math.random() * 20 + 10}px`;
                confetti.style.backgroundColor = getRandomColor();
                // Add sparkle effect to some squares
                if (Math.random() > 0.7) {
                    confetti.style.boxShadow = `0 0 5px 2px ${getRandomColor(true)}`;
                }
            } else if (shapeType === 1) {
                // Circle confetti
                const size = Math.random() * 20 + 10; // Larger circles
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.backgroundColor = getRandomColor();
                confetti.style.borderRadius = '50%';
                // Add sparkle effect to some circles
                if (Math.random() > 0.7) {
                    confetti.style.boxShadow = `0 0 8px 3px ${getRandomColor(true)}`;
                }
            } else if (shapeType === 2) {
                // Star emoji confetti
                confetti.style.fontSize = `${Math.random() * 25 + 25}px`; // Larger stars
                confetti.innerHTML = '⭐';
                confetti.style.color = getRandomColor();
                // Add text shadow for glow effect
                confetti.style.textShadow = `0 0 5px ${getRandomColor(true)}`;
            } else if (shapeType === 3) {
                // Party emoji confetti - expanded selection of fun emojis
                const emojis = [
                    '🎉', '🎊', '🎈', '🎂', '🎁', '🥳', '😃', '👏', '💯', '🦄', '🌈',
                    '🍭', '🍬', '🍫', '🍦', '🧸', '🎮', '🏆', '🥇', '🪄', '✨', '💫', '🎯',
                    '🦸‍♀️', '🧜‍♀️', '👸', '🧚', '🦹‍♂️', '🧙‍♂️', '🦁', '🐱', '🐶', '🐼', '🦊'
                ];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.style.fontSize = `${Math.random() * 30 + 20}px`; // Larger emojis
                confetti.innerHTML = emoji;
                // Add text shadow for glow effect
                confetti.style.textShadow = `0 0 5px ${getRandomColor(true)}`;
            } else if (shapeType === 4) {
                // Heart shape
                confetti.style.fontSize = `${Math.random() * 25 + 25}px`;
                confetti.innerHTML = '❤️';
                confetti.style.color = getRandomColor();
            } else {
                // Sparkle/Glitter particle
                const size = Math.random() * 8 + 4; // Small sparkles
                confetti.style.width = `${size}px`;
                confetti.style.height = `${size}px`;
                confetti.style.backgroundColor = getRandomColor(true); // Brighter colors
                confetti.style.borderRadius = '50%';
                confetti.style.boxShadow = `0 0 ${size * 2}px ${size}px ${getRandomColor(true)}`; // Glow effect
            }
            
            confetti.style.position = 'absolute';
            
            // Distribute confetti more widely
            confetti.style.left = `${Math.random() * 100}%`;
            
            // Start some confetti from the bottom for more fun
            if (Math.random() > 0.8) {
                confetti.style.bottom = `0`;
                confetti.style.top = 'auto';
            } else {
                confetti.style.top = `-20px`;
            }
            
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = `${Math.random() * 0.5 + 0.5}`;
            confetti.style.zIndex = '1000';
            
            // Add some wobble and spin to the animation
            const fallDuration = Math.random() * 4 + 3; // Longer fall duration
            const spinDirection = Math.random() > 0.5 ? 1 : -1;
            const spinAmount = Math.random() * 6 + 3;
            
            // Add more varied animations
            if (Math.random() > 0.7) {
                // Some confetti will have a zig-zag fall
                confetti.style.animation = `zigzagFall ${fallDuration}s ease-in forwards, spin ${spinAmount}s linear infinite ${spinDirection > 0 ? '' : 'reverse'}`;
            } else {
                // Regular falling confetti
                confetti.style.animation = `fall ${fallDuration}s ease-in forwards, spin ${spinAmount}s linear infinite ${spinDirection > 0 ? '' : 'reverse'}`;
            }
            
            confettiContainer.appendChild(confetti);
        }
        
        // Add animations with more dynamic movement
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0); opacity: 1; }
                25% { transform: translateY(25vh) translateX(${Math.random() * 20 - 10}vw) rotate(${Math.random() * 180}deg); }
                50% { transform: translateY(50vh) translateX(${Math.random() * -20 + 10}vw) rotate(${Math.random() * 360}deg); }
                75% { transform: translateY(75vh) translateX(${Math.random() * 20 - 10}vw) rotate(${Math.random() * 540}deg); }
                100% { transform: translateY(100vh) rotate(${Math.random() * 720}deg); opacity: 0; }
            }
            
            @keyframes zigzagFall {
                0% { transform: translateY(0) translateX(0) rotate(0); opacity: 1; }
                20% { transform: translateY(20vh) translateX(30px) rotate(${Math.random() * 180}deg); }
                40% { transform: translateY(40vh) translateX(-30px) rotate(${Math.random() * 360}deg); }
                60% { transform: translateY(60vh) translateX(30px) rotate(${Math.random() * 540}deg); }
                80% { transform: translateY(80vh) translateX(-30px) rotate(${Math.random() * 720}deg); }
                100% { transform: translateY(100vh) translateX(0) rotate(${Math.random() * 900}deg); opacity: 0; }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Add a celebratory background flash effect
        const flashOverlay = document.createElement('div');
        flashOverlay.style.position = 'fixed';
        flashOverlay.style.top = '0';
        flashOverlay.style.left = '0';
        flashOverlay.style.width = '100%';
        flashOverlay.style.height = '100%';
        flashOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        flashOverlay.style.zIndex = '999';
        flashOverlay.style.pointerEvents = 'none';
        flashOverlay.style.animation = 'flash 0.5s ease-out';
        
        const flashStyle = document.createElement('style');
        flashStyle.textContent = `
            @keyframes flash {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(flashStyle);
        document.body.appendChild(flashOverlay);
        
        // Remove flash overlay after animation
        setTimeout(() => {
            if (document.body.contains(flashOverlay)) {
                document.body.removeChild(flashOverlay);
            }
        }, 500);
        
        // Remove confetti after animation completes
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 10000); // Longer confetti duration
    }
    
    // Get random bright color
    function getRandomColor(bright = false) {
        // Original color palette
        const colors = [
            '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
            '#F72585', '#7209B7', '#3A0CA3', '#4CC9F0', '#4361EE'
        ];
        
        // Brighter, more vibrant colors for special effects
        const brightColors = [
            '#FF0000', '#FF9500', '#FFFF00', '#00FF00', '#00FFFF', 
            '#0000FF', '#9500FF', '#FF00FF', '#FF007B', '#00E5FF',
            '#FFA6A6', '#FFE066', '#A6FFE8', '#A6C4FF', '#D5A6FF'
        ];
        
        return bright ? 
            brightColors[Math.floor(Math.random() * brightColors.length)] : 
            colors[Math.floor(Math.random() * colors.length)];
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
        princessContainer.classList.add('hidden');
        
        // Reset win counter
        winCount = 0;
        winsCountElement.textContent = winCount;
        winsCountElement.style.animation = 'none';
        
        // Restore normal counter style
        winsCountElement.style.fontSize = '';
        
        // Reset slot animations
        slots.forEach(slot => {
            slot.parentElement.style.animation = 'none';
        });
        
        // Set new random items
        slots.forEach((slot, index) => {
            const randomItem = getRandomItem();
            slot.textContent = randomItem.emoji;
            currentItems[index] = randomItem;
        });
        
        // Play a reset sound effect to make it fun
        if (spinSound && spinSound.play) {
            spinSound.currentTime = 0;
            spinSound.muted = false;
            spinSound.volume = 0.5;
            spinSound.play().catch(err => console.log('Could not play spin sound', err));
        }
        
        // Add a fun "reset" speech
        setTimeout(() => {
            const resetText = "Let's play again! Good luck!";
            const utterance = new SpeechSynthesisUtterance(resetText);
            utterance.rate = 1.0;
            utterance.pitch = 1.2;
            window.speechSynthesis.speak(utterance);
        }, 300);
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