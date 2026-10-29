import storyData from '../data/stories.json';
import { SituationSlug, Story } from '../types';

export const STORIES = storyData as Story[];
export const STORY_MAP = new Map(STORIES.map(story => [story.id, story]));

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'and', 'are', 'because', 'been', 'before', 'being',
  'between', 'but', 'can', 'could', 'does', 'during', 'each', 'feel', 'for', 'from',
  'had', 'has', 'have', 'help', 'how', 'into', 'just', 'like', 'more', 'most', 'much',
  'need', 'not', 'only', 'our', 'over', 'really', 'should', 'some', 'that', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'through', 'time', 'very', 'was',
  'were', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'you', 'your'
]);

function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9']+/g)?.filter(word => word.length > 2 && !STOP_WORDS.has(word)) ?? [];
}

export function retrieveStories(
  situation: SituationSlug | null,
  query: string,
  stories: Story[] = STORIES
): Story[] {
  if (!situation) return [];

  const queryTerms = new Set(tokenize(query));
  return stories
    .filter(story => story.status === 'reviewed' && story.situations.includes(situation))
    .map((story, index) => {
      const searchable = tokenize(`${story.title} ${story.summary} ${story.lesson} ${story.bridge}`);
      const score = searchable.reduce((total, term) => total + (queryTerms.has(term) ? 1 : 0), 0);
      return { story, score, index };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 2)
    .map(({ story }) => story);
}

export const STORY_TOKEN_REGEX = /\[\[story:([a-zA-Z0-9_-]+)\]\]/g;
