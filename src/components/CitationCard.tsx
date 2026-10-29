import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Plus, Check, BookOpen, Sparkles } from 'lucide-react';
import { LibraryText } from '../types';
import { audioPlayer } from '../lib/audioService';

interface CitationCardProps {
  item: LibraryText;
  isInDuaPlan?: boolean;
  onToggleDuaPlan?: (item: LibraryText) => void;
  onOpenDetail?: (item: LibraryText) => void;
  compact?: boolean;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  item,
  isInDuaPlan = false,
  onToggleDuaPlan,
  onOpenDetail,
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = audioPlayer.subscribe((playing, currentId) => {
      setIsPlaying(playing && currentId === item.id);
    });
    return unsubscribe;
  }, [item.id]);

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play(item.id, item.audio_url);
    }
  };

  const handlePlanToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleDuaPlan) {
      onToggleDuaPlan(item);
    }
  };

  const typeLabels = {
    ayah: 'Ayah',
    hadith: 'Hadith',
    dua: 'Supplication'
  };

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(item)}
      className="peaceful-transition"
      style={{
        backgroundColor: 'var(--surface-white)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--dividers)',
        padding: compact ? '14px 16px' : '18px 20px',
        margin: '10px 0',
        cursor: onOpenDetail ? 'pointer' : 'default',
        position: 'relative',
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      {/* Card Header: Type badge, Reference, Grade, Audio */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--primary-teal)',
              backgroundColor: 'var(--primary-soft)',
              padding: '3px 9px',
              borderRadius: 'var(--radius-pill)'
            }}
          >
            {typeLabels[item.type]}
          </span>

          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {item.reference}
          </span>

          {item.grade && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--primary-teal)',
                backgroundColor: 'rgba(31, 92, 85, 0.08)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              {item.grade} {item.grader ? `• ${item.grader}` : ''}
            </span>
          )}
        </div>

        {/* Audio Button */}
        <button
          onClick={handleAudioToggle}
          title={isPlaying ? 'Pause recitation' : 'Play recitation'}
          style={{
            background: isPlaying ? 'var(--primary-teal)' : 'var(--primary-soft)',
            color: isPlaying ? 'var(--surface-white)' : 'var(--primary-teal)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Verbatim Arabic Text */}
      <div
        className="arabic-text"
        style={{
          fontSize: compact ? '20px' : '23px',
          lineHeight: '1.9',
          color: 'var(--text-ink)',
          marginBottom: '10px'
        }}
      >
        {item.arabic}
      </div>

      {/* Transliteration for Duas */}
      {item.transliteration && (
        <div
          style={{
            fontSize: '13px',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            marginBottom: '10px',
            lineHeight: '1.5'
          }}
        >
          {item.transliteration}
        </div>
      )}

      {/* Verified English Translation */}
      <div
        className="body-text"
        style={{
          fontSize: compact ? '14px' : '15px',
          lineHeight: '1.6',
          color: 'var(--text-ink)',
          marginBottom: '12px'
        }}
      >
        "{item.translation_en}"
      </div>

      {/* Card Footer: Source license & Dua Plan button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--divider-subtle)',
          paddingTop: '10px',
          marginTop: '6px'
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {item.source} • {item.translation_source}
        </span>

        {onToggleDuaPlan && item.type === 'dua' && (
          <button
            onClick={handlePlanToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isInDuaPlan ? 'var(--accent-gold-soft)' : 'transparent',
              color: isInDuaPlan ? 'var(--accent-gold)' : 'var(--text-secondary)',
              border: `1px solid ${isInDuaPlan ? 'var(--accent-gold)' : 'var(--dividers)'}`,
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {isInDuaPlan ? (
              <>
                <Check size={13} />
                <span>In Dua Plan</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Add to Plan</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
