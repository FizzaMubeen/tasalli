import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  HADITH_TOPICS,
  TOPIC_GROUPS,
  LibraryHadith,
  LIBRARY_HADITH,
  HADITH_BY_KEY,
  hadithForTopic,
  topicCount,
  searchHadith,
  randomHadith,
  speakableText,
  getSavedHadith,
  setSavedHadith
} from '../lib/hadithLibrary';
import { speech, SpeechState } from '../lib/speechService';

type View = { kind: 'home' } | { kind: 'topic'; topic: string } | { kind: 'saved' } | { kind: 'single'; key: string };

const RATES = [0.8, 0.9, 1, 1.15, 1.3];

function useSpeech(): SpeechState {
  const [s, setS] = useState<SpeechState>(speech.getState());
  useEffect(() => speech.subscribe(setS), []);
  return s;
}

const toQueueItem = (h: LibraryHadith) => ({ id: h.key, text: speakableText(h), label: h.reference });

export const HadithScreen: React.FC = () => {
  const [view, setView] = useState<View>({ kind: 'home' });
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<Set<string>>(() => new Set(getSavedHadith()));
  const sp = useSpeech();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => speech.stop(), []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [view]);

  const toggleSave = (key: string) => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      setSavedHadith([...next]);
      return next;
    });
  };

  const list: LibraryHadith[] = useMemo(() => {
    if (query.trim()) return searchHadith(query);
    if (view.kind === 'topic') return hadithForTopic(view.topic);
    if (view.kind === 'saved') return [...saved].map(k => HADITH_BY_KEY.get(k)).filter((h): h is LibraryHadith => Boolean(h));
    if (view.kind === 'single') { const h = HADITH_BY_KEY.get(view.key); return h ? [h] : []; }
    return [];
  }, [query, view, saved]);

  const showingList = query.trim() !== '' || view.kind !== 'home';
  const title = query.trim()
    ? `Results for “${query.trim()}”`
    : view.kind === 'topic' ? view.topic
    : view.kind === 'saved' ? 'Saved hadith'
    : view.kind === 'single' ? 'A hadith for right now' : '';

  const playAll = () => { if (list.length) speech.playQueue(list.map(toQueueItem)); };

  const openRandom = () => {
    const h = randomHadith();
    setQuery('');
    setView({ kind: 'single', key: h.key });
    speech.play(toQueueItem(h));
  };

  const goHome = () => { setQuery(''); setView({ kind: 'home' }); };
  const withSituation = LIBRARY_HADITH.filter(h => h.situation).length;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '16px',
          paddingBottom: sp.status !== 'idle' ? '140px' : 'calc(64px + var(--safe-area-bottom))',
          paddingLeft: 'calc(16px + var(--safe-area-left))',
          paddingRight: 'calc(16px + var(--safe-area-right))',
          backgroundColor: 'var(--surface-container-low)'
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)', padding: '10px 14px', boxShadow: 'var(--shadow-xs)', marginBottom: '16px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline)', marginRight: '10px' }}>search</span>
          <input
            id="hadith-search"
            type="search"
            placeholder="Search hadith: mother, anger, debt, Bukhari 6114…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--on-surface)' }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
              style={{ border: 'none', background: 'transparent', color: 'var(--outline)', cursor: 'pointer', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>

        {!showingList && (
          <>
            {/* Banner */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '18px 16px', background: 'linear-gradient(135deg, rgba(0, 68, 62, 0.95) 0%, rgba(31, 92, 85, 0.85) 100%)', color: 'var(--on-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary-fixed)', marginBottom: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_stories</span>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Hadith Library</span>
                </div>
                <p style={{ fontSize: '17px', fontWeight: 500, lineHeight: 1.4, margin: '0 0 6px' }}>
                  Words of the Prophet ﷺ for every moment of life
                </p>
                <p style={{ fontSize: '12.5px', lineHeight: 1.5, margin: 0, opacity: 0.85 }}>
                  {LIBRARY_HADITH.length} hadith in {HADITH_TOPICS.length} topics, each with its reference. {withSituation} come with a “when you…” situation, many with the story behind them. Tap Listen to hear any of them.
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              <button type="button" onClick={openRandom} style={pillButton(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>auto_awesome</span>
                A hadith for right now
              </button>
              <button type="button" onClick={() => setView({ kind: 'saved' })} style={pillButton(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>bookmark</span>
                Saved ({saved.size})
              </button>
            </div>

            {/* Topic groups */}
            {TOPIC_GROUPS.map(group => (
              <section key={group.id} style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 2px 10px' }}>
                  {group.title}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {HADITH_TOPICS.filter(t => t.group === group.id).map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setView({ kind: 'topic', topic: t.name })}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', textAlign: 'left',
                        padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dividers)',
                        backgroundColor: 'var(--surface-container-lowest)', cursor: 'pointer', minWidth: 0, color: 'var(--on-surface)'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>{t.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>{t.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>{topicCount(t.name)} hadith</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <p style={{ fontSize: '11.5px', lineHeight: 1.5, color: 'var(--on-surface-variant)', margin: '8px 2px 0' }}>
              Texts marked “Verified text” are the sunnah.com translations with Arabic. Entries marked “English meaning” are newer additions whose full text and Arabic are still being added. Every reference opens on sunnah.com.
            </p>
          </>
        )}

        {showingList && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <button type="button" onClick={goHome} aria-label="Back to topics"
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: 'none', backgroundColor: 'var(--surface-container)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
              </button>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--primary)', margin: 0, lineHeight: 1.3 }}>{title}</h2>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{list.length} hadith</span>
              </div>
            </div>

            {list.length > 1 && (
              <button type="button" onClick={playAll} style={{ ...pillButton(true), width: '100%', justifyContent: 'center', marginBottom: '14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span>
                Listen to all {list.length}
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {list.map(h => (
                <HadithLibraryCard
                  key={h.key}
                  hadith={h}
                  isSaved={saved.has(h.key)}
                  isPlaying={sp.currentId === h.key && sp.status !== 'idle'}
                  onToggleSave={() => toggleSave(h.key)}
                  onListen={() => {
                    if (sp.currentId === h.key && sp.status === 'playing') speech.pause();
                    else if (sp.currentId === h.key && sp.status === 'paused') speech.resume();
                    else speech.play(toQueueItem(h));
                  }}
                  showTopic={view.kind !== 'topic' || query.trim() !== ''}
                />
              ))}
              {list.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '14px', padding: '32px 8px' }}>
                  {view.kind === 'saved' && !query.trim()
                    ? 'Nothing saved yet. Tap the bookmark on any hadith to keep it here.'
                    : 'No hadith match that search. Try a simpler word like “patience” or “mother”.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Listening bar */}
      {(sp.status !== 'idle' || sp.error) && (
        <div
          role="region"
          aria-label="Audio player"
          style={{
            position: 'absolute', left: '10px', right: '10px', bottom: '10px', zIndex: 5,
            backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-floating)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          {sp.error ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>volume_off</span>
              <span style={{ flex: 1, fontSize: '12.5px', lineHeight: 1.4 }}>{sp.error}</span>
              <button type="button" onClick={() => speech.stop()} style={barButton} aria-label="Close">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </>
          ) : (
            <>
              <button type="button" style={barButton} aria-label={sp.status === 'playing' ? 'Pause' : 'Resume'}
                onClick={() => (sp.status === 'playing' ? speech.pause() : speech.resume())}>
                <span className="material-symbols-outlined fill" style={{ fontSize: '24px' }}>{sp.status === 'playing' ? 'pause' : 'play_arrow'}</span>
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{sp.total > 1 ? `Playing ${sp.index + 1} of ${sp.total}` : sp.status === 'paused' ? 'Paused' : 'Playing'}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sp.label}</div>
              </div>
              <button type="button" style={{ ...barButton, width: 'auto', padding: '0 8px', fontSize: '12px', fontWeight: 600 }} aria-label="Reading speed"
                onClick={() => speech.setRate(RATES[(RATES.indexOf(sp.rate) + 1) % RATES.length] ?? 0.9)}>
                {sp.rate}×
              </button>
              {sp.total > 1 && (
                <button type="button" style={barButton} aria-label="Next hadith" onClick={() => speech.next()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>skip_next</span>
                </button>
              )}
              <button type="button" style={barButton} aria-label="Stop" onClick={() => speech.stop()}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>stop</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const barButton: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '50%', border: 'none', flexShrink: 0,
  backgroundColor: 'rgba(255,255,255,0.14)', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};

function pillButton(primary: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: 'var(--radius-pill)',
    border: primary ? 'none' : '1px solid var(--dividers)',
    backgroundColor: primary ? 'var(--primary)' : 'var(--surface-container-lowest)',
    color: primary ? 'var(--on-primary)' : 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
  };
}

interface CardProps {
  hadith: LibraryHadith;
  isSaved: boolean;
  isPlaying: boolean;
  showTopic: boolean;
  onToggleSave: () => void;
  onListen: () => void;
}

const HadithLibraryCard: React.FC<CardProps> = ({ hadith: h, isSaved, isPlaying, showTopic, onToggleSave, onListen }) => {
  const [showArabic, setShowArabic] = useState(false);
  const [showStory, setShowStory] = useState(false);

  return (
    <article
      style={{
        backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-card)',
        border: `1px solid ${isPlaying ? 'var(--primary-fixed-dim)' : 'var(--dividers)'}`,
        boxShadow: isPlaying ? '0 0 0 3px rgba(178, 238, 228, 0.6)' : 'var(--shadow-xs)',
        padding: '14px 16px', color: 'var(--on-surface)'
      }}
    >
      {h.situation && (
        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--secondary)', margin: '0 0 8px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px', marginTop: '1px' }}>lightbulb</span>
          <span>{h.situation}</span>
        </p>
      )}

      <p style={{ fontSize: '15px', lineHeight: 1.7, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{h.text}</p>

      {showArabic && h.arabic && (
        <p dir="rtl" lang="ar" className="arabic-text" style={{ fontSize: '20px', lineHeight: 1.9, margin: '0 0 10px', color: 'var(--primary)' }}>{h.arabic}</p>
      )}

      <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--on-surface-variant)', margin: '0 0 2px' }}>{h.narrator}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-surface-variant)', marginBottom: '10px' }}>
        <a href={h.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>{h.reference}</a>
        <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--success-bg)', color: 'var(--success-sage)', fontSize: '11px', fontWeight: 600 }}>{h.grade}</span>
        <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: h.verbatim ? 'var(--surface-container)' : 'rgba(255, 222, 160, 0.45)', color: h.verbatim ? 'var(--on-surface-variant)' : 'var(--on-secondary-fixed-variant)', fontSize: '11px' }}>
          {h.verbatim ? 'Verified text' : 'English meaning'}
        </span>
        {showTopic && <span style={{ fontSize: '11px' }}>· {h.topic}</span>}
      </div>

      {h.story && (
        <div style={{ marginBottom: '10px' }}>
          <button type="button" onClick={() => setShowStory(v => !v)} aria-expanded={showStory}
            style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--secondary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history_edu</span>
            {showStory ? 'Hide the story' : 'The story behind it'}
          </button>
          {showStory && (
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, margin: '8px 0 0', padding: '10px 12px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface-container)' }}>{h.story}</p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--dividers)', paddingTop: '10px', flexWrap: 'wrap' }}>
        <button type="button" onClick={onListen}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: 'none', backgroundColor: 'rgba(178, 238, 228, 0.5)', color: 'var(--on-primary-fixed-variant)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{isPlaying ? 'pause' : 'volume_up'}</span>
          {isPlaying ? 'Pause' : 'Listen'}
        </button>
        {h.arabic && (
          <button type="button" onClick={() => setShowArabic(v => !v)} aria-expanded={showArabic}
            style={{ border: 'none', background: 'transparent', color: 'var(--on-surface-variant)', fontSize: '12.5px', cursor: 'pointer', padding: '6px 4px' }}>
            {showArabic ? 'Hide Arabic' : 'Show Arabic'}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onToggleSave} aria-pressed={isSaved} aria-label={isSaved ? 'Remove from saved' : 'Save hadith'}
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', color: isSaved ? 'var(--primary)' : 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span className={`material-symbols-outlined ${isSaved ? 'fill' : ''}`} style={{ fontSize: '19px' }}>{isSaved ? 'bookmark' : 'bookmark_border'}</span>
        </button>
      </div>
    </article>
  );
};
