// Web Audio API setup
let audioContext;
let oscillator;
let gainNode;
let lfo;
let lfoGain;
let isPlaying = false;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0; // Start silent
  }
}

export function playWindSound() {
  if (isPlaying) return;

  initAudio();

  // Create oscillator for wind-like sound
  oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = 80; // Low frequency for wind

  // Add slight frequency modulation for natural sound
  lfo = audioContext.createOscillator();
  lfo.frequency.value = 0.5; // Slow modulation
  lfoGain = audioContext.createGain();
  lfoGain.gain.value = 10;

  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);

  oscillator.connect(gainNode);
  oscillator.start();
  lfo.start();

  isPlaying = true;
}

export function fadeInWind(targetVolume = 0.2, duration = 2) {
  if (!gainNode) return;

  const currentTime = audioContext.currentTime;
  gainNode.gain.cancelScheduledValues(currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + duration);
}

export function fadeOutWind(duration = 2) {
  if (!gainNode) return;

  const currentTime = audioContext.currentTime;
  gainNode.gain.cancelScheduledValues(currentTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
  gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
}

export function stopWind() {
  if (oscillator) {
    oscillator.stop();
    isPlaying = false;
  }
}

export function setWindVolume(volume) {
  if (gainNode) {
    gainNode.gain.value = volume;
  }
}

