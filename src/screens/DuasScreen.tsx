import React, { useState, useEffect } from 'react';
import { LibraryText, SituationSlug } from '../types';
import { SITUATIONS } from '../data/situations';
import { LIBRARY_TEXTS, LIBRARY_MAP } from '../data/library';
import { CitationCard } from '../components/CitationCard';
import { getStoredDuaPlans, saveStoredDuaPlans } from '../lib/storage';
import { audioPlayer } from '../lib/audioService';

interface DuasScreenProps {
  onOpenDetail: (item: LibraryText) => void;
  onOpenAdhkar: (mode: 'morning' | 'evening') => void;
}

export const DuasScreen: React.FC<DuasScreenProps> = ({
  onOpenDetail,
  onOpenAdhkar
}) => {
  const [selectedSituation, setSelectedSituation] = useState<SituationSlug | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [planTextIds, setPlanTextIds] = useState<Set<string>>(new Set());

  // Interactive Repetition Counter for Featured Solace (Prophet Yunus's Dua)
  const [featuredCount, setFeaturedCount] = useState(12);
  const [isFeaturedBookmarked, setIsFeaturedBookmarked] = useState(false);
  const [isFeaturedAudioPlaying, setIsFeaturedAudioPlaying] = useState(false);

  useEffect(() => {
    const plans = getStoredDuaPlans();
    if (plans.length > 0 && plans[0].active) {
      setPlanTextIds(new Set(plans[0].items.map(i => i.text_id)));
    }
  }, []);

  const handleToggleDuaPlan = (item: LibraryText) => {
    const plans = getStoredDuaPlans();
    const currentPlan = plans.length > 0 && plans[0].active ? plans[0] : {
      id: `plan-${Date.now()}`,
      situation_slug: (selectedSituation === 'all' ? 'anxiety' : selectedSituation) as SituationSlug,
      week_start: new Date().toISOString().split('T')[0],
      active: true,
      items: []
    };

    const isAlreadyIn = currentPlan.items.some(i => i.text_id === item.id);
    let updatedItems;

    if (isAlreadyIn) {
      updatedItems = currentPlan.items.filter(i => i.text_id !== item.id);
    } else {
      if (currentPlan.items.length >= 3) {
        alert("A weekly plan holds up to 3 duas for deep focus. Please complete or remove one before adding another.");
        return;
      }
      updatedItems = [...currentPlan.items, { text_id: item.id, times_read: 0 }];
    }

    const updatedPlan = { ...currentPlan, items: updatedItems };
    saveStoredDuaPlans([updatedPlan]);
    setPlanTextIds(new Set(updatedItems.map(i => i.text_id)));
  };

  const handleFeaturedCounter = () => {
    setFeaturedCount(prev => (prev < 33 ? prev + 1 : 1));
  };

  const handleFeaturedAudio = () => {
    if (isFeaturedAudioPlaying) {
      audioPlayer.pause();
      setIsFeaturedAudioPlaying(false);
    } else {
      audioPlayer.play('anx-003');
      setIsFeaturedAudioPlaying(true);
    }
  };

  const filteredTexts = LIBRARY_TEXTS.filter(text => {
    if (selectedSituation !== 'all' && !text.situation_slugs.includes(selectedSituation)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = text.translation_en.toLowerCase().includes(q);
      const matchRef = text.reference.toLowerCase().includes(q);
      const matchSource = text.source.toLowerCase().includes(q);
      const matchArabic = text.arabic.includes(q);
      const matchNote = text.usage_note ? text.usage_note.toLowerCase().includes(q) : false;
      return matchEn || matchRef || matchSource || matchArabic || matchNote;
    }
    return true;
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: '16px',
        paddingBottom: 'calc(64px + var(--safe-area-bottom))',
        paddingLeft: 'calc(16px + var(--safe-area-left))',
        paddingRight: 'calc(16px + var(--safe-area-right))',
        backgroundColor: 'var(--surface-container-low)'
      }}
    >
      {/* Search Input Container with Calm Aesthetic */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline)', marginRight: '10px' }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search by emotion (e.g. worry, exams, grief)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--on-surface)'
            }}
          />
          <button
            type="button"
            title="Filter options"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--outline)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Category Chips */}
      <div style={{ marginBottom: '18px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none'
          }}
        >
          <button
            onClick={() => setSelectedSituation('all')}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: selectedSituation === 'all' ? 'var(--primary)' : 'var(--surface-container)',
              color: selectedSituation === 'all' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: selectedSituation === 'all' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            All Solace
          </button>

          {SITUATIONS.map(s => (
            <button
              key={s.slug}
              onClick={() => setSelectedSituation(s.slug)}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: selectedSituation === s.slug ? 'var(--primary)' : 'var(--surface-container)',
                color: selectedSituation === s.slug ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                border: 'none',
                fontSize: '12px',
                fontWeight: selectedSituation === s.slug ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Visual Vignette Banner */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px',
          backgroundColor: 'var(--primary-container)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            padding: '18px 16px',
            background: 'linear-gradient(135deg, rgba(0, 68, 62, 0.95) 0%, rgba(31, 92, 85, 0.85) 100%)',
            color: 'var(--on-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary-fixed)', marginBottom: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>wb_twilight</span>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Sanctuary of remembrance
            </span>
          </div>
          <p style={{ fontSize: '17px', fontWeight: 500, lineHeight: '1.4', margin: 0 }}>
            Dua: The quiet conversation of the heart
          </p>
        </div>
      </div>

      {/* Featured Solace Card (Prophet Yunus's Dua in Deep Darkness) */}
      <div
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          borderRadius: '16px',
          padding: '18px 16px 0 16px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Watermark 8-Point Star Filigree */}
        <svg
          style={{
            position: 'absolute',
            right: '-16px',
            top: '-16px',
            width: '110px',
            height: '110px',
            color: 'rgba(121, 89, 0, 0.05)',
            pointerEvents: 'none',
            fill: 'currentColor'
          }}
          viewBox="0 0 100 100"
        >
          <rect x="25" y="25" width="50" height="50" rx="2" />
          <rect x="25" y="25" width="50" height="50" rx="2" transform="rotate(45 50 50)" />
        </svg>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255, 222, 160, 0.4)', color: 'var(--on-secondary-fixed-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--secondary)' }}>star</span>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Featured Solace</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-low)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
            Relief from Distress
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', marginBottom: '12px' }}>
          Prophet Yunus's Supplication in Deep Darkness
        </h2>

        {/* Sacred Arabic Text */}
        <div
          style={{
            backgroundColor: 'rgba(247, 243, 236, 0.7)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            marginBottom: '12px'
          }}
        >
          <p className="arabic-text" style={{ fontSize: '24px', lineHeight: '2.0', color: 'var(--primary)', margin: 0 }}>
            لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ
          </p>
        </div>

        {/* Transliteration */}
        <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--on-surface-variant)', marginBottom: '6px', letterSpacing: '0.02em' }}>
          “Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn”
        </p>

        {/* Translation */}
        <p style={{ fontSize: '14px', color: 'var(--on-surface)', marginBottom: '12px', lineHeight: '1.6' }}>
          “There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.”
        </p>

        {/* Spiritual Context Card */}
        <div
          style={{
            backgroundColor: 'var(--surface-container)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)', marginTop: '2px', flexShrink: 0 }}>
            menu_book
          </span>
          <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.4', margin: 0 }}>
            Surah Al-Anbiya 21:87 • Recited in the belly of the whale; Allah delivered him and promised to deliver the believers through it whenever sorrow closes in.
          </p>
        </div>

        {/* Interactive Bottom Actions Bar with Gentle Tap Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: 'rgba(247, 243, 236, 0.5)',
            margin: '0 -16px',
            borderTop: '1px solid var(--dividers)'
          }}
        >
          {/* Repetition Counter Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleFeaturedCounter}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(178, 238, 228, 0.5)',
                color: 'var(--on-primary-fixed-variant)',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>touch_app</span>
              <span>Count: <strong>{featuredCount}</strong>/33</span>
            </button>
            <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>Tap to recite</span>
          </div>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setIsFeaturedBookmarked(!isFeaturedBookmarked)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: isFeaturedBookmarked ? 'var(--primary)' : 'var(--on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className={`material-symbols-outlined ${isFeaturedBookmarked ? 'fill' : ''}`} style={{ fontSize: '18px' }}>
                {isFeaturedBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>

            <button
              onClick={handleFeaturedAudio}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'rgba(178, 238, 228, 0.4)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                {isFeaturedAudioPlaying ? 'pause' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Title: Curated Solace Collection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '4px', height: '16px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--primary)' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--primary)' }}>
            Curated Solace Collection
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
          {filteredTexts.length} Reviewed
        </span>
      </div>

      {/* Verified Library Texts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTexts.map(item => (
          <CitationCard
            key={item.id}
            item={item}
            isInDuaPlan={planTextIds.has(item.id)}
            onToggleDuaPlan={handleToggleDuaPlan}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
};
