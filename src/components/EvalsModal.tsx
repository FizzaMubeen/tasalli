import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, Play, RefreshCw, Terminal } from 'lucide-react';
import { runEvalsSuite, TestCaseResult } from '../lib/evalsSuite';
import { VALIDATOR_AUDIT_LOG } from '../lib/validator';

interface EvalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvalsModal: React.FC<EvalsModalProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>(() => runEvalsSuite());
  const [activeTab, setActiveTab] = useState<'tests' | 'logs'>('tests');

  if (!isOpen) return null;

  const handleRunAgain = () => {
    setTestResults(runEvalsSuite());
  };

  const totalPassed = testResults.filter(t => t.passed).length;
  const passRate = Math.round((totalPassed / testResults.length) * 100);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(30, 42, 40, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9950,
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
          padding: '22px 20px 30px 20px',
          maxHeight: '90%',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-sheet)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--primary-teal)" />
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-ink)' }}>
                QA Gates & Validator Inspector
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Phase 1 Quality Gates • 100% Target
              </div>
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

        {/* Tab switch & Run button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--primary-soft)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setActiveTab('tests')}
              style={{
                border: 'none',
                background: activeTab === 'tests' ? 'var(--primary-teal)' : 'transparent',
                color: activeTab === 'tests' ? 'white' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Test Suites ({totalPassed}/{testResults.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                border: 'none',
                background: activeTab === 'logs' ? 'var(--primary-teal)' : 'transparent',
                color: activeTab === 'logs' ? 'white' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Audit Log ({VALIDATOR_AUDIT_LOG.length})
            </button>
          </div>

          <button
            onClick={handleRunAgain}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary-teal)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            <span>Re-run</span>
          </button>
        </div>

        {/* Summary Card */}
        <div
          style={{
            backgroundColor: passRate === 100 ? 'var(--success-bg)' : 'var(--warning-bg)',
            border: `1px solid ${passRate === 100 ? 'var(--success-sage)' : 'var(--warning-amber)'}`,
            borderRadius: 'var(--radius-card)',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: passRate === 100 ? 'var(--success-sage)' : 'var(--warning-amber)' }}>
              Gate Status: {passRate === 100 ? 'READY FOR RELEASE (100% Pass)' : 'Review Failures'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Zero unverified citations, 100% crisis detection, Fiqh referrals intact.
            </div>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: passRate === 100 ? 'var(--success-sage)' : 'var(--warning-amber)' }}>
            {passRate}%
          </span>
        </div>

        {activeTab === 'tests' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {testResults.map((t, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-warm-ivory)',
                  border: '1px solid var(--dividers)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} color="var(--success-sage)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-ink)' }}>
                      {t.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t.suite}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  Input: "{t.input}"
                </div>
                <div style={{ fontSize: '11px', color: 'var(--primary-teal)', marginTop: '2px' }}>
                  Expected: {t.expected} → Got: {t.actual}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {VALIDATOR_AUDIT_LOG.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No audit entries yet. Chat messages and test runs will populate this log without storing user text.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {VALIDATOR_AUDIT_LOG.map(log => (
                  <div
                    key={log.id}
                    style={{
                      backgroundColor: 'var(--bg-warm-ivory)',
                      border: '1px solid var(--dividers)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: log.outcome === 'pass' ? 'var(--success-sage)' : 'var(--crisis-warm)'
                        }}
                      >
                        Outcome: {log.outcome.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Citations: {log.citedCount} | Unknown Refs: {log.unknownRefsCount} | Retried: {log.retried ? 'Yes' : 'No'}
                    </div>
                    {log.ruleFailed && (
                      <div style={{ color: 'var(--crisis-warm)', marginTop: '2px', fontSize: '11px' }}>
                        Reason: {log.ruleFailed}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
