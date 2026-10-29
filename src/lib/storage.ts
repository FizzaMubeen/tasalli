import { Conversation, DuaPlan, Followup, Message, PrayerLogEntry, UserConsents, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'tasalli_profile_v1',
  CONSENTS: 'tasalli_consents_v1',
  CONVERSATIONS: 'tasalli_conversations_v1',
  MESSAGES: 'tasalli_messages_v1',
  PRAYER_LOG: 'tasalli_prayer_log_v1',
  DUA_PLANS: 'tasalli_dua_plans_v1',
  FOLLOWUPS: 'tasalli_followups_v1',
  HAS_ONBOARDED: 'tasalli_onboarded_v1'
};

export const DEFAULT_PROFILE: UserProfile = {
  display_name: 'Friend',
  country_code: 'US',
  tone: 'gentle',
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

export const DEFAULT_CONSENTS: UserConsents = {
  special_category: false,
  log_review: false,
  analytics: false,
  version: '2026.1'
};

// Storage helper functions
export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getStoredConsents(): UserConsents {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSENTS);
    return raw ? { ...DEFAULT_CONSENTS, ...JSON.parse(raw) } : DEFAULT_CONSENTS;
  } catch {
    return DEFAULT_CONSENTS;
  }
}

export function saveStoredConsents(consents: UserConsents): void {
  localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify({ ...consents, granted_at: new Date().toISOString() }));
}

export function hasUserOnboarded(): boolean {
  return localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED) === 'true';
}

export function setUserOnboarded(value = true): void {
  localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value ? 'true' : 'false');
}

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export function getStoredMessages(conversationId?: string): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const all: Message[] = raw ? JSON.parse(raw) : [];
    if (conversationId) {
      return all.filter(m => m.conversation_id === conversationId);
    }
    return all;
  } catch {
    return [];
  }
}

export function saveStoredMessages(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getStoredPrayerLogs(): PrayerLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRAYER_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logPrayerCheckIn(prayer: PrayerLogEntry['prayer'], status: PrayerLogEntry['status']): PrayerLogEntry {
  const logs = getStoredPrayerLogs();
  const entry: PrayerLogEntry = {
    id: `plog-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    prayer,
    status,
    timestamp: new Date().toISOString()
  };
  logs.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.PRAYER_LOG, JSON.stringify(logs.slice(0, 100)));
  return entry;
}

export function getStoredDuaPlans(): DuaPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DUA_PLANS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredDuaPlans(plans: DuaPlan[]): void {
  localStorage.setItem(STORAGE_KEYS.DUA_PLANS, JSON.stringify(plans));
}

export function getStoredFollowups(): Followup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredFollowups(followups: Followup[]): void {
  localStorage.setItem(STORAGE_KEYS.FOLLOWUPS, JSON.stringify(followups));
}

/**
 * Export all user data as GDPR-compliant JSON
 */
export function exportAllUserData(): string {
  const data = {
    app: 'Tasalli',
    version: 'Phase 1 (v1.0)',
    exported_at: new Date().toISOString(),
    profile: getStoredProfile(),
    consents: getStoredConsents(),
    conversations: getStoredConversations(),
    messages: getStoredMessages(),
    dua_plans: getStoredDuaPlans(),
    prayer_logs_summary: {
      count: getStoredPrayerLogs().length,
      note: 'Stored strictly on-device'
    },
    followups: getStoredFollowups()
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Irreversible One-Tap Delete Everything
 */
export function deleteAllUserData(): void {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.CONSENTS);
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.PRAYER_LOG);
  localStorage.removeItem(STORAGE_KEYS.DUA_PLANS);
  localStorage.removeItem(STORAGE_KEYS.FOLLOWUPS);
  localStorage.removeItem(STORAGE_KEYS.HAS_ONBOARDED);
}
