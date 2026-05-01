export const noteToFreq: Record<string, number> = {
  'e/2': 82.41,
  'f/2': 87.31,
  'g/2': 98.00,
  'a/2': 110.00,
  'b/2': 123.47,
  'c/3': 130.81,
  'd/3': 146.83,
  'e/3': 164.81,
  'f/3': 174.61,
  'g/3': 196.00,
  'a/3': 220.00,
  'b/3': 246.94,
  'c/4': 261.63,
  'd/4': 293.66,
  'e/4': 329.63,
  'f/4': 349.23,
  'g/4': 392.00,
  'a/4': 440.00,
  'b/4': 493.88,
  'c/5': 523.25,
  'd/5': 587.33,
  'e/5': 659.25,
  'f/5': 698.46,
  'g/5': 783.99,
  'a/5': 880.00,
  'b/5': 987.77,
  'c/6': 1046.50
};

let audioCtx: AudioContext | null = null;

export function playNote(noteKey: string) {
  const freq = noteToFreq[noteKey];
  if (!freq) return;

  if (!audioCtx) {
    audioCtx = new window.AudioContext();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // A nice electric piano/sine combo sound
  oscillator.type = 'sine';
  oscillator.frequency.value = freq;

  // Envelope
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.8);
}
