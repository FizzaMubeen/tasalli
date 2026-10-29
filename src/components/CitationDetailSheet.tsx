import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Plus, Check, Share2, Info, BookOpen } from 'lucide-react';
import { LibraryText } from '../types';
import { audioPlayer } from '../lib/audioService';

interface CitationDetailSheetProps {
  item: LibraryText | null;
  onClose: () => void;
  isInDuaPlan?: boolean;
  onToggleDuaPlan?: (item: LibraryText) => void;
}

export const CitationDetailSheet: React.FC<CitationDetailSheetProps> = ({
  item,
  onClose,
  isInDuaPlan = false,
  onToggleDuaPlan
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!item) return;
    const unsubscribe = audioPlayer.subscribe((playing, currentId) => {
      setIsPlaying(playing && currentId === item.id);
    });
    return unsubscribe;
  }, [item]);

  if (!item) return null;

  const handleAudioToggle = () => {
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play(item.id, item.audio_url);
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
        backgroundColor: 'rgba(30, 42, 40, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9000,
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
          maxHeight: '85%',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-sheet)'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--primary-teal)',
                backgroundColor: 'var(--primary-soft)',
                padding: '3px 9px',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              {item.type}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)' }}>
              {item.reference}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Verbatim Arabic */}
        <div
          className="arabic-text"
          style={{
            fontSize: '25px',
            lineHeight: '2.0',
            color: 'var(--text-ink)',
            marginBottom: '16px',
            backgroundColor: 'var(--bg-warm-ivory)',
            padding: '18px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--dividers)'
          }}
        >
          {item.arabic}
        </div>

        {/* Transliteration */}
        {item.transliteration && (
          <div
            style={{
              fontSize: '14px',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              marginBottom: '14px',
              lineHeight: '1.6'
            }}
          >
            {item.transliteration}
          </div>
        )}

        {/* Translation */}
        <div
          className="body-text"
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'var(--text-ink)',
            marginBottom: '18px'
          }}
        >
          "{item.translation_en}"
        </div>

        {/* Audio Player Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--primary-soft)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-card)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleAudioToggle}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-teal)',
                color: 'var(--surface-white)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-teal)' }}>
                {isPlaying ? 'Playing Sacred Recitation...' : 'Listen to Recitation'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Human recitation only (Never TTS)
              </div>
            </div>
          </div>
        </div>

        {/* Usage Note & Context */}
        {item.usage_note && (
          <div
            style={{
              backgroundColor: 'var(--bg-warm-ivory)',
              borderRadius: 'var(--radius-card)',
              padding: '14px 16px',
              marginBottom: '16px',
              border: '1px solid var(--dividers)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Info size={14} color="var(--primary-teal)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-teal)' }}>
                Spiritual Context & Reflection
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-ink)', lineHeight: '1.5' }}>
              {item.usage_note}
            </p>
          </div>
        )}

        {/* Academic & Verification Trail */}
        <div
          style={{
            borderTop: '1px solid var(--dividers)',
            paddingTop: '14px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Source Collection:</span>
            <span style={{ fontWeight: 500, color: 'var(--text-ink)' }}>{item.source}</span>
          </div>
          {item.grade && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Authenticity Grade:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-teal)' }}>
                {item.grade} {item.grader ? `(Graded by ${item.grader})` : ''}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Translation Licence:</span>
            <span style={{ color: 'var(--text-ink)' }}>{item.translation_source}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Library Status:</span>
            <span style={{ color: 'var(--success-sage)', fontWeight: 500 }}>
              Scholar Reviewed ({item.review_date})
            </span>
          </div>
        </div>

        {/* Action Button: Add to Plan */}
        {onToggleDuaPlan && item.type === 'dua' && (
          <button
            onClick={() => onToggleDuaPlan(item)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: isInDuaPlan ? 'var(--accent-gold-soft)' : 'var(--primary-teal)',
              color: isInDuaPlan ? 'var(--accent-gold)' : 'var(--surface-white)',
              border: `1px solid ${isInDuaPlan ? 'var(--accent-gold)' : 'transparent'}`,
              borderRadius: 'var(--radius-pill)',
              padding: '13px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isInDuaPlan ? (
              <>
                <Check size={18} />
                <span>Saved in Weekly Dua Plan</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Add to Weekly Dua Plan</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
