import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { TodayScreen } from './screens/TodayScreen';
import { TalkScreen } from './screens/TalkScreen';
import { DuasScreen } from './screens/DuasScreen';
import { YouScreen } from './screens/YouScreen';
import { HadithScreen } from './screens/HadithScreen';
import { CrisisModal } from './components/CrisisModal';
import { CitationDetailSheet } from './components/CitationDetailSheet';
import { AdhkarPlayerModal } from './components/AdhkarPlayerModal';
import { OnboardingModal } from './components/OnboardingModal';
import { EvalsModal } from './components/EvalsModal';
import { LibraryText, SituationSlug, UserConsents, UserProfile } from './types';
import { getStoredConsents, getStoredProfile, hasUserOnboarded } from './lib/storage';

const isNativePlatform = Capacitor.isNativePlatform()
  || new URLSearchParams(window.location.search).get('native') === '1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'talk' | 'duas' | 'hadith' | 'you'>('today');
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [consents, setConsents] = useState<UserConsents>(() => getStoredConsents());
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => hasUserOnboarded());

  // Navigation props to pass to Talk
  const [talkSituation, setTalkSituation] = useState<SituationSlug | undefined>(undefined);
  const [talkInitialText, setTalkInitialText] = useState<string | undefined>(undefined);

  // Modals state
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<LibraryText | null>(null);
  const [adhkarMode, setAdhkarMode] = useState<'morning' | 'evening' | null>(null);
  const [isEvalsOpen, setIsEvalsOpen] = useState(false);

  // Device Frame Toggle (390x844 vs Responsive)
  const [isDeviceFrame, setIsDeviceFrame] = useState(!isNativePlatform);

  // Bug 6: Hide QA Gates badge outside development builds
  const isDevBuild = Boolean((import.meta as any).env?.DEV ?? true);

  const handleNavigateToTalk = (situationSlug?: string, initialText?: string) => {
    setTalkSituation(situationSlug as SituationSlug);
    setTalkInitialText(initialText);
    setActiveTab('talk');
  };

  const handleResetApp = () => {
    setProfile(getStoredProfile());
    setConsents(getStoredConsents());
    setIsOnboarded(false);
    setActiveTab('today');
  };

  if (!isOnboarded) {
    return (
      <div
        style={{
          width: '100%',
          height: 'var(--app-height, 100dvh)',
          backgroundColor: 'var(--surface-container-low)',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        <OnboardingModal
          isOpen
          onComplete={(p, c) => {
            setProfile(p);
            setConsents(c);
            setIsOnboarded(true);
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: 'var(--app-height, 100dvh)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isNativePlatform ? 'var(--surface-container-low)' : '#E8E3DA',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Top Desktop Controls Bar */}
      {!isNativePlatform && <div
        style={{
          position: 'absolute',
          top: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '6px 14px',
          borderRadius: '9999px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' }}>
            Tasalli (Phase 1 • 390×844)
          </span>
        </div>

        <button
          onClick={() => setIsDeviceFrame(!isDeviceFrame)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--on-surface-variant)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            {isDeviceFrame ? 'fullscreen' : 'smartphone'}
          </span>
          <span>{isDeviceFrame ? 'Full View' : 'Device Frame'}</span>
        </button>

        {/* Bug 6 fix: Only show QA Gates in dev build */}
        {isDevBuild && (
          <button
            onClick={() => setIsEvalsOpen(true)}
            style={{
              backgroundColor: 'var(--primary-fixed-dim)',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>verified</span>
            <span>QA Gates (100% Pass)</span>
          </button>
        )}
      </div>}

      {/* Main 390x844 Mobile Device Viewport */}
      <div
        className={isDeviceFrame ? 'app-container' : ''}
        style={{
          width: isDeviceFrame ? '390px' : '100%',
          height: isDeviceFrame ? '844px' : '100dvh',
          maxWidth: isDeviceFrame ? '390px' : isNativePlatform ? '100%' : '450px',
          maxHeight: isDeviceFrame ? '844px' : '100%',
          backgroundColor: 'var(--surface-container-low)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* iOS / Android Status Bar (Simulated Device Frame Only) */}
        {isDeviceFrame && (
          <div
            style={{
              height: '44px',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--on-surface)',
              flexShrink: 0,
              backgroundColor: 'transparent',
              zIndex: 10
            }}
          >
            <span>9:41</span>
            {/* Dynamic Island pill */}
            <div
              style={{
                width: '90px',
                height: '22px',
                backgroundColor: '#1C1C18',
                borderRadius: '12px'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>wifi</span>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>battery_full</span>
            </div>
          </div>
        )}

        {/* Top Header with delicate 8-point geometric star watermark */}
        <header
          style={{
            paddingTop: isDeviceFrame ? '0px' : 'var(--safe-area-top)',
            paddingLeft: isDeviceFrame ? '18px' : 'calc(18px + var(--safe-area-left))',
            paddingRight: isDeviceFrame ? '18px' : 'calc(18px + var(--safe-area-right))',
            paddingBottom: '0px',
            height: isDeviceFrame ? '56px' : 'calc(56px + var(--safe-area-top))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(230, 224, 214, 0.7)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            zIndex: 15,
            boxSizing: 'border-box'
          }}
        >
          {/* Faint 8-point geometric khatim watermark */}
          <svg
            style={{
              position: 'absolute',
              right: '24px',
              top: '4px',
              width: '64px',
              height: '64px',
              color: 'rgba(121, 89, 0, 0.08)',
              pointerEvents: 'none',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 1
            }}
            viewBox="0 0 100 100"
          >
            <rect x="22" y="22" width="56" height="56" rx="2" />
            <rect x="22" y="22" width="56" height="56" rx="2" transform="rotate(45 50 50)" />
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '-0.02em'
              }}
            >
              Tasalli
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
            <button
              onClick={() => setIsCrisisOpen(true)}
              title="Crisis Support & Helplines"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--caution)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--crisis-bg)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>support_agent</span>
              <span>Help</span>
            </button>
          </div>
        </header>

        {/* Content Screens Area */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {activeTab === 'today' && (
            <TodayScreen
              profile={profile}
              onOpenAdhkar={mode => setAdhkarMode(mode)}
              onOpenDetail={item => setDetailItem(item)}
              onNavigateToTalk={handleNavigateToTalk}
              onOpenCrisis={() => setIsCrisisOpen(true)}
            />
          )}

          {activeTab === 'talk' && (
            <TalkScreen
              profile={profile}
              initialSituationSlug={talkSituation}
              initialText={talkInitialText}
              onOpenDetail={item => setDetailItem(item)}
              onOpenCrisis={() => setIsCrisisOpen(true)}
            />
          )}

          {activeTab === 'duas' && (
            <DuasScreen
              onOpenDetail={item => setDetailItem(item)}
              onOpenAdhkar={mode => setAdhkarMode(mode)}
            />
          )}

          {activeTab === 'hadith' && <HadithScreen />}

          {activeTab === 'you' && (
            <YouScreen
              profile={profile}
              consents={consents}
              onUpdateProfile={p => setProfile(p)}
              onUpdateConsents={c => setConsents(c)}
              onOpenCrisis={() => setIsCrisisOpen(true)}
              onOpenEvals={() => setIsEvalsOpen(true)}
              onResetApp={handleResetApp}
            />
          )}
        </div>

        {/* Bottom Tab Bar with 4 Tabs matching UI specification */}
        <nav
          className="bottom-tab-bar"
          style={{
            height: isNativePlatform ? '64px' : isDeviceFrame ? '70px' : 'calc(70px + var(--safe-area-bottom))',
            backgroundColor: isNativePlatform ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid var(--dividers)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingTop: '0px',
            paddingBottom: isNativePlatform ? '0px' : isDeviceFrame ? '6px' : 'calc(6px + var(--safe-area-bottom))',
            paddingLeft: isDeviceFrame ? '12px' : 'calc(12px + var(--safe-area-left))',
            paddingRight: isDeviceFrame ? '12px' : 'calc(12px + var(--safe-area-right))',
            flexShrink: 0,
            zIndex: 20,
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Tab 1: Today */}
          <button
            onClick={() => setActiveTab('today')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeTab === 'today' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <span
              className={`material-symbols-outlined ${activeTab === 'today' ? 'fill' : ''}`}
              style={{ fontSize: '24px' }}
            >
              wb_twilight
            </span>
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'today' ? 600 : 500 }}>
              Today
            </span>
          </button>

          {/* Tab 2: Talk (Prominent Primary Pill) */}
          <button
            onClick={() => setActiveTab('talk')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '0 4px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                boxShadow: '0 2px 10px rgba(0, 68, 62, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                chat_bubble_outline
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Talk</span>
            </div>
          </button>

          {/* Tab 3: Duas */}
          <button
            onClick={() => setActiveTab('duas')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeTab === 'duas' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <span
              className={`material-symbols-outlined ${activeTab === 'duas' ? 'fill' : ''}`}
              style={{ fontSize: '24px' }}
            >
              menu_book
            </span>
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'duas' ? 600 : 500 }}>
              Duas
            </span>
          </button>

          {/* Tab 4: Hadith Library */}
          <button
            onClick={() => setActiveTab('hadith')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeTab === 'hadith' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <span
              className={`material-symbols-outlined ${activeTab === 'hadith' ? 'fill' : ''}`}
              style={{ fontSize: '24px' }}
            >
              auto_stories
            </span>
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'hadith' ? 600 : 500 }}>
              Hadith
            </span>
          </button>

          {/* Tab 5: You */}
          <button
            onClick={() => setActiveTab('you')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: activeTab === 'you' ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer',
              padding: '4px 0'
            }}
          >
            <span
              className={`material-symbols-outlined ${activeTab === 'you' ? 'fill' : ''}`}
              style={{ fontSize: '24px' }}
            >
              person
            </span>
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'you' ? 600 : 500 }}>
              You
            </span>
          </button>
        </nav>

        {/* Global Modals */}
        <CrisisModal
          isOpen={isCrisisOpen}
          onClose={() => setIsCrisisOpen(false)}
          userCountryCode={profile.country_code}
        />

        <CitationDetailSheet
          item={detailItem}
          onClose={() => setDetailItem(null)}
        />

        <AdhkarPlayerModal
          isOpen={adhkarMode !== null}
          initialMode={adhkarMode || 'morning'}
          onClose={() => setAdhkarMode(null)}
        />

        <EvalsModal
          isOpen={isEvalsOpen}
          onClose={() => setIsEvalsOpen(false)}
        />
      </div>
    </div>
  );
};
