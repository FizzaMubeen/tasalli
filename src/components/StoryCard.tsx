import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded(value => !value)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        backgroundColor: 'var(--surface-white)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--dividers)',
        padding: '14px 16px',
        margin: '10px 0',
        color: 'var(--text-ink)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <BookOpen size={18} color="var(--primary-teal)" />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--primary-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Story
            </span>
            <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
              {story.title}
            </span>
          </span>
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </span>

      <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '9px', paddingLeft: '28px' }}>
        {story.sources} • {story.grade}
      </span>
      {expanded && (
        <span style={{ display: 'block', fontSize: '14px', lineHeight: '1.6', marginTop: '12px', paddingLeft: '28px' }}>
          {story.summary}
        </span>
      )}
    </button>
  );
};
