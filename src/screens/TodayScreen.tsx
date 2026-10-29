import React, { useState, useEffect } from 'react';
import { calculatePrayerTimes, formatGregorianDate, getCurrentPrayerPeriodLabel, getFormattedHijriDate, getPrayerFeedback } from '../lib/prayerTimes';
import { logPrayerCheckIn, getStoredPrayerLogs, getStoredDuaPlans, saveStoredDuaPlans, getStoredFollowups } from '../lib/storage';
import { DuaPlan, Followup, LibraryText, PrayerName, PrayerTimeItem, UserProfile } from '../types';
import { LIBRARY_MAP, LIBRARY_TEXTS } from '../data/library';
import { audioPlayer } from '../lib/audioService';

interface TodayScreenProps {
  profile: UserProfile;
  onOpenAdhkar: (mode: 'morning' | 'evening') => void;
  onOpenDetail: (item: LibraryText) => void;
  onNavigateToTalk: (situationSlug?: string, initialText?: string) => void;
  onOpenCrisis: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  profile,
  onOpenAdhkar,
  onOpenDetail,
  onNavigateToTalk,
  onOpenCrisis
}) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeItem[]>([]);
  const [nextPrayerInfo, setNextPrayerInfo] = useState<string>('');
  const [checkInPrayer, setCheckInPrayer] = useState<PrayerName>('isha');
  const [clockNow, setClockNow] = useState(() => new Date());
  const [checkInDone, setCheckInDone] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<DuaPlan | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Featured Daily Ayah (Surah Ar-Ra'd 13:28)
  const dailyAyah = LIBRARY_MAP.get('anx-001') || LIBRARY_TEXTS[0];

  // Hijri date with user adjustment setting (Bug 2 fix)
  const hijri = getFormattedHijriDate(clockNow, profile.hijri_adjustment);
  const gregorianDate = formatGregorianDate(clockNow);
  const clockText = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }).format(clockNow);

  // Dynamic atmospheric label (Bug 3 fix)
  const [periodInfo, setPeriodInfo] = useState<{ label: string; icon: string }>({ label: 'Morning Solace', icon: 'wb_sunny' });

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const times = calculatePrayerTimes(
      clockNow,
      52.52,
      13.405,
      profile.calculation_method,
      profile.asr_madhab,
      profile.time_zone
    );
    setPrayerTimes(times);
    setPeriodInfo(getCurrentPrayerPeriodLabel(times, clockNow));

    // Calculate time until next prayer
    const nextItem = times.find(t => t.isNext);
    if (nextItem) {
      const remainingMinutes = Math.max(0, Math.ceil((nextItem.dateObj.getTime() - clockNow.getTime()) / 60_000));
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      setNextPrayerInfo(`${nextItem.name} in ${hours > 0 ? `${hours}h ` : ''}${minutes}m`);

      const prayerOrder: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const nextIndex = prayerOrder.indexOf(nextItem.id);
      setCheckInPrayer(prayerOrder[(nextIndex + prayerOrder.length - 1) % prayerOrder.length]);
    }

    // Load active dua plan
    const plans = getStoredDuaPlans();
    if (plans.length > 0 && plans[0].active) {
      setActivePlan(plans[0]);
    }

    // Load followups
    const f = getStoredFollowups().filter(item => item.status === 'scheduled');
    setFollowups(f);
  }, [profile, clockNow]);

  const handlePrayerAction = (status: 'prayed' | 'will_do' | 'not_today') => {
    logPrayerCheckIn(checkInPrayer, status);
    const feedback = getPrayerFeedback(status, checkInPrayer);
    setFeedbackMessage(feedback);
    setCheckInDone(true);
  };

  const handleIncrementDuaRead = (textId: string) => {
    if (!activePlan) return;
    const updated = {
      ...activePlan,
      items: activePlan.items.map(it =>
        it.text_id === textId ? { ...it, times_read: it.times_read + 1 } : it
      )
    };
    setActivePlan(updated);
    saveStoredDuaPlans([updated]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const prayerTimelineItems = prayerTimes.filter(p => p.id !== 'sunrise');

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
      {/* Architectural Serenity Header */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4, fontWeight: 500, color: 'var(--on-surface-variant)' }}>
                {gregorianDate} · {hijri.day} {hijri.monthName} {hijri.year}
              </span>
              <span style={{ display: 'block', fontSize: '11px', lineHeight: 1.4, color: 'var(--on-surface-variant)' }}>
                {clockText}
              </span>
            </div>
          </div>

          {/* Atmospheric micro-badge derived dynamically (Bug 3) */}
          <div
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--surface-container-high)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--secondary)' }}>
              {periodInfo.icon}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
              {periodInfo.label}
            </span>
          </div>
        </div>

        {/* Clean Greeting (Bug 5: No unreferenced quotes) */}
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--on-surface)',
            marginTop: '2px'
          }}
        >
          As-salamu alaykum, {profile.display_name}
        </h1>
      </div>

      {/* Followup Alert Card (if any pending follow-up from previous conversations) */}
      {followups.length > 0 && (
        <div
          onClick={() => onNavigateToTalk(undefined, `I wanted to follow up about my ${followups[0].topic}`)}
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 14px',
            marginBottom: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-fixed-dim)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>favorite</span>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                Scheduled Check-In
              </div>
              <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                How did your {followups[0].topic} go? Tap to share in gentle space.
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>chevron_right</span>
        </div>
      )}

      {/* 1. Prayer Rhythm Cloister Card */}
      <section style={{ marginBottom: '16px' }}>
        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Faint geometric 8-point star khatim watermark */}
          <svg
            style={{
              position: 'absolute',
              right: '-16px',
              bottom: '-16px',
              width: '100px',
              height: '100px',
              color: 'rgba(121, 89, 0, 0.06)',
              pointerEvents: 'none',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 1
            }}
            viewBox="0 0 100 100"
          >
            <rect x="25" y="25" width="50" height="50" rx="2" />
            <rect x="25" y="25" width="50" height="50" rx="2" transform="rotate(45 50 50)" />
            <circle cx="50" cy="50" r="6" />
          </svg>

          {/* Cloister Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(151, 210, 201, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--primary)' }}>schedule</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>Prayer Rhythm</span>
            </div>
            <div
              style={{
                backgroundColor: 'var(--surface-container)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary)'
              }}
            >
              {nextPrayerInfo}
            </div>
          </div>

          {/* 5 Prayers Timeline Graphic */}
          <div style={{ position: 'relative', zIndex: 1, paddingTop: '4px', paddingBottom: '4px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              {/* Connecting progress bar */}
              <div
                style={{
                  position: 'absolute',
                  top: '13px',
                  left: '10%',
                  right: '10%',
                  height: '2px',
                  backgroundColor: 'var(--surface-container-high)',
                  zIndex: 0
                }}
              />

              {prayerTimelineItems.map((p, idx) => {
                const prayerLogs = getStoredPrayerLogs();
                const todayStr = new Date().toISOString().split('T')[0];
                const isPrayed = prayerLogs.some(log => log.date === todayStr && log.prayer === p.id && log.status === 'prayed');

                return (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: p.isNext
                          ? 'var(--surface-container-lowest)'
                          : isPrayed
                          ? 'var(--primary)'
                          : 'var(--surface-container-high)',
                        color: isPrayed ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                        border: p.isNext ? '2px solid var(--primary)' : 'none',
                        boxShadow: p.isNext ? '0 2px 8px rgba(0, 68, 62, 0.2)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isPrayed ? (
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                      ) : p.isNext ? (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      ) : (
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--outline-variant)' }} />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: p.isNext ? 600 : 500,
                        color: p.isNext ? 'var(--primary)' : 'var(--on-surface-variant)'
                      }}
                    >
                      {p.name}
                    </span>
                    <span style={{ fontSize: '11px', color: p.isNext ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                      {p.timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Prayer Check-In Card */}
      <section style={{ marginBottom: '16px' }}>
        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>check_circle</span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>Prayer Check-In</h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
              {checkInPrayer.charAt(0).toUpperCase() + checkInPrayer.slice(1)}
            </span>
          </div>

          {!checkInDone ? (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '12px' }}>
                {checkInPrayer.charAt(0).toUpperCase() + checkInPrayer.slice(1)} time. Have you managed to pray?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => handlePrayerAction('prayed')}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Prayed
                </button>
                <button
                  onClick={() => handlePrayerAction('will_do')}
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    color: 'var(--on-surface)',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Will do now
                </button>
                <button
                  onClick={() => handlePrayerAction('not_today')}
                  style={{
                    backgroundColor: 'var(--surface-container)',
                    color: 'var(--on-surface-variant)',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Not today
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                {feedbackMessage || 'Recorded successfully.'}
              </span>
              <button
                onClick={() => setCheckInDone(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Change check-in
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Solace Reflection / Daily Ayah Card (Focal Hero) */}
      <section style={{ marginBottom: '16px' }}>
        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)',
            padding: '20px 18px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--secondary)', fontWeight: 600 }}>
                Daily Solace • آية اليوم
              </span>
            </div>

            <button
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                showToast(isBookmarked ? 'Bookmark removed' : 'Ayah saved to Bookmarks');
              }}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-container-low)',
                border: 'none',
                color: isBookmarked ? 'var(--primary)' : 'var(--on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className={`material-symbols-outlined ${isBookmarked ? 'fill' : ''}`} style={{ fontSize: '18px' }}>
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>

          {/* Sacred Arabic Calligraphy */}
          <div style={{ padding: '6px 0 10px 0' }}>
            <p
              className="arabic-text"
              style={{
                fontSize: '25px',
                lineHeight: '1.9',
                color: 'var(--primary)',
                margin: 0
              }}
            >
              {dailyAyah.arabic}
            </p>
          </div>

          {/* 8-Point Star Muted Separator Ribbon */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: 'var(--surface-variant)',
              margin: '10px 0 14px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '0 8px', color: 'rgba(121, 89, 0, 0.4)' }}>
              <svg style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }} viewBox="0 0 24 24">
                <rect x="5" y="5" width="14" height="14" rx="1" />
                <rect x="5" y="5" width="14" height="14" rx="1" transform="rotate(45 12 12)" />
              </svg>
            </span>
          </div>

          {/* English Translation & Reference */}
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '15px', fontStyle: 'italic', lineHeight: '1.6', color: 'var(--on-surface)' }}>
              "{dailyAyah.translation_en}"
            </p>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', display: 'block', marginTop: '4px' }}>
              {dailyAyah.reference} • {dailyAyah.translation_source}
            </span>
          </div>

          {/* Contemplative Framing */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container-low)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }}>
              spa
            </span>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: '1.5' }}>
              Take three calm breaths. Allah knows the silent weights and delicate hopes you carry into this moment.
            </p>
          </div>

          {/* Reflect in Talk Action Pill */}
          <button
            onClick={() => onNavigateToTalk('anxiety', `I was reflecting on the verse "${dailyAyah.translation_en}" (${dailyAyah.reference}) and wanted to talk about it.`)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-xs)',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat_bubble_outline</span>
            <span>Reflect in Talk</span>
          </button>
        </div>
      </section>

      {/* 4. Quick Solace Duas & Dhikr */}
      <section style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '0 2px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>Solace Duas</h3>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Anchors for quiet contemplation</span>
          </div>
          <button
            onClick={() => onNavigateToTalk('anxiety')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <span>Explore all</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Item 1: Morning Dhikr */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-card)',
              padding: '14px 16px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-container)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>flare</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
                  Morning Dhikr of Solace
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--surface-container-high)', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                    3 mins
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--outline-variant)' }}>•</span>
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                    7 adhkar
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAdhkar('morning')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-container-low)',
                border: 'none',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span>
            </button>
          </div>

          {/* Item 2: Prophetic Dua for Anxiety & Distress */}
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              borderRadius: 'var(--radius-card)',
              padding: '14px 16px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-container)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_stories</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>
                  Dua for Easing Anxiety & Distress
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(255, 222, 160, 0.4)', fontSize: '11px', color: 'var(--on-secondary-container)', fontWeight: 600 }}>
                    Sahih al-Bukhari 6369
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--outline-variant)' }}>•</span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                    Grade: Sahih
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const item = LIBRARY_MAP.get('debt-002');
                if (item) onOpenDetail(item);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-container-low)',
                border: 'none',
                color: 'var(--on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bookmark_border</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Weekly Dua Focus Card (Bug 4 fix: Displays full source, reference, and grade) */}
      {activePlan && activePlan.items.length > 0 && (
        <section style={{ marginBottom: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--surface-container-lowest)',
              border: '1px solid var(--dividers)',
              borderRadius: 'var(--radius-card)',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>bookmark</span>
                <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--secondary)', letterSpacing: '0.05em' }}>
                  Weekly Focus
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                {activePlan.items[0].times_read} recited
              </span>
            </div>

            {(() => {
              const textItem = LIBRARY_MAP.get(activePlan.items[0].text_id);
              if (!textItem) return null;
              return (
                <div>
                  <div className="arabic-text" style={{ fontSize: '20px', lineHeight: '1.8', marginBottom: '8px' }}>
                    {textItem.arabic}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--on-surface)', marginBottom: '8px', lineHeight: '1.5' }}>
                    "{textItem.translation_en}"
                  </div>

                  {/* Bug 4 fix: source, reference, and grade badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                      {textItem.source} ({textItem.reference})
                    </span>
                    {textItem.grade && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'rgba(151, 210, 201, 0.3)', padding: '1px 7px', borderRadius: 'var(--radius-pill)' }}>
                        {textItem.grade} {textItem.grader ? `• ${textItem.grader}` : ''}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleIncrementDuaRead(activePlan.items[0].text_id)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--primary-fixed-dim)',
                      color: 'var(--primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-pill)',
                      padding: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                    <span>+ I Read It ({activePlan.items[0].times_read})</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* 6. Evening Whispers of Peace */}
      <section style={{ marginBottom: '8px' }}>
        <div
          style={{
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            backgroundColor: 'var(--surface-container)',
            padding: '14px 16px',
            border: '1px solid var(--surface-variant)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '16px', height: '16px', color: 'var(--secondary)', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }} viewBox="0 0 24 24">
                <rect x="5" y="5" width="14" height="14" rx="1" />
                <rect x="5" y="5" width="14" height="14" rx="1" transform="rotate(45 12 12)" />
              </svg>
              <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                Evening Whispers of Peace
              </span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>nights_stay</span>
          </div>

          <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--on-surface)', marginTop: '8px', lineHeight: '1.5' }}>
            “And remember your Lord within yourself in humility and in fear without being loud in speech.”
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--surface-variant)' }}>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Surah Al-A'raf 7:205</span>
            <span className="arabic-text" style={{ fontSize: '15px', color: 'var(--secondary)', lineHeight: 1.2 }}>وَاذْكُر رَّبَّكَ فِي نَفْسِكَ</span>
          </div>
        </div>
      </section>

      {/* Toast notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--tertiary)',
            color: 'var(--on-tertiary)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-floating)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary-fixed)' }}>check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
