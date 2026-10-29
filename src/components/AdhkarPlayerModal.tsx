import React, { useState } from 'react';
import { X, Sun, Moon, Volume2, VolumeX, CheckCircle, RotateCcw } from 'lucide-react';
import { LIBRARY_TEXTS } from '../data/library';
import { audioPlayer } from '../lib/audioService';

interface AdhkarPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'morning' | 'evening';
}

export const AdhkarPlayerModal: React.FC<AdhkarPlayerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'morning'
}) => {
  const [mode, setMode] = useState<'morning' | 'evening'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  // Filter adhkar items
  const items = LIBRARY_TEXTS.filter(t =>
    mode === 'morning' ? t.id.startsWith('adhkar-m') : t.id.startsWith('adhkar-e')
  );

  const currentItem = items[currentIndex] || items[0];
  const targetCount = currentItem?.id === 'adhkar-m-02' ? 3 : 1;
  const currentCount = counts[currentItem?.id] || 0;

  const handleTapCounter = () => {
    if (!currentItem) return;
    const newCount = (counts[currentItem.id] || 0) + 1;
    setCounts({ ...counts, [currentItem.id]: newCount });

    // If reached target, advance after small pause
    if (newCount >= targetCount && currentIndex < items.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 400);
    }
  };

  const handleAudioToggle = () => {
    if (!currentItem) return;
    if (isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      audioPlayer.play(currentItem.id, currentItem.audio_url);
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30, 42, 40, 0.55)',
        backdropFilter: 'blur(5px)',
        zIndex: 9200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-white)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px 20px 32px 20px',
          maxHeight: '90%',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-sheet)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'morning' ? (
              <Sun size={20} color="var(--accent-gold)" />
            ) : (
              <Moon size={20} color="var(--primary-teal)" />
            )}
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-ink)' }}>
              {mode === 'morning' ? 'Morning Adhkar' : 'Evening Adhkar'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--primary-soft)',
                borderRadius: 'var(--radius-pill)',
                padding: '2px'
              }}
            >
              <button
                onClick={() => { setMode('morning'); setCurrentIndex(0); }}
                style={{
                  border: 'none',
                  background: mode === 'morning' ? 'var(--primary-teal)' : 'transparent',
                  color: mode === 'morning' ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Morning
              </button>
              <button
                onClick={() => { setMode('evening'); setCurrentIndex(0); }}
                style={{
                  border: 'none',
                  background: mode === 'evening' ? 'var(--primary-teal)' : 'transparent',
                  color: mode === 'evening' ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Evening
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {items.map((it, idx) => (
            <div
              key={it.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx === currentIndex ? 'var(--primary-teal)' : (counts[it.id] || 0) >= (it.id === 'adhkar-m-02' ? 3 : 1) ? 'var(--primary-soft-border)' : 'var(--dividers)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {currentItem && (
          <div>
            {/* Arabic Box */}
            <div
              className="arabic-text"
              style={{
                fontSize: '24px',
                lineHeight: '2.0',
                backgroundColor: 'var(--bg-warm-ivory)',
                padding: '18px',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--dividers)',
                marginBottom: '14px'
              }}
            >
              {currentItem.arabic}
            </div>

            {/* Transliteration */}
            {currentItem.transliteration && (
              <div
                style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                  lineHeight: '1.5'
                }}
              >
                {currentItem.transliteration}
              </div>
            )}

            {/* Translation */}
            <div
              className="body-text"
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--text-ink)',
                marginBottom: '16px'
              }}
            >
              "{currentItem.translation_en}"
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              {currentItem.source} • {currentItem.reference}
            </div>

            {/* Interactive Repeat Counter Button */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleTapCounter}
                className="peaceful-transition"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: currentCount >= targetCount ? 'var(--success-bg)' : 'var(--primary-teal)',
                  color: currentCount >= targetCount ? 'var(--success-sage)' : 'var(--surface-white)',
                  border: currentCount >= targetCount ? '1px solid var(--success-sage)' : 'none',
                  borderRadius: 'var(--radius-pill)',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transform: 'scale(1)',
                  boxShadow: 'var(--shadow-floating)'
                }}
              >
                {currentCount >= targetCount ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Completed ({currentCount}/{targetCount})</span>
                  </>
                ) : (
                  <span>Tap to Recite ({currentCount} / {targetCount})</span>
                )}
              </button>

              <button
                onClick={handleAudioToggle}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-soft)',
                  color: 'var(--primary-teal)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
