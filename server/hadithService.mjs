import { readFile } from 'node:fs/promises';

const HADITH_DATA_URL = new URL('../AI Model/hadith-500-tasalli.json', import.meta.url);
const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'am', 'and', 'are', 'because', 'been', 'before', 'being',
  'but', 'can', 'could', 'did', 'does', 'doing', 'for', 'from', 'had', 'has', 'have', 'how',
  'into', 'its', 'just', 'like', 'may', 'more', 'most', 'much', 'must', 'our', 'please',
  'should', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'too', 'very', 'was', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'will', 'with', 'would', 'you', 'your'
]);

function tokenize(value) {
  return (String(value).toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter(term => term.length > 2 && !STOP_WORDS.has(term));
}

const TOPIC_HINTS = new Map([
  ['Patience in trials & hardship', ['hardship', 'trial', 'trials', 'struggling', 'patience', 'patient', 'sabr']],
  ['Illness & pain', ['illness', 'sick', 'pain', 'health', 'hospital', 'doctor', 'treatment']],
  ['Grief, loss & death of loved ones', ['grief', 'grieving', 'loss', 'died', 'death', 'mourning', 'miss']],
  ['Worry, anxiety & distress', ['worry', 'anxiety', 'anxious', 'panic', 'fear', 'distress', 'scared', 'nervous']],
  ["Hope in Allah's mercy", ['hope', 'mercy', 'despair']],
  ['Repentance & forgiveness of sins', ['repent', 'repentance', 'forgive', 'forgiveness', 'guilt', 'sin', 'sins']],
  ['Trust in Allah & destiny', ['trust', 'destiny', 'uncertain', 'control', 'tawakkul']],
  ['Duas for difficult times', ['dua', 'supplication', 'prayer', 'difficult', 'hard']],
  ['Remembrance of Allah & peace of heart', ['remembrance', 'peace', 'heart', 'calm', 'dhikr']],
  ['Gratitude', ['gratitude', 'grateful', 'thankful', 'blessed']],
  ['Provision, poverty & contentment', ['provision', 'poverty', 'poor', 'rizq', 'contentment']],
  ['Debt & financial worries', ['debt', 'loan', 'bills', 'money', 'financial', 'afford']],
  ['Work, earning & effort', ['work', 'job', 'career', 'earning', 'effort', 'unemployed', 'interview']],
  ['Ease, moderation & small deeds', ['ease', 'moderation', 'routine', 'overwhelmed', 'small']],
  ['Anger & self-control', ['anger', 'angry', 'furious', 'temper', 'frustrated', 'self-control']],
  ['Speech, honesty & the tongue', ['honesty', 'honest', 'truth', 'lying', 'speech', 'words']],
  ['Good character & manners', ['character', 'manners', 'kind', 'kindness', 'gentle']],
  ['Kindness, gentleness & mercy to others', ['kindness', 'gentleness', 'compassion', 'mercy', 'care']],
  ['Envy, hatred & resentment', ['envy', 'jealous', 'hatred', 'resentment', 'resentful']],
  ['Brotherhood & friendship', ['friend', 'friends', 'friendship', 'lonely', 'loneliness', 'alone']],
  ['Neighbours & guests', ['neighbour', 'neighbor', 'guest']],
  ['Parents', ['parent', 'parents', 'mother', 'father']],
  ['Marriage & spouse', ['marriage', 'married', 'spouse', 'husband', 'wife']],
  ['Children & family ties', ['child', 'children', 'family', 'siblings', 'relatives']],
  ['Charity & helping others', ['charity', 'helping', 'give', 'giving', 'charitable']],
  ['Daily routine: sleep, food & morning', ['sleep', 'food', 'morning', 'routine', 'rest']],
  ['This world & the hereafter', ['hereafter', 'afterlife', 'world', 'death', 'akhirah']]
]);

function createService(entries) {
  const topics = [...new Set(entries.map(entry => entry.topic))];

  function getByTopic(topic) {
    const normalizedTopic = String(topic).trim().toLocaleLowerCase();
    return entries.filter(entry => entry.topic.toLocaleLowerCase() === normalizedTopic);
  }

  function search(query, limit = 5) {
    const terms = new Set(tokenize(query));
    const resultLimit = Math.max(3, Math.min(5, Math.floor(limit)));
    if (terms.size === 0) return [];

    return entries
      .map((entry, index) => {
        const topicTerms = tokenize(entry.topic);
        const textTerms = tokenize(entry.text);
        const topicScore = topicTerms.reduce((score, term) => score + (terms.has(term) ? 3 : 0), 0);
        const textScore = textTerms.reduce((score, term) => score + (terms.has(term) ? 1 : 0), 0);
        return { entry, index, score: topicScore + textScore };
      })
      .filter(result => result.score > 0)
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .slice(0, resultLimit)
      .map(result => result.entry);
  }

  function detectTopics(query) {
    const terms = new Set(tokenize(query));
    return topics
      .map(topic => {
        const hints = TOPIC_HINTS.get(topic) ?? [];
        const topicTerms = tokenize(topic);
        const score = hints.reduce((total, hint) => total + (terms.has(hint) ? 3 : 0), 0)
          + topicTerms.reduce((total, term) => total + (terms.has(term) ? 1 : 0), 0);
        return { topic, score };
      })
      .filter(result => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .map(result => result.topic);
  }

  function getRelevant(query, limit = 3) {
    const detectedTopics = detectTopics(query);
    const terms = new Set(tokenize(query));
    const rankedForQuery = candidates => candidates
      .map((entry, index) => {
        const score = tokenize(entry.text).reduce((total, term) => total + (terms.has(term) ? 1 : 0), 0);
        return { entry, index, score };
      })
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .map(result => result.entry);
    if (detectedTopics.length === 0) return search(query, 5).slice(0, limit);

    const topicEntries = detectedTopics.flatMap(topic => getByTopic(topic));
    const topicResults = rankedForQuery(topicEntries);
    if (topicResults.length >= limit) return topicResults.slice(0, limit);

    const topicIds = new Set(topicResults.map(entry => entry.no));
    const fallback = search(query, 5).filter(entry => !topicIds.has(entry.no));
    return [...topicResults, ...fallback].slice(0, limit);
  }

  function getRandom(topic) {
    const candidates = topic ? getByTopic(topic) : entries;
    if (candidates.length === 0) return undefined;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  return { getByTopic, search, getRandom, getRelevant, detectTopics };
}

export async function loadHadithService(path = HADITH_DATA_URL) {
  const raw = await readFile(path, 'utf8');
  const entries = JSON.parse(raw.replace(/^\uFEFF/, ''));
  if (!Array.isArray(entries) || entries.some(entry =>
    !Number.isInteger(entry.no) || typeof entry.topic !== 'string' || typeof entry.text !== 'string'
      || typeof entry.narrator !== 'string' || typeof entry.reference !== 'string'
      || typeof entry.url !== 'string'
  )) {
    throw new TypeError('Hadith data has an invalid entry structure.');
  }
  return createService(entries);
}

export const hadithService = await loadHadithService();
export const { getByTopic, search, getRandom } = hadithService;
