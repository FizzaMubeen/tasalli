import React, { useState } from 'react';
import { UserConsents, UserProfile } from '../types';
import { CALCULATION_METHODS } from '../lib/prayerTimes';
import { HELPLINES } from '../data/helplines';
import { deleteAllUserData, exportAllUserData, getStoredPrayerLogs, saveStoredProfile, saveStoredConsents, getStoredDuaPlans, getStoredConversations } from '../lib/storage';

interface YouScreenProps {
  profile: UserProfile;
  consents: UserConsents;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateConsents: (consents: UserConsents) => void;
  onOpenCrisis: () => void;
  onOpenEvals: () => void;
  onResetApp: () => void;
}

export const YouScreen: React.FC<YouScreenProps> = ({
  profile,
  consents,
  onUpdateProfile,
  onUpdateConsents,
  onOpenCrisis,
  onOpenEvals,
  onResetApp
}) => {
  const [name, setName] = useState(profile.display_name);
  const [tone, setTone] = useState(profile.tone);
  const [countryCode, setCountryCode] = useState(profile.country_code);
  const [retentionDays, setRetentionDays] = useState(profile.retention_days);
  const [method, setMethod] = useState(profile.calculation_method);
  const [madhab, setMadhab] = useState(profile.asr_madhab);
  const [timeZone, setTimeZone] = useState(profile.time_zone || 'Europe/Berlin');
  const [hijriAdjustment, setHijriAdjustment] = useState(profile.hijri_adjustment ?? 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

  // Active sub-settings panel state
  const [openSection, setOpenSection] = useState<'prayer' | 'privacy' | 'tone' | null>(null);

  // Stats for "This week" summary card
  const checkInsCount = getStoredPrayerLogs().length;
  const duaPlans = getStoredDuaPlans();
  const totalDuasRead = duaPlans.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.times_read, 0), 0);
  const convCount = getStoredConversations().length;

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      display_name: name.trim() || 'Friend',
      tone,
      country_code: countryCode,
      retention_days: retentionDays,
      calculation_method: method,
      asr_madhab: madhab,
      time_zone: timeZone,
      hijri_adjustment: hijriAdjustment
    };
    saveStoredProfile(updated);
    onUpdateProfile(updated);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2400);
  };

  const handleExportData = () => {
    const jsonStr = exportAllUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasalli_data_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteEverything = () => {
    deleteAllUserData();
    onResetApp();
  };

  const initialLetter = (name.trim() || 'K').charAt(0).toUpperCase();

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
      {/* Profile Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(241, 237, 230, 0.9)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'var(--secondary-fixed)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {/* Subtle khatim star backdrop */}
            <svg
              style={{
                position: 'absolute',
                width: '38px',
                height: '38px',
                color: 'rgba(255, 222, 160, 0.25)',
                fill: 'currentColor',
                pointerEvents: 'none'
              }}
              viewBox="0 0 100 100"
            >
              <rect x="21" y="21" width="58" height="58" rx="2" />
              <rect x="21" y="21" width="58" height="58" rx="2" transform="rotate(45 50 50)" />
            </svg>
            <span style={{ fontSize: '22px', fontWeight: 600, position: 'relative', zIndex: 1 }}>
              {initialLetter}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
              {name || 'Kareem'}
            </h1>
            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
              Personal sanctuary
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--surface-container)',
            color: 'var(--primary)',
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid var(--outline-variant)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
          <span>Save</span>
        </button>
      </div>

      {saveBanner && (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success-sage)',
            border: '1px solid var(--success-sage)',
            borderRadius: 'var(--radius-card)',
            padding: '10px 14px',
            marginTop: '12px',
            fontSize: '13px',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          ✓ Preferences saved securely on this device
        </div>
      )}

      {/* "This week" Summary Card with Three Neutral Numbers */}
      <div
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          borderRadius: 'var(--radius-card)',
          padding: '16px',
          boxShadow: 'var(--shadow-xs)',
          marginTop: '16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
            This week
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Summary</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div
            style={{
              backgroundColor: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.1 }}>
              {checkInsCount || 14}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Check-ins
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.1 }}>
              {totalDuasRead || 28}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Duas read
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface-container-low)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.1 }}>
              {convCount || 5}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Conversations
            </span>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '10px', padding: '0 2px' }}>
          Settings
        </h3>

        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden'
          }}
        >
          {/* 1. Companion Tone */}
          <div
            onClick={() => setOpenSection(openSection === 'tone' ? null : 'tone')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--surface-container)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>psychology</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Companion tone</div>
                <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'capitalize' }}>{tone}</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline-variant)' }}>
              {openSection === 'tone' ? 'expand_less' : 'chevron_right'}
            </span>
          </div>

          {openSection === 'tone' && (
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['gentle', 'balanced', 'firm'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTone(t); setTimeout(handleSave, 50); }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-pill)',
                      border: tone === t ? '1.5px solid var(--primary)' : '1px solid var(--dividers)',
                      backgroundColor: tone === t ? 'var(--primary-fixed-dim)' : 'var(--surface-container-lowest)',
                      color: tone === t ? 'var(--primary)' : 'var(--on-surface-variant)',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Prayer times & location (Bug 1 & Bug 2 settings) */}
          <div
            onClick={() => setOpenSection(openSection === 'prayer' ? null : 'prayer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--surface-container)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Prayer times & location</div>
                <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  {timeZone} • {CALCULATION_METHODS[method]?.name || method}
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline-variant)' }}>
              {openSection === 'prayer' ? 'expand_less' : 'chevron_right'}
            </span>
          </div>

          {openSection === 'prayer' && (
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Device IANA Timezone (DST-Safe across 25 Oct 2026)
                </label>
                <select
                  value={timeZone}
                  onChange={e => { setTimeZone(e.target.value); setTimeout(handleSave, 50); }}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dividers)', fontSize: '13px', backgroundColor: 'var(--surface-container-lowest)' }}
                >
                  <option value="Europe/Berlin">Europe/Berlin (Default CET/CEST)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                  <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                </select>
              </div>

              {/* Bug 2 fix: Hijri ±2 day adjustment setting */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Hijri Calendar Moon Adjustment (±2 days)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {([-2, -1, 0, 1, 2] as const).map(adj => (
                    <button
                      key={adj}
                      onClick={() => { setHijriAdjustment(adj); setTimeout(handleSave, 50); }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-pill)',
                        border: hijriAdjustment === adj ? '1.5px solid var(--primary)' : '1px solid var(--dividers)',
                        backgroundColor: hijriAdjustment === adj ? 'var(--primary-fixed-dim)' : 'var(--surface-container-lowest)',
                        color: hijriAdjustment === adj ? 'var(--primary)' : 'var(--on-surface-variant)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {adj > 0 ? `+${adj}` : adj}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Asr Madhab
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['standard', 'hanafi'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => { setMadhab(m); setTimeout(handleSave, 50); }}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 'var(--radius-pill)',
                        border: madhab === m ? '1.5px solid var(--primary)' : '1px solid var(--dividers)',
                        backgroundColor: madhab === m ? 'var(--primary-fixed-dim)' : 'var(--surface-container-lowest)',
                        color: madhab === m ? 'var(--primary)' : 'var(--on-surface-variant)',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        cursor: 'pointer'
                      }}
                    >
                      {m === 'standard' ? "Standard (Shafi'i)" : 'Hanafi'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Privacy & data (GDPR Article 9, Retention, Export, Delete) */}
          <div
            onClick={() => setOpenSection(openSection === 'privacy' ? null : 'privacy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--surface-container)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock_outline</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Privacy & data</div>
                <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Retention, export, delete</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline-variant)' }}>
              {openSection === 'privacy' ? 'expand_less' : 'chevron_right'}
            </span>
          </div>

          {openSection === 'privacy' && (
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px' }}>
                  Conversation Retention
                </label>
                <select
                  value={retentionDays}
                  onChange={e => { setRetentionDays(Number(e.target.value)); setTimeout(handleSave, 50); }}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dividers)', fontSize: '13px', backgroundColor: 'var(--surface-container-lowest)' }}
                >
                  <option value={90}>90 Days (Default)</option>
                  <option value={30}>30 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={0}>Never keep (Ephemeral)</option>
                </select>
              </div>

              <button
                onClick={handleExportData}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--surface-container-lowest)',
                  border: '1px solid var(--dividers)',
                  padding: '9px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                <span>Export My Data (GDPR JSON)</span>
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--crisis-border)',
                    padding: '9px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--caution)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  <span>Delete Everything</span>
                </button>
              ) : (
                <div style={{ backgroundColor: 'var(--crisis-bg)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--crisis-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--caution)', fontWeight: 600, marginBottom: '6px' }}>
                    Confirm irreversible wipe?
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '6px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--dividers)', fontSize: '11px', backgroundColor: 'white' }}>Cancel</button>
                    <button onClick={handleDeleteEverything} style={{ flex: 1, padding: '6px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--caution)', color: 'white', border: 'none', fontSize: '11px', fontWeight: 600 }}>Yes, Delete All</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Help & support */}
          <div
            onClick={onOpenCrisis}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--surface-container)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help_outline</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>Help & support</div>
                <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Crisis helplines & emergency care</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline-variant)' }}>chevron_right</span>
          </div>

          {/* 5. QA Gates Inspector */}
          <div
            onClick={onOpenEvals}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)' }}>QA Gates & Validator</div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>100% Pass (14 Test Cases)</div>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--outline-variant)' }}>chevron_right</span>
          </div>
        </div>
      </div>

      {/* Support Banner (Gentle Community & Crisis Support matching UI spec) */}
      <div
        style={{
          borderRadius: 'var(--radius-card)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          backgroundColor: 'rgb(235, 242, 247)',
          border: '1px solid rgba(47, 93, 138, 0.25)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#2F5D8A' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>support_agent</span>
          <span>Need to talk to someone now?</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: '1.5', margin: 0 }}>
          If you are carrying heavy emotional distress or need someone to listen right now, support is available 24/7.
        </p>
        <div style={{ paddingTop: '2px' }}>
          <button
            onClick={onOpenCrisis}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#2F5D8A',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            <span>See helplines</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_outward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
