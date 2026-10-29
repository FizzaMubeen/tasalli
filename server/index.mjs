import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { hadithService } from './hadithService.mjs';

const prompt = await readFile(new URL('../prompts/system-v0.2.txt', import.meta.url), 'utf8');
const storiesText = await readFile(new URL('../src/data/stories.json', import.meta.url), 'utf8');
const storyCatalog = JSON.parse(storiesText.replace(/^\uFEFF/, ''));
const storyMap = new Map(storyCatalog.map(story => [story.id, story]));
const SITUATION_SLUGS = new Set([
  'job-rizq', 'money-debt', 'anxiety', 'grief', 'illness', 'exams', 'marriage',
  'family-conflict', 'guilt-tawbah', 'loneliness', 'anger', 'gratitude', 'patience'
]);
const MAX_BODY_BYTES = 64 * 1024;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestCounts = new Map();
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,https://localhost,capacitor://localhost')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
);

const IMMINENT_PATTERNS = [
  /\b(kill\s*(myself|me))\b/i,
  /\b(want\s+to\s+die)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\b(end\s+my\s+life)\b/i,
  /\b(want\s+to\s+end\s+it)\b/i,
  /\b(end\s+it\s+all)\b/i,
  /\b(don'?t\s+want\s+to\s+live(\s+anymore)?)\b/i,
  /\b(don'?t\s+want\s+to\s+(be\s+here|exist))\b/i,
  /\b(better\s+off\s+dead)\b/i,
  /\b(wish\s+i\s+(were|was)\s+dead)\b/i,
  /\b(not\s+wanting\s+to\s+live)\b/i,
  /\b(can'?t\s+go\s+on\s+living)\b/i,
  /\b(can'?t\s+keep\s+living)\b/i,
  /\b(hurt\s*myself|self\s*harm|cutting\s*myself)\b/i,
  /\b(overdose|take\s+all\s+my\s+pills)\b/i,
  /\b(no\s+point\s+in\s+living)\b/i,
  /\b(no\s+reason\s+to\s+live)\b/i,
  /\b(i\s+want\s+to\s+disappear\s+forever)\b/i,
  /\b(mar\s*jana\s*chahta|mar\s*jana\s*chahti)\b/i,
  /\b(zindagi\s*khatam\s*(karna|karni)?)\b/i,
  /\b(khudkushi|khud\s*kushi)\b/i,
  /\b(jeena\s*nahi\s*chahta|jeena\s*nahi\s*chahti)\b/i,
  /\b(apne\s*aap\s*ko\s*khatam)\b/i,
  /\b(mujhe\s+marna\s+hai)\b/i,
  /\b(ab\s+nahi\s+jeena)\b/i,
  /\b(khatam\s*karna\s*(chahta|chahti))\b/i,
  /\b(zindagi\s+se\s+tang\s+aa\s+gaya)\b/i
];
const ELEVATED_PATTERNS = [
  /\b(hopeless|no\s+hope\s+left)\b/i,
  /\b(can'?t\s+take\s+this\s+pain\s+anymore)\b/i,
  /\b(drowning\s+in\s+sadness)\b/i,
  /\b(so\s+alone\s+and\s+scared)\b/i,
  /\b(everything\s+is\s+ruined)\b/i,
  /\b(nobody\s+cares\s+if\s+i\s+exist)\b/i,
  /\b(giving\s+up\s+on\s+life)\b/i,
  /\b(sab\s*khatam\s*ho\s*gaya)\b/i,
  /\b(bardasht\s*nahi\s*hota)\b/i
];
const FIQH_PATTERNS = [
  /\b(is\s+it\s+halal\s+or\s+haram|is\s+this\s+haram|is\s+this\s+halal|fatwa|ruling\s+on|sharia\s+ruling)\b/i,
  /\b(talaq|talaaq|divorce\s+procedure|did\s+divorce\s+happen|calculate\s+my\s+zakat|zakat\s+percentage|inheritance\s+share|miras)\b/i,
  /\b(does\s+this\s+break\s+my\s+wudu|does\s+this\s+invalidate\s+fast)\b/i
];

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestCounts.get(ip) || []).filter(timestamp => now - timestamp < WINDOW_MS);
  recent.push(now);
  requestCounts.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new RangeError('Request body is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1) return null;
  const recent = messages.slice(-12);
  if (recent.some(message =>
    !message || !['user', 'assistant'].includes(message.role)
    || typeof message.content !== 'string' || message.content.length > 4000
  )) return null;
  if (recent.at(-1)?.role !== 'user') return null;
  return recent;
}

function safetyResult(message) {
  if (IMMINENT_PATTERNS.some(pattern => pattern.test(message))) return 'crisis';
  if (FIQH_PATTERNS.some(pattern => pattern.test(message))) return 'refer_scholar';
  if (ELEVATED_PATTERNS.some(pattern => pattern.test(message))) return 'elevated';
  return 'normal';
}

function isStoryRequest(message) {
  return /\b(story|tale|narrative|account)\b/i.test(message)
    && /\b(tell|share|give|make\s+up|invent|retell|what|can\s+you|could\s+you|do\s+you\s+know)\b/i.test(message);
}

function escapeXml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

const NON_NAME_CAPITALIZED_WORDS = new Set([
  'A', 'About', 'After', 'Again', 'All', 'Although', 'And', 'As', 'At', 'Before', 'Because',
  'But', 'By', 'Can', 'Each', 'Even', 'For', 'From', 'He', 'Her', 'Here', 'His', 'How', 'I',
  'If', 'In', 'It', 'Its', 'Later', 'May', 'Maybe', 'Most', 'My', 'No', 'Not', 'Now', 'Of',
  'On', 'Once', 'One', 'Or', 'Our', 'She', 'Since', 'So', 'Some', 'Soon', 'That', 'The',
  'Their', 'Then', 'There', 'They', 'This', 'Those', 'Though', 'Through', 'To', 'Today',
  'Two', 'We', 'What', 'When', 'Where', 'While', 'Who', 'With', 'You', 'Your', 'Prophet'
]);

function findUnallowedNames(text, allowedNames) {
  const allowed = new Set(allowedNames.flatMap(name => name.match(/[\p{L}]+(?:['’][\p{L}]+)?/gu) || [])
    .map(name => name.toLocaleLowerCase()));
  const capitalizedWords = text.match(/\b[\p{Lu}][\p{L}]*(?:['’][\p{L}]+)?\b/gu) || [];
  return [...new Set(capitalizedWords.filter(name =>
    !NON_NAME_CAPITALIZED_WORDS.has(name) && !allowed.has(name.toLocaleLowerCase())
  ))];
}

function renderStories(stories) {
  const entries = stories.map(story => [
    `<story id="${escapeXml(story.id)}" title="${escapeXml(story.title)}" sources="${escapeXml(story.sources)}" grade="${escapeXml(story.grade)}">`,
    `<summary>${escapeXml(story.summary)}</summary>`,
    `<lesson>${escapeXml(story.lesson)}</lesson>`,
    `<bridge>${escapeXml(story.bridge)}</bridge>`,
    `<do_not_add>${escapeXml(story.do_not_add)}</do_not_add>`,
    `<allowed_names>${story.allowed_names.map(escapeXml).join(', ')}</allowed_names>`,
    '</story>'
  ].join('\n')).join('\n');
  return `<stories>\n${entries}\n</stories>`;
}

function renderHadiths(hadiths) {
  const entries = hadiths.map(hadith => [
    `<hadith id="${hadith.no}" topic="${escapeXml(hadith.topic)}" narrator="${escapeXml(hadith.narrator)}" reference="${escapeXml(hadith.reference)}" grade="${escapeXml(hadith.grade)}" url="${escapeXml(hadith.url)}">`,
    `<text>${escapeXml(hadith.text)}</text>`,
    '</hadith>'
  ].join('\n')).join('\n');
  return `<hadiths>\n${entries}\n</hadiths>`;
}

export function createChatServer({ fetchImpl = fetch } = {}) {
  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      sendJson(response, 403, { error: 'Origin is not allowed.' });
      return;
    }
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
      response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method !== 'POST' || request.url !== '/api/chat') {
      sendJson(response, 404, { error: 'Not found.' });
      return;
    }
    if (isRateLimited(request.socket.remoteAddress || 'unknown')) {
      sendJson(response, 429, { error: 'Too many requests.' });
      return;
    }

    try {
      const input = await readJson(request);
      const messages = validateMessages(input?.messages);
      if (!messages || !['listen', 'respond'].includes(input.stage)
          || !['gentle', 'balanced', 'firm'].includes(input.tone)
          || !Array.isArray(input.candidates)
          || (input.situation !== null && input.situation !== undefined && !SITUATION_SLUGS.has(input.situation))) {
        sendJson(response, 400, { error: 'Invalid chat request.' });
        return;
      }

      const lastUserMessage = messages.at(-1).content;
      const safetyMode = safetyResult(lastUserMessage);
      if (safetyMode === 'crisis' || safetyMode === 'refer_scholar') {
        sendJson(response, 200, { text: '', citations: [], hadiths: [], mode: safetyMode });
        return;
      }

      const retrievedHadiths = hadithService.getRelevant(lastUserMessage, 3);
      const candidates = input.candidates
        .filter(candidate => candidate && typeof candidate.id === 'string' && /^[a-zA-Z0-9_-]+$/.test(candidate.id))
        .slice(0, 8);
      const stage = messages.slice(0, -1).some(message => message.role === 'user') ? 'respond' : 'listen';
      const storyCandidateIds = input.storyCandidates ?? [];
      if (!Array.isArray(storyCandidateIds) || storyCandidateIds.length > 2
          || new Set(storyCandidateIds).size !== storyCandidateIds.length
          || storyCandidateIds.some(id => {
            const story = storyMap.get(id);
            return typeof id !== 'string' || !story || story.status !== 'reviewed'
              || !SITUATION_SLUGS.has(input.situation) || !story.situations.includes(input.situation);
          })) {
        sendJson(response, 400, { error: 'Invalid story candidates.' });
        return;
      }
      const stories = storyCandidateIds.map(id => storyMap.get(id));
      if (stories.length === 0 && isStoryRequest(lastUserMessage)) {
        const text = stage === 'listen'
          ? "I don't have a reviewed source for that story, so I won't improvise one. What drew you to it?"
          : "I don't have a reviewed source for that story, so I won't improvise one. Would you like to share what you were hoping to explore?";
        sendJson(response, 200, { text, citations: [], hadiths: [], mode: 'normal' });
        return;
      }
      const baseUrl = process.env.LLM_API_BASE_URL;
      const model = process.env.LLM_MODEL;
      if (!baseUrl || !model) {
        sendJson(response, 503, { error: 'Model endpoint is not configured.' });
        return;
      }
      const systemMessage = [
        prompt,
        `\n\nConversation stage: ${stage}. Companion tone: ${input.tone}.`,
        ...(safetyMode === 'elevated'
          ? [' The user expressed elevated distress; respond with care, avoid minimizing their feelings, and encourage reaching out to trusted support if appropriate.']
          : []),
        `Allowed reviewed library IDs for this turn: ${candidates.map(candidate => candidate.id).join(', ') || 'none'}.`,
        `If citing, return no more than ${stage === 'listen' ? 0 : 2} IDs from that list.`,
        '\n\nRetrieved story context:\n',
        renderStories(stories),
        `\nAllowed story IDs for this turn: ${stories.map(story => story.id).join(', ') || 'none'}.`,
        '\n\nRetrieved hadith context:\n',
        renderHadiths(retrievedHadiths),
        `\nAllowed hadith IDs for this turn: ${retrievedHadiths.map(hadith => hadith.no).join(', ') || 'none'}.`
      ].join('');
      const headers = { 'Content-Type': 'application/json' };
      if (process.env.LLM_API_KEY) headers.Authorization = `Bearer ${process.env.LLM_API_KEY}`;
      const upstream = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          temperature: 0.5,
          messages: [
            { role: 'system', content: systemMessage },
            ...messages.map(({ role, content }) => ({ role, content }))
          ]
        }),
        signal: AbortSignal.timeout(45_000)
      });
      if (!upstream.ok) {
        console.error(`Model endpoint returned HTTP ${upstream.status}.`);
        sendJson(response, 502, { error: 'Model endpoint failed.' });
        return;
      }

      const modelResult = await upstream.json();
      const content = modelResult?.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw new Error('Model returned no text content.');
      const parsed = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, ''));
      if (typeof parsed.reply !== 'string' || !Array.isArray(parsed.citations)) {
        throw new Error('Model returned an invalid reply structure.');
      }
      const allowedIds = new Set(candidates.map(candidate => candidate.id));
      const citationIds = parsed.citations;
      if (citationIds.length > (stage === 'listen' ? 0 : 2)
          || citationIds.some(id => typeof id !== 'string' || !allowedIds.has(id))) {
        throw new Error('Model cited an unavailable library entry.');
      }
      const storyIds = [...parsed.reply.matchAll(/\[\[story:([a-zA-Z0-9_-]+)\]\]/g)].map(match => match[1]);
      if (storyIds.length > 1 || (storyIds.length > 0 && stage === 'listen')
          || storyIds.some(id => !stories.some(story => story.id === id))) {
        throw new Error('Model cited an unavailable story.');
      }
      if (storyIds.length === 1) {
        const story = storyMap.get(storyIds[0]);
        const storyBody = parsed.reply.replace(/\[\[story:[a-zA-Z0-9_-]+\]\]/g, ' ');
        const unallowedNames = findUnallowedNames(storyBody, story.allowed_names);
        if (unallowedNames.length > 0) {
          throw new Error(`Model used unallowed story names: ${unallowedNames.join(', ')}.`);
        }
      }
      const hadithIds = [...parsed.reply.matchAll(/\[\[hadith:(\d+)\]\]/g)].map(match => Number(match[1]));
      if (hadithIds.length > 3 || (hadithIds.length > 0 && stage === 'listen')
          || hadithIds.some(id => !retrievedHadiths.some(hadith => hadith.no === id))) {
        throw new Error('Model cited an unavailable hadith.');
      }
      const replyWithoutTokens = parsed.reply
        .replace(/\[\[story:[a-zA-Z0-9_-]+\]\]/g, ' ')
        .replace(/\[\[hadith:\d+\]\]/g, ' ')
        .replace(/\[\[cite:[a-zA-Z0-9_-]+\]\]/g, ' ');
      if (/["“][^"”]{12,}["”]/u.test(replyWithoutTokens)) {
        throw new Error('Model returned a free-text quotation instead of a verified card.');
      }
      const normalizedReply = replyWithoutTokens.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
      if (retrievedHadiths.some(hadith => hadith.text.length >= 80
        && normalizedReply.includes(hadith.text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')))) {
        throw new Error('Model copied hadith text into the reply instead of using a verified card.');
      }
      const tokens = citationIds.map(id => `[[cite:${id}]]`).join('\n');
      const text = [parsed.reply.trim(), tokens].filter(Boolean).join('\n\n');
      const usedHadiths = retrievedHadiths.filter(hadith => hadithIds.includes(hadith.no));
      sendJson(response, 200, { text, citations: citationIds, hadiths: usedHadiths, mode: 'normal' });
    } catch (error) {
      if (error instanceof RangeError) {
        sendJson(response, 413, { error: 'Request body is too large.' });
        return;
      }
      console.error('Chat endpoint request failed:', error instanceof Error ? error.message : 'Unknown error.');
      sendJson(response, 502, { error: 'Chat endpoint is unavailable.' });
    }
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT || 3001);
  createChatServer().listen(port, '0.0.0.0', () => {
    console.log(`Tasalli chat API listening on port ${port}`);
  });
}
