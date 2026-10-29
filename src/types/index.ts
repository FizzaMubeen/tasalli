// Tasalli — Type Definitions

export type SituationSlug =
  | 'job-rizq'
  | 'money-debt'
  | 'anxiety'
  | 'grief'
  | 'illness'
  | 'exams'
  | 'marriage'
  | 'family-conflict'
  | 'guilt-tawbah'
  | 'loneliness'
  | 'anger'
  | 'gratitude'
  | 'patience';

export interface Situation {
  slug: SituationSlug;
  title: string;
  arabicTitle: string;
  description: string;
  iconName: string;
}

export type TextType = 'ayah' | 'hadith' | 'dua';

export interface LibraryText {
  id: string; // e.g. 'rizq-001'
  type: TextType;
  arabic: string; // Verbatim Arabic with diacritics
  transliteration?: string; // For duas
  translation_en: string; // Clear English translation
  translation_source: string; // Licence/source trail
  source: string; // 'Qur\'an', 'Sahih al-Bukhari', 'Sahih Muslim', etc.
  reference: string; // 'Surah Ash-Sharh 94:5-6' or '6369'
  grade?: 'Sahih' | 'Hasan' | null;
  grader?: string | null;
  audio_url?: string;
  usage_note?: string;
  status: 'draft' | 'reviewed' | 'retired';
  reviewed_by?: string;
  review_date?: string;
  situation_slugs: SituationSlug[];
}

export interface Story {
  id: string;
  title: string;
  situations: SituationSlug[];
  kind: string;
  sources: string;
  grade: string;
  summary: string;
  lesson: string;
  bridge: string;
  do_not_add: string;
  related_dua: string;
  status: 'draft' | 'reviewed' | 'retired';
  allowed_names: string[];
}

export interface Hadith {
  no: number;
  topic: string;
  text: string;
  narrator: string;
  arabic: string;
  reference: string;
  in_book: string;
  grade: string;
  url: string;
  [field: string]: unknown;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string; // Assistant messages contain [[cite:id]] tokens
  cited_ids: string[];
  story_ids?: string[];
  hadith_ids?: number[];
  hadiths?: Hadith[];
  suggestions?: string[];
  mode?: 'normal' | 'crisis' | 'refer_scholar';
  created_at: string;
}

export interface Conversation {
  id: string;
  situation_slug?: SituationSlug;
  title: string;
  created_at: string;
  expires_at?: string;
  stage: 'listen' | 'respond';
}

export interface DuaPlanItem {
  text_id: string;
  times_read: number;
  target?: number;
}

export interface DuaPlan {
  id: string;
  situation_slug: SituationSlug;
  week_start: string;
  active: boolean;
  items: DuaPlanItem[];
}

export interface Followup {
  id: string;
  conversation_id: string;
  due_at: string;
  topic: string;
  status: 'scheduled' | 'sent' | 'dismissed';
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  id: PrayerName;
  name: string;
  arabicName: string;
  timeStr: string;
  dateObj: Date;
  isNext?: boolean;
  isCurrent?: boolean;
}

export interface PrayerLogEntry {
  id: string;
  date: string;
  prayer: PrayerName;
  status: 'prayed' | 'will_do' | 'not_today';
  timestamp: string;
}

export interface UserProfile {
  display_name: string;
  country_code: string;
  tone: 'gentle' | 'balanced' | 'firm';
  retention_days: number; // 7, 30, 90, or 0 (never store)
  reminders: {
    prayer_checkin: boolean;
    adhkar_morning: boolean;
    adhkar_evening: boolean;
    dua_plan: boolean;
    chat_followups: boolean;
  };
  calculation_method: string;
  asr_madhab: 'standard' | 'hanafi';
  time_zone: string; // e.g. 'Europe/Berlin'
  hijri_adjustment: number; // -2 to +2 days
}

export interface UserConsents {
  special_category: boolean; // Explicit consent for religious/emotional data
  log_review: boolean;
  analytics: boolean;
  version: string;
  granted_at?: string;
}

export interface Helpline {
  country_code: string;
  country_name: string;
  name: string;
  phone: string;
  emergency: string;
  url?: string;
  hours: string;
  verified_on: string;
}

export interface ValidatorResult {
  valid: boolean;
  reason?: string;
  cleanedText?: string;
  citedIds: string[];
  storyIds: string[];
  hadithIds: number[];
  rulesChecked: {
    rule: string;
    passed: boolean;
    details?: string;
  }[];
}
