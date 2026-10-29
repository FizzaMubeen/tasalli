import React from 'react';
import { Phone, Heart, Shield, X, ExternalLink, AlertCircle } from 'lucide-react';
import { Helpline } from '../types';
import { getHelplineForCountry } from '../data/helplines';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCountryCode?: string;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({
  isOpen,
  onClose,
  userCountryCode = 'US'
}) => {
  if (!isOpen) return null;

  const helpline = getHelplineForCountry(userCountryCode);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30, 42, 40, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.25s ease'
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
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--crisis-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--crisis-warm)'
              }}
            >
              <Heart size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--crisis-warm)' }}>
                You Are Not Alone
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Compassionate support is here for you right now
              </span>
            </div>
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

        {/* Caring Message Written by Team (Not generated) */}
        <div
          style={{
            backgroundColor: 'var(--bg-warm-ivory)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            border: '1px solid var(--dividers)',
            marginBottom: '20px'
          }}
        >
          <p className="body-text" style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-ink)' }}>
            Your life is deeply precious, and the heaviness you are carrying is real.
            In Islam, seeking medicine, care, and professional help is an act of trust in Allah and preservation of life.
            Please pause right now, take a slow breath, and connect with trained caregivers who want to listen.
          </p>
        </div>

        {/* Primary Immediate Action: Country Helpline */}
        <div
          style={{
            backgroundColor: 'var(--crisis-bg)',
            border: '1px solid var(--crisis-border)',
            borderRadius: 'var(--radius-card)',
            padding: '18px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--crisis-warm)', letterSpacing: '0.05em' }}>
                {helpline.country_name} Crisis Support
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-ink)', marginTop: '2px' }}>
                {helpline.name}
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-white)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              {helpline.hours}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Free, confidential, and available immediately.
          </p>

          <a
            href={`tel:${helpline.phone.replace(/[^0-9]/g, '')}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--crisis-warm)',
              color: 'var(--surface-white)',
              textDecoration: 'none',
              padding: '12px 16px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: '15px'
            }}
          >
            <Phone size={18} />
            <span>Call {helpline.phone}</span>
          </a>
        </div>

        {/* Emergency Services */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-white)',
            border: '1px solid var(--dividers)',
            borderRadius: 'var(--radius-card)',
            padding: '14px 16px',
            marginBottom: '16px'
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-ink)' }}>
              Emergency Services
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              If you or someone else is in immediate physical danger
            </div>
          </div>
          <a
            href={`tel:${helpline.emergency}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary-teal)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Phone size={14} />
            <span>Call {helpline.emergency}</span>
          </a>
        </div>

        {/* Reach out to someone you trust */}
        <div
          style={{
            backgroundColor: 'var(--bg-warm-ivory)',
            borderRadius: 'var(--radius-card)',
            padding: '14px 16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield size={16} color="var(--primary-teal)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)' }}>
              Reach Out to a Friend or Family Member
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Sending a short message such as <em>"I'm having a really difficult time right now, could you stay on the phone with me?"</em> can break isolation.
          </p>
        </div>

        {/* Bottom Dismiss */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: '1px solid var(--dividers)',
            color: 'var(--text-secondary)',
            padding: '12px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          I am in a safe space now
        </button>
      </div>
    </div>
  );
};
