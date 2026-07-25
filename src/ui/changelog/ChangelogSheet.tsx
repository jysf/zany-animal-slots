// ChangelogSheet.tsx — an in-app "What's new" changelog (bundled on the PROJ-004 branch at the
// owner's request; not thematically an ad feature). A small footer link opens a sheet listing the
// player-facing releases. Data lives in releases.json (Vite imports JSON natively — no dependency,
// no markdown renderer); this component only renders it. Mirrors StatsSheet's sheet/backdrop/Esc/
// focus idiom. DEC-010: tokens only, prefixed classes.
import { useState, useEffect, useRef } from 'react';
import releasesData from './releases.json';
import './changelog.css';

interface Release {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

const RELEASES = releasesData as Release[];
const LATEST = RELEASES[0];

export default function ChangelogSheet() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        className="changelog__trigger"
        aria-label={`What's new — version ${LATEST.version}`}
        onClick={() => setOpen(true)}
      >
        What&rsquo;s new · v{LATEST.version}
      </button>

      {open && (
        <>
          <div className="changelog__backdrop" onClick={() => setOpen(false)} data-testid="changelog-backdrop" />
          <div role="dialog" aria-modal="true" aria-label="What's new" className="changelog__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="changelog__header">
              <h2 className="changelog__title">What&rsquo;s new</h2>
              <button ref={closeRef} className="changelog__close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <ol className="changelog__list">
              {RELEASES.map((r) => (
                <li key={r.version} className="changelog__release">
                  <div className="changelog__release-head">
                    <span className="changelog__version">v{r.version}</span>
                    <span className="changelog__release-title">{r.title}</span>
                    <span className="changelog__date">{r.date}</span>
                  </div>
                  <ul className="changelog__highlights">
                    {r.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </>
  );
}
