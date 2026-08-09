// spikeDemo.ts — AUDIO SPIKE demo harness (NOT production). Loaded only by
// /audio-spike.html. Renders A/B buttons so a human can hear current vs retuned.
import { start } from 'tone';
import {
  startCurrentBed,
  stopCurrentBed,
  startRetunedBed,
  stopRetunedBed,
  playCurrentJingle,
  playRetunedJingle,
  playCurrentReelStop,
  playRetunedReelStop,
} from './spikeSounds';

const app = document.getElementById('app');
if (!app) throw new Error('#app missing');

function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', async () => {
    await start(); // gesture unlock
    onClick();
  });
  return b;
}

function row(title: string, ...els: HTMLElement[]): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'row';
  const h = document.createElement('h2');
  h.textContent = title;
  wrap.appendChild(h);
  const bar = document.createElement('div');
  bar.className = 'bar';
  els.forEach((e) => bar.appendChild(e));
  wrap.appendChild(bar);
  return wrap;
}

// Bed is exclusive: only one plays at a time.
function stopAllBeds() {
  stopCurrentBed();
  stopRetunedBed();
}

app.appendChild(
  row(
    'Ambient bed  —  the "repeating bing" is here',
    button('▶ CURRENT bed', () => { stopAllBeds(); startCurrentBed(); }),
    button('▶ RETUNED bed', () => { stopAllBeds(); startRetunedBed(); }),
    button('⏹ stop bed', stopAllBeds),
  ),
);
app.appendChild(
  row(
    'Win jingle (big tier)',
    button('▶ CURRENT jingle', playCurrentJingle),
    button('▶ RETUNED jingle', playRetunedJingle),
  ),
);
app.appendChild(
  row(
    'Reel-stop SFX',
    button('▶ CURRENT reel-stop', playCurrentReelStop),
    button('▶ RETUNED reel-stop', playRetunedReelStop),
  ),
);
