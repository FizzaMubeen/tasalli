import { Hadith, LibraryText, Message, SituationSlug, Story, UserProfile } from '../types';
import { checkSafety, SafetyCheckResult } from './safety';
import { validateReply } from './validator';
import { LIBRARY_TEXTS, LIBRARY_MAP } from '../data/library';
import { retrieveStories } from './storyRetrieval';

export interface ChatPipelineResponse {
  conversation_id: string;
  text: string;
  citations: LibraryText[];
  stories: Story[];
  hadiths: Hadith[];
  suggestions: string[];
  mode: 'normal' | 'crisis' | 'refer_scholar';
  safetyCheck: SafetyCheckResult;
}

export function detectSituation(message: string): SituationSlug | null {
  const m = message.toLowerCase();
  if (/job|interview|career|unemployed|boss|work|rizq|provision/.test(m)) return 'job-rizq';
  if (/debt|loan|money|broke|bills|afford/.test(m)) return 'money-debt';
  if (/anxiety|panic|anxious|nervous|racing|scared|fear|worry/.test(m)) return 'anxiety';
  if (/grief|passed away|died|loss|mourning|crying|miss them/.test(m)) return 'grief';
  if (/sick|pain|illness|hospital|doctor|surgery|health|disease/.test(m)) return 'illness';
  if (/exam|test|study|school|grades|university|revision/.test(m)) return 'exams';
  if (/marriage|spouse|husband|wife|nikah|getting married/.test(m)) return 'marriage';
  if (/parents|father|mother|brother|sister|family|in-law/.test(m)) return 'family-conflict';
  if (/guilt|sin|regret|tawbah|forgive|ashamed|bad person/.test(m)) return 'guilt-tawbah';
  if (/lonely|alone|isolated|no friends|nobody understands/.test(m)) return 'loneliness';
  if (/angry|furious|frustrated|mad|temper|rage/.test(m)) return 'anger';
  if (/grateful|thankful|blessed|alhamdulillah|gratitude|joy/.test(m)) return 'gratitude';
  if (/patient|hardship|trial|difficult|sabr|struggling/.test(m)) return 'patience';
  return null;
}

export function retrieveTexts(situationSlug: SituationSlug | null, _query: string): LibraryText[] {
  let candidates = LIBRARY_TEXTS.filter(item => item.status === 'reviewed');
  if (situationSlug) {
    candidates = candidates.filter(item => item.situation_slugs.includes(situationSlug));
  }
  if (candidates.length === 0) {
    candidates = LIBRARY_TEXTS.filter(item => item.status === 'reviewed');
  }
  const duas = candidates.filter(item => item.type === 'dua');
  const otherTexts = candidates.filter(item => item.type !== 'dua');
  return [...duas.slice(0, 1), ...otherTexts, ...duas.slice(1)].slice(0, 8);
}

const SALAM_PATTERN = /\b(salam|assalam|salaam|as-salamu\s*alaykum|assalamu\s*alaykum|salam\s*alaykum|salaam\s*alaikum|as-salaam)\b/i;
const CHAT_UNAVAILABLE = "Tasalli can't reply right now, please try again";

export async function executeChatPipeline(
  conversationId: string,
  userMessage: string,
  history: Message[],
  profile: UserProfile,
  activeSituationSlug?: SituationSlug
): Promise<ChatPipelineResponse> {
  const safetyCheck = checkSafety(userMessage);
  if (safetyCheck.risk === 'imminent') {
    return { conversation_id: conversationId, text: '', citations: [], stories: [], hadiths: [], suggestions: [], mode: 'crisis', safetyCheck };
  }
  if (safetyCheck.isFiqh) {
    return { conversation_id: conversationId, text: '', citations: [], stories: [], hadiths: [], suggestions: [], mode: 'refer_scholar', safetyCheck };
  }

  const stage = history.filter(message => message.role === 'user').length === 0 ? 'listen' : 'respond';
  const situation = activeSituationSlug || detectSituation(userMessage);
  const candidates = retrieveTexts(situation, userMessage);
  const stories = retrieveStories(situation, userMessage);
  const requestMessages = [...history, {
    id: 'current-message',
    conversation_id: conversationId,
    role: 'user' as const,
    content: userMessage,
    cited_ids: [],
    created_at: new Date().toISOString()
  }].slice(-12);
  const endpoint = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: requestMessages.map(({ role, content }) => ({ role, content })),
      stage,
      tone: profile.tone,
      situation,
      candidates: candidates.map(({ id, type, usage_note }) => ({ id, type, usage_note })),
      storyCandidates: stories.map(({ id }) => id)
    })
  }).catch(() => {
    throw new Error(CHAT_UNAVAILABLE);
  });

  if (!response.ok) {
    throw new Error(CHAT_UNAVAILABLE);
  }

  const payload: unknown = await response.json().catch(() => {
    throw new Error(CHAT_UNAVAILABLE);
  });
  if (!payload || typeof payload !== 'object' || !('text' in payload) || typeof payload.text !== 'string') {
    throw new Error(CHAT_UNAVAILABLE);
  }
  if ('mode' in payload && payload.mode === 'crisis') {
    return { conversation_id: conversationId, text: '', citations: [], stories: [], hadiths: [], suggestions: [], mode: 'crisis', safetyCheck };
  }
  if ('mode' in payload && payload.mode === 'refer_scholar') {
    return { conversation_id: conversationId, text: '', citations: [], stories: [], hadiths: [], suggestions: [], mode: 'refer_scholar', safetyCheck };
  }
  if ('mode' in payload && payload.mode !== 'normal') {
    throw new Error(CHAT_UNAVAILABLE);
  }

  const responseText = payload.text;
  const hadiths: Hadith[] = 'hadiths' in payload && Array.isArray(payload.hadiths)
    ? payload.hadiths.filter((item): item is Hadith =>
      Boolean(item && typeof item === 'object'
        && 'no' in item && typeof item.no === 'number'
        && 'topic' in item && typeof item.topic === 'string'
        && 'text' in item && typeof item.text === 'string'
        && 'narrator' in item && typeof item.narrator === 'string'
        && 'arabic' in item && typeof item.arabic === 'string'
        && 'reference' in item && typeof item.reference === 'string'
        && 'in_book' in item && typeof item.in_book === 'string'
        && 'grade' in item && typeof item.grade === 'string'
        && 'url' in item && typeof item.url === 'string'
        && /^https:\/\/sunnah\.com\//.test(item.url))
    )
    : [];
  const isGreeting = SALAM_PATTERN.test(userMessage);
  const text = isGreeting && !/^wa alaikum assalam\b/i.test(responseText.trim())
    ? `Wa alaikum assalam. ${responseText.trim()}`
    : responseText;
  const validation = validateReply(
    text,
    candidates.map(item => item.id),
    stage,
    stories.map(story => story.id),
    false,
    hadiths.map(hadith => hadith.no)
  );
  if (!validation.valid || !validation.cleanedText) {
    throw new Error(CHAT_UNAVAILABLE);
  }

  const citations = validation.citedIds.map(id => LIBRARY_MAP.get(id)).filter((item): item is LibraryText => item !== undefined);
  return {
    conversation_id: conversationId,
    text: validation.cleanedText,
    citations,
    stories: validation.storyIds.map(id => stories.find(story => story.id === id)).filter((story): story is Story => story !== undefined),
    hadiths: hadiths.filter(hadith => validation.hadithIds.includes(hadith.no)),
    suggestions: [],
    mode: 'normal',
    safetyCheck
  };
}
