document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const slots = document.querySelectorAll('.slot-inner');
    const spinButton = document.getElementById('spin-button');
    const resetButton = document.getElementById('reset-button');
    const confettiContainer = document.getElementById('confetti-container');
    
    // Audio handling - using HTML Audio + Web Audio API for iOS support
    let audioContext;
    let audioInitialized = false;
    
    // Audio buffers and sources
    let spinSoundBuffer = null;
    let winSoundBuffer = null;
    let bgmBuffer = null;
    let bgmSource = null;
    let bgmPlaying = false;
    
    // Create audio elements programmatically
    const spinSound = document.getElementById('spin-sound');
    const winSound = document.getElementById('win-sound');
    const bgm = document.getElementById('bgm');
    const audioUnlockButton = document.getElementById('audio-unlock');
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
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
        
        // Set up Web Audio API
        setupWebAudio();
        
        // Create an overlay to prompt user to tap for sound (iOS requirement)
        createAudioPrompt();
    }
    
    // Create overlay to prompt for interaction (required for iOS audio)
    function createAudioPrompt() {
        // Skip if not iOS or Safari and audio is already initialized
        if ((!isIOS && !isSafari) || audioInitialized) return;
        
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
            // Unlock audio for iOS
            unlockAudioForIOS();
            
            // Play background music using Web Audio API
            playBackgroundMusic();
            
            // Remove overlay
            overlay.remove();
        });
    }
    
    // Create and configure Web Audio API for iOS compatibility
    function setupWebAudio() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            
            // Function to load audio file into buffer
            const loadAudioFile = (url, callback) => {
                const request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                
                request.onload = () => {
                    audioContext.decodeAudioData(
                        request.response,
                        (buffer) => {
                            callback(buffer);
                        },
                        (error) => {
                            console.error('Error decoding audio data', error);
                        }
                    );
                };
                
                request.onerror = () => {
                    console.error('Error loading audio file', url);
                };
                
                request.send();
            };
            
            // Load spin sound
            loadAudioFile('sounds/spin.mp3', (buffer) => {
                spinSoundBuffer = buffer;
                console.log('Spin sound loaded');
            });
            
            // Load win sound
            loadAudioFile('sounds/win.mp3', (buffer) => {
                winSoundBuffer = buffer;
                console.log('Win sound loaded');
            });
            
            // Load background music
            loadAudioFile('sounds/background.mp3', (buffer) => {
                bgmBuffer = buffer;
                console.log('Background music loaded');
            });
            
            return true;
        } catch (e) {
            console.error('Web Audio API not supported', e);
            return false;
        }
    }
    
    // Play sound using Web Audio API
    function playSound(buffer) {
        if (!audioContext || !buffer) return;
        
        try {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            return source;
        } catch (e) {
            console.error('Error playing audio', e);
            return null;
        }
    }
    
    // Play background music with looping
    function playBackgroundMusic() {
        if (!audioContext || !bgmBuffer || bgmPlaying) return;
        
        try {
            if (bgmSource) {
                bgmSource.stop();
            }
            
            bgmSource = audioContext.createBufferSource();
            bgmSource.buffer = bgmBuffer;
            
            // Create gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.3; // Lower volume
            
            bgmSource.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            bgmSource.loop = true;
            bgmSource.start(0);
            bgmPlaying = true;
            
            return bgmSource;
        } catch (e) {
            console.error('Error playing background music', e);
            return null;
        }
    }
    
    // Unlock audio on iOS
    function unlockAudioForIOS() {
        if (audioInitialized) return true;
        
        // Create and start audio context
        if (!audioContext) {
            setupWebAudio();
        }
        
        // Resume audio context (needed for newer browsers)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Play a silent buffer to unlock the audio
        const silentBuffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        // Try to play and immediately pause HTML audio elements as backup
        const audioElements = [spinSound, winSound, bgm];
        audioElements.forEach(audio => {
            if (audio) {
                audio.muted = false;
                const promise = audio.play();
                if (promise !== undefined) {
                    promise.then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                    }).catch(e => console.log('Audio play error:', e));
                }
            }
        });
        
        audioInitialized = true;
        return true;
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
        
        // Play spin sound using Web Audio API
        if (!audioInitialized) {
            unlockAudioForIOS();
        }
        
        // Play using Web Audio API if available, fallback to HTML Audio
        if (spinSoundBuffer) {
            playSound(spinSoundBuffer);
        } else if (spinSound && spinSound.play) {
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
        // Play win sound using Web Audio API
        if (!audioInitialized) {
            unlockAudioForIOS();
        }
        
        // Play using Web Audio API if available, fallback to HTML Audio
        if (winSoundBuffer) {
            playSound(winSoundBuffer);
        } else if (winSound && winSound.play) {
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