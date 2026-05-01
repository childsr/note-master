export type Clef = 'treble' | 'bass';

export interface NoteData {
  clef: Clef;
  key: string;  // e.g., 'c/4'
  name: string; // e.g., 'C'
}

const TREBLE_NOTES = [
  'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', // Middle C to B4
  'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5', // C5 to B5
  'c/6' // High C
];

const BASS_NOTES = [
  'e/2', 'f/2', 'g/2', 'a/2', 'b/2', // Low E to B2
  'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', // C3 to B3
  'c/4' // Middle C
];

export function getRandomNote(): NoteData {
  const clef: Clef = Math.random() > 0.5 ? 'treble' : 'bass';
  const notes = clef === 'treble' ? TREBLE_NOTES : BASS_NOTES;
  const key = notes[Math.floor(Math.random() * notes.length)];
  const name = key.charAt(0).toUpperCase();

  return { clef, key, name };
}
