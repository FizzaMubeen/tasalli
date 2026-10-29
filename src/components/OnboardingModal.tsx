import React, { useState } from 'react';
import { Shield, Sparkles, Check, ChevronRight } from 'lucide-react';
import { UserConsents, UserProfile } from '../types';
import { saveStoredConsents, saveStoredProfile, setUserOnboarded } from '../lib/storage';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, consents: UserConsents) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState('');
  const [tone, setTone] = useState<'gentle' | 'balanced' | 'firm'>('gentle');

  // Separate unticked toggles for GDPR Article 9 compliance
  const [consentSpecialCategory, setConsentSpecialCategory] = useState(false);
  const [consentLogReview, setConsentLogReview] = useState(false);
  const [consentAnalytics, setConsentAnalytics] = useState(false);

  if (!isOpen) return null;

  const handleFinish = () => {
    const profile: UserProfile = {
      display_name: displayName.trim() || 'Friend',
      country_code: 'US',
      tone,
      retention_days: 90,
      reminders: {
        prayer_checkin: false,
        adhkar_morning: false,
        adhkar_evening: false,
        dua_plan: false,
        chat_followups: true
      },
      calculation_method: 'MWL',
      asr_madhab: 'standard',
      time_zone: 'Europe/Berlin',
      hijri_adjustment: 0
    };

    const consents: UserConsents = {
      special_category: consentSpecialCategory,
      log_review: consentLogReview,
      analytics: consentAnalytics,
      version: '2026.1'
    };

    saveStoredProfile(profile);
    saveStoredConsents(consents);
    setUserOnboarded(true);
    onComplete(profile, consents);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#F7F3EC',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          minHeight: '100%',
          backgroundColor: '#F7F3EC',
          padding: '24px 16px',
          margin: '0 auto',
          overflowY: 'auto'
        }}
      >
        {step === 1 ? (
          <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#E3EEEC',
                  color: '#1F5C55',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}
              >
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontSize: '22px', color: '#1C1C18' }}>
                Welcome to Tasalli
              </h2>
              <div style={{ marginTop: '4px', color: '#404947', fontSize: '13px' }}>
                تسلي • A calm companion for the heart
              </div>
            </div>

            {/* Clear boundaries disclaimer */}
            <div
              style={{
                backgroundColor: '#F7F3EC',
                border: '1px solid var(--dividers)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '18px',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#1C1C18'
              }}
            >
              <strong>Important boundaries:</strong> Tasalli is a calm conversational companion grounded in verified Islamic tradition. It is <em>not</em> emergency care, <em>not</em> therapy, and <em>not</em> a fatwa or formal scholarly authority.
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1C18', marginBottom: '6px' }}>
                What may we call you?
              </label>
              <input
                type="text"
                placeholder="e.g. Maryam, Zayd, Friend"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E6E0D6',
                  fontSize: '14px',
                  fontFamily: 'var(--font-sans)',
                  color: '#1C1C18',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  appearance: 'none'
                }}
                className="onboarding-name-input"
              />
            </div>

            {/* Companion Tone */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1C1C18', marginBottom: '8px' }}>
                Companion Tone Preference
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['gentle', 'balanced', 'firm'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      borderRadius: '9999px',
                      border: tone === t ? '1.5px solid #1F5C55' : '1px solid #E6E0D6',
                      backgroundColor: tone === t ? '#E3EEEC' : 'transparent',
                      color: tone === t ? '#1F5C55' : '#404947',
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

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#1F5C55',
                color: '#FFFFFF',
                border: 'none',
                padding: '0 14px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Next: Privacy & Consents</span>
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Shield size={22} color="#1F5C55" />
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1C1C18' }}>
                Your Privacy by Default
              </h2>
            </div>

            <p style={{ fontSize: '13px', color: '#404947', marginBottom: '16px', lineHeight: '1.5' }}>
              Under GDPR Article 9, faith practice and emotional states are special-category data. We require explicit consent, store logs on-device, and provide one-tap data deletion.
            </p>

            {/* Consents toggles (all unticked by default) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {/* Toggle 1: Required for Chat */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: '#F7F3EC',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: consentSpecialCategory ? '1px solid #1F5C55' : '1px solid #E6E0D6'
                }}
              >
                <input
                  type="checkbox"
                  checked={consentSpecialCategory}
                  onChange={e => setConsentSpecialCategory(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#1F5C55' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1C18' }}>
                    Special-category data processing (Required)
                  </div>
                  <div style={{ fontSize: '12px', color: '#404947', marginTop: '2px' }}>
                    Process emotional and faith-related conversations to provide grounded answers.
                  </div>
                </div>
              </label>

              {/* Toggle 2: Optional quality review */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: '#F7F3EC',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1px solid #E6E0D6'
                }}
              >
                <input
                  type="checkbox"
                  checked={consentLogReview}
                  onChange={e => setConsentLogReview(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#1F5C55' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C18' }}>
                    Anonymous quality review (Optional)
                  </div>
                  <div style={{ fontSize: '12px', color: '#404947', marginTop: '2px' }}>
                    Allow scholar & safety team to review anonymized dialogue to improve fidelity.
                  </div>
                </div>
              </label>

              {/* Toggle 3: Optional analytics */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: '#F7F3EC',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1px solid #E6E0D6'
                }}
              >
                <input
                  type="checkbox"
                  checked={consentAnalytics}
                  onChange={e => setConsentAnalytics(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#1F5C55' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C18' }}>
                    EU-hosted telemetry (Optional)
                  </div>
                  <div style={{ fontSize: '12px', color: '#404947', marginTop: '2px' }}>
                    Anonymous crash reports. No message content is ever recorded.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: '1px solid #E6E0D6',
                  padding: '12px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  color: '#404947',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!consentSpecialCategory}
                style={{
                  flex: 2,
                  backgroundColor: consentSpecialCategory ? '#1F5C55' : '#E6E0D6',
                  color: consentSpecialCategory ? '#FFFFFF' : '#707977',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: consentSpecialCategory ? 'pointer' : 'not-allowed'
                }}
              >
                Enter Tasalli
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
