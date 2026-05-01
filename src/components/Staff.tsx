import React, { useRef, useEffect } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice, StaveConnector } from 'vexflow';

interface StaffProps {
  clef: 'treble' | 'bass';
  noteKey: string; // e.g., 'c/4'
}

export function Staff({ clef, noteKey }: StaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous rendering
    containerRef.current.innerHTML = '';
    
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    // Setting dimensions of the internal canvas/svg
    renderer.resize(250, 210);
    const context = renderer.getContext();
    
    const trebleStave = new Stave(10, 10, 220);
    trebleStave.addClef('treble').setContext(context).draw();
    
    const bassStave = new Stave(10, 100, 220);
    bassStave.addClef('bass').setContext(context).draw();

    const conn_brace = new StaveConnector(trebleStave, bassStave);
    conn_brace.setType(StaveConnector.type.BRACE);
    conn_brace.setContext(context).draw();

    const conn_line = new StaveConnector(trebleStave, bassStave);
    conn_line.setType(StaveConnector.type.SINGLE_LEFT);
    conn_line.setContext(context).draw();
    
    const note = new StaveNote({ clef: clef, keys: [noteKey], duration: 'w' });
    
    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.addTickables([note]);
    
    new Formatter().joinVoices([voice]).format([voice], 150);
    
    if (clef === 'treble') {
      voice.draw(context, trebleStave);
    } else {
      voice.draw(context, bassStave);
    }
    
    // Make the SVG scale responsively
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.maxWidth = '300px';
      svg.style.display = 'block';
      svg.style.margin = '0 auto';
    }
  }, [clef, noteKey]);

  return <div ref={containerRef} className="w-full flex justify-center py-4" />;
}
