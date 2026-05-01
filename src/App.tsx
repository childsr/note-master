/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Staff } from './components/Staff';
import { getRandomNote, NoteData } from './lib/notes';
import { playNote } from './lib/audio';
import { cn } from './lib/utils';
import { Play, RotateCcw, Music, Timer, Trophy } from 'lucide-react';

type GameStatus = 'idle' | 'playing' | 'finished';

const GAME_DURATION = 60; // 60 seconds

export default function App() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentNote, setCurrentNote] = useState<NoteData | null>(null);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('note_master_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // To avoid rapid multi-firing of correct inputs:
  const isTransitioningRef = useRef(false);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (status === 'playing' && currentNote && soundEnabledRef.current) {
      playNote(currentNote.key);
    }
  }, [status, currentNote]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStatus('playing');
    setCurrentNote(getRandomNote());
    setFlash(null);
    isTransitioningRef.current = false;
  };

  useEffect(() => {
    if (status !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          setStatus('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === 'finished' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('note_master_highscore', score.toString());
    }
  }, [status, score, highScore]);

  const handleGuess = useCallback((guess: string) => {
    if (status !== 'playing' || !currentNote || isTransitioningRef.current) return;

    if (guess.toUpperCase() === currentNote.name) {
      // Correct
      setScore(s => s + 1);
      setFlash('correct');
      isTransitioningRef.current = true;
      
      setTimeout(() => {
        setCurrentNote(getRandomNote());
        setFlash(null);
        isTransitioningRef.current = false;
      }, 150);
    } else {
      // Wrong
      setScore(s => s - 1);
      setFlash('wrong');
      setTimeout(() => setFlash(null), 150);
    }
  }, [status, currentNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      
      // Do not capture if user is holding Command/Ctrl to allow normal browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleGuess]);

  const renderVirtualKeyboard = () => {
    // Natural notes in standard order starting from A
    const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return (
      <div className="flex gap-1 sm:gap-2 justify-center mt-3 sm:mt-4 flex-nowrap overflow-x-auto px-2 pb-2 -mx-2 hide-scrollbar">
        {keys.map(k => (
          <button
            key={k}
            onClick={() => handleGuess(k)}
            disabled={status !== 'playing'}
            className={cn(
              "w-11 sm:w-16 h-12 sm:h-16 shrink-0 bg-white border-2 border-slate-200 rounded-xl shadow-sm text-xl sm:text-2xl font-bold text-slate-700 transition-all flex items-center justify-center",
              "focus:outline-none focus:ring-4 focus:ring-indigo-500/20",
              status === 'playing' 
                ? "hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:bg-indigo-100 active:scale-95 cursor-pointer" 
                : "opacity-50 cursor-not-allowed"
            )}
          >
            {k}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-indigo-100 text-indigo-700 rounded-xl sm:rounded-2xl mb-2 sm:mb-4">
            <Music className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Note Master</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">Test your sight-reading speed!</p>
        </div>

        {/* Main Game Interface */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          
          {/* Top Stats Bar */}
          <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Timer className={cn("w-5 h-5", timeLeft <= 10 && status === 'playing' ? "text-amber-500 animate-pulse" : "text-slate-400")} />
              <span className={cn(
                "font-mono text-xl font-bold transition-colors",
                timeLeft <= 10 && status === 'playing' ? "text-amber-600" : "text-slate-700"
              )}>
                0:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">High</span>
                <span className="font-mono text-xl font-bold text-slate-500">{highScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Score</span>
                <span className="font-mono text-xl font-bold text-indigo-600">{score}</span>
              </div>
            </div>
          </div>

          {/* Staff Area */}
          <div className="px-4 py-8 sm:py-10 relative flex items-center justify-center min-h-[220px]">
            {status === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 p-4 sm:p-6 text-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Ready to read?</h2>
                  <p className="text-sm sm:text-base text-slate-500 mb-6 max-w-[250px] mx-auto">
                    You have 60 seconds to identify as many notes as possible using your keyboard or the buttons below.
                  </p>
                  <button
                    onClick={startGame}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/20"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Start Quiz
                  </button>
                </div>
              </div>
            )}

            {status === 'finished' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-10 p-6 text-center backdrop-blur-sm">
                <div>
                  <div className="inline-flex items-center justify-center p-4 bg-amber-100 text-amber-600 rounded-full mb-4">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">Time's up!</h2>
                  <p className="text-slate-500 mt-2 mb-2">
                    You accurately read <span className="font-bold text-indigo-600">{score}</span> notes.
                  </p>
                  {score > highScore && highScore > 0 ? (
                    <p className="text-green-600 font-bold mb-6 text-sm animate-bounce">
                      New High Score!
                    </p>
                  ) : (
                    <p className="text-slate-400 mb-6 text-sm">
                      Best: {Math.max(score, highScore)}
                    </p>
                  )}
                  <button
                    onClick={startGame}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 active:bg-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-900/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Note Display Container */}
            <div className={cn(
              "w-full max-w-full transition-all duration-150 rounded-2xl relative",
              flash === 'correct' && "bg-green-50 ring-2 ring-green-200 ring-inset scale-[1.02]",
              flash === 'wrong' && "bg-red-50 ring-2 ring-red-200 ring-inset scale-[0.98] animate-shake"
            )}>
              {currentNote && (
                <Staff clef={currentNote.clef} noteKey={currentNote.key} />
              )}
            </div>
          </div>
          
        </div>

        {/* Input Methods */}
        <div className="mt-4 sm:mt-6">
          <p className="text-center text-xs sm:text-sm font-medium text-slate-400 mb-2 sm:mb-4 tracking-wide uppercase">
            Use physical keyboard (A-G) or
          </p>
          {renderVirtualKeyboard()}

          <div className="mt-6 flex justify-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" 
              />
              <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                Play note sound
              </span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
