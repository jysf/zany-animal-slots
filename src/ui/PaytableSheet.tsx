// Paytable trigger + slide-up overlay sheet (SPEC-020).
// Self-contained: owns its own open state; always renders the trigger.
// DEC-010: global CSS via paytable.css, no raw hex, prefixed classes.
// DEC-004: slide-up animation; reduced-motion handled in CSS.
// constraint: touch-targets-44 — trigger and ✕ are ≥44px.
// constraint: respect-reduced-motion — handled in paytable.css.

import { useState, useEffect, useRef } from 'react';
import { paytableRows, PAYLINE_COUNT } from './paytable';
import './paytable.css';

export function PaytableSheet() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
  }

  // Focus the close button when the sheet opens (basic dialog a11y).
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Close on Esc while the sheet is open.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const rows = paytableRows();

  return (
    <>
      {/* Always-rendered trigger — does NOT shift game layout when sheet is closed. */}
      <button
        className="paytable__trigger"
        aria-label="Paytable"
        onClick={() => setOpen(true)}
      >
        ℹ Paytable
      </button>

      {open && (
        <>
          {/* Backdrop — click closes; covers the .cabinet (position: relative). */}
          <div
            className="paytable__backdrop"
            onClick={close}
            data-testid="paytable-backdrop"
          />

          {/*
           * Sheet — stopPropagation so clicks inside don't bubble to backdrop.
           * role="dialog" aria-modal accessible name via aria-label.
           */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Paytable"
            className="paytable__sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="paytable__header">
              <h2 className="paytable__title">Paytable</h2>
              <button
                ref={closeRef}
                className="paytable__close"
                aria-label="Close"
                onClick={close}
              >
                ✕
              </button>
            </div>

            <div className="paytable__rows">
              {rows.map((row) => (
                <div key={row.tier} className="paytable__row">
                  <span className="paytable__row-emoji">{row.emoji.join(' ')}</span>
                  <span className="paytable__row-label">{row.label}</span>
                  {row.multipliers.map((m, i) => (
                    <span key={i} className="paytable__row-mult">
                      {m}×
                    </span>
                  ))}
                </div>
              ))}
            </div>

            <p className="paytable__note">× total bet</p>

            {/* How wins work — the payline rule (left-anchored run), so a
                near-miss that skips the leftmost reel isn't a mystery. */}
            <section className="paytable__rules" aria-label="How wins work">
              <h3 className="paytable__rules-title">How wins work</h3>
              <p className="paytable__rules-text">
                Wins pay left-to-right on {PAYLINE_COUNT} fixed lines. You need{' '}
                <strong>3+ matching symbols in a row starting from the leftmost reel</strong> — a
                run that doesn&rsquo;t reach the first reel doesn&rsquo;t pay.
              </p>
            </section>

            {/* About — app identity + build id (SPEC: version display). */}
            <section className="paytable__about" aria-label="About">
              <h3 className="paytable__about-title">About</h3>
              <p className="paytable__about-text">
                Zany Animal Slots — play-money only. No real money, no wagering, no payouts.
              </p>
              <p className="paytable__about-version" data-testid="app-version">
                v{__APP_VERSION__} · {__BUILD_SHA__} · {__BUILD_DATE__}
              </p>
              <a
                className="paytable__about-link"
                href="https://github.com/jysf/zany-animal-slots"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source &amp; security policy
              </a>
            </section>
          </div>
        </>
      )}
    </>
  );
}
