import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Hadith } from '../types';

interface HadithCardProps {
  hadith: Hadith;
}

export const HadithCard: React.FC<HadithCardProps> = ({ hadith }) => {
  const [showArabic, setShowArabic] = useState(false);

  return (
    <article
      style={{
        backgroundColor: 'var(--surface-white)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--dividers)',
        padding: '16px 18px',
        margin: '10px 0',
        color: 'var(--text-ink)',
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      <span style={{
        display: 'inline-block',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--primary-teal)',
        backgroundColor: 'var(--primary-soft)',
        padding: '3px 9px',
        borderRadius: 'var(--radius-pill)',
        marginBottom: '10px'
      }}>
        Hadith
      </span>

      <p style={{ fontSize: '15px', lineHeight: '1.7', margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
        {hadith.text}
      </p>
      {showArabic && hadith.arabic && (
        <p dir="rtl" lang="ar" className="arabic-text" style={{ fontSize: '21px', lineHeight: '1.9', margin: '0 0 12px' }}>
          {hadith.arabic}
        </p>
      )}

      <p style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
        {hadith.narrator}
      </p>
      <p style={{ fontSize: '12px', lineHeight: '1.5', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
        {hadith.reference}{hadith.grade ? ` • ${hadith.grade}` : ''}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <a
          href={hadith.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary-teal)', fontSize: '12px', fontWeight: 600 }}
        >
          Read on sunnah.com <ExternalLink size={13} />
        </a>
        {hadith.arabic && (
          <button
            type="button"
            aria-expanded={showArabic}
            onClick={() => setShowArabic(value => !value)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}
          >
            {showArabic ? 'Hide Arabic' : 'Show Arabic'}
            {showArabic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>
    </article>
  );
};
