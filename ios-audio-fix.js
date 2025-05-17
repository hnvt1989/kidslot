/**
 * Utility script for fixing audio playback on iOS devices.
 * This file should be included before your main JavaScript.
 * 
 * It works by setting up audio context and handling user interaction
 * requirements specific to iOS Safari.
 */

// iOS audio fix - must be applied before any other audio code
(function() {
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Skip if not iOS
    if (!isIOS && !isSafari) return;
    
    // Flag to track if audio has been unlocked
    window.audioUnlocked = false;
    
    // Set up audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    
    // Function to unlock audio
    function unlockAudio() {
        if (window.audioUnlocked) return;
        
        // Create temporary audio context
        const audioContext = new AudioContext();
        
        // Resume audio context for newer browsers
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Create and play silent buffer to unlock audio
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        // Find all audio elements and play-pause them
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            // Unmute for iOS
            audio.muted = false;
            
            // Try to play
            const promise = audio.play();
            if (promise !== undefined) {
                promise.then(() => {
                    // Pause immediately (we just want to unlock)
                    audio.pause();
                    audio.currentTime = 0;
                }).catch(err => {
                    console.log('Auto-play prevented: ', err);
                });
            }
        });
        
        // Mark as unlocked
        window.audioUnlocked = true;
        
        // Remove event listeners
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('touchend', unlockAudio);
        document.removeEventListener('click', unlockAudio);
    }
    
    // Add event listeners for user interactions
    document.addEventListener('touchstart', unlockAudio, false);
    document.addEventListener('touchend', unlockAudio, false);
    document.addEventListener('click', unlockAudio, false);
    
    console.log('iOS audio fix initialized');
})();