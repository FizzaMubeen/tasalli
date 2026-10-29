import { afterEach, describe, expect, it } from 'vitest';
import { SituationSlug, Story } from '../src/types';
import { validateReply } from '../src/lib/validator';
import { retrieveStories, STORIES, STORY_MAP } from '../src/lib/storyRetrieval';
import redTeamPrompts from './story-red-team.json';

interface StoryEvalConversation {
  name: string;
  situation: SituationSlug;
  messages: { role: 'user'; content: string }[];
}

const triggerConversations: StoryEvalConversation[] = [
  { name: 'job search feels uncertain', situation: 'job-rizq', messages: [{ role: 'user', content: 'I lost my job and feel uncertain about finding work.' }] },
  { name: 'pressure from bills', situation: 'money-debt', messages: [{ role: 'user', content: 'Debt and bills are weighing on me.' }] },
  { name: 'trapped by worry', situation: 'anxiety', messages: [{ role: 'user', content: 'I feel trapped in anxiety and cannot see a way out.' }] },
  { name: 'mourning a parent', situation: 'grief', messages: [{ role: 'user', content: 'I am grieving my father and miss him.' }] },
  { name: 'long-term illness', situation: 'illness', messages: [{ role: 'user', content: 'My illness has been painful for a long time.' }] },
  { name: 'exam nerves', situation: 'exams', messages: [{ role: 'user', content: 'I am nervous about an exam and need focus.' }] },
  { name: 'marriage reassurance', situation: 'marriage', messages: [{ role: 'user', content: 'I want to feel safe and reassured in my marriage.' }] },
  { name: 'hurt by family', situation: 'family-conflict', messages: [{ role: 'user', content: 'A relative hurt me and I am struggling to forgive.' }] },
  { name: 'ashamed of a mistake', situation: 'guilt-tawbah', messages: [{ role: 'user', content: 'I feel ashamed and want to repent for a mistake.' }] },
  { name: 'alone in a new place', situation: 'loneliness', messages: [{ role: 'user', content: 'I feel alone and left behind in a new place.' }] },
  { name: 'anger after a conflict', situation: 'anger', messages: [{ role: 'user', content: 'I am angry after someone spoke harshly to me.' }] },
  { name: 'wanting gratitude', situation: 'gratitude', messages: [{ role: 'user', content: 'I want to show gratitude for the good in my life.' }] },
  { name: 'patience in a trial', situation: 'patience', messages: [{ role: 'user', content: 'This hardship has lasted a long time and I am struggling.' }] },
  { name: 'interview and provision', situation: 'job-rizq', messages: [{ role: 'user', content: 'I have an interview and worry about provision.' }] },
  { name: 'money for essentials', situation: 'money-debt', messages: [{ role: 'user', content: 'I cannot afford my bills this month.' }] },
  { name: 'fear before an event', situation: 'anxiety', messages: [{ role: 'user', content: 'I am scared of what will happen tomorrow.' }] },
  { name: 'loss and waiting', situation: 'grief', messages: [{ role: 'user', content: 'I lost someone close and have been grieving for months.' }] },
  { name: 'pain and patience', situation: 'illness', messages: [{ role: 'user', content: 'I am living with chronic pain.' }] },
  { name: 'learning feels difficult', situation: 'exams', messages: [{ role: 'user', content: 'I am studying hard but discouraged by how much there is to learn.' }] },
  { name: 'trying to stay patient', situation: 'patience', messages: [{ role: 'user', content: 'I am trying to stay patient through a difficult trial.' }] }
];

const reviewedFixture = STORIES;
const storyFixture = reviewedFixture.find(story => story.id === 'ST-001') as Story;
const originalStory = STORY_MAP.get(storyFixture.id);

afterEach(() => {
  if (originalStory) STORY_MAP.set(storyFixture.id, originalStory);
  else STORY_MAP.delete(storyFixture.id);
});

describe('story retrieval and validation', () => {
  it('imports the story rows as reviewed and retrieves them for Talk', () => {
    expect(STORIES).toHaveLength(28);
    expect(STORIES.every(story => story.status === 'reviewed')).toBe(true);
    expect(retrieveStories('anxiety', 'I feel afraid').length).toBeGreaterThan(0);
    for (const story of STORIES) {
      const sourceText = `${story.title} ${story.summary}`.toLocaleLowerCase();
      expect(story.allowed_names.every(name => sourceText.includes(name.toLocaleLowerCase())), story.id).toBe(true);
    }
  });

  it('retrieves no more than two reviewed stories tagged for the situation', () => {
    expect(retrieveStories('anxiety', 'trapped and afraid', reviewedFixture))
      .toHaveLength(2);
    expect(retrieveStories('anxiety', 'trapped and afraid', reviewedFixture)
      .every(story => story.situations.includes('anxiety'))).toBe(true);
  });

  it('retrieves a story for each of 20 story-trigger conversations', () => {
    for (const conversation of triggerConversations) {
      const retrieved = retrieveStories(
        conversation.situation,
        conversation.messages[0].content,
        reviewedFixture
      );
      expect(retrieved.length, conversation.name).toBeGreaterThan(0);
      expect(retrieved.length, conversation.name).toBeLessThanOrEqual(2);
      expect(retrieved.every(story => story.situations.includes(conversation.situation)), conversation.name).toBe(true);
    }
  });

  it('accepts a reviewed retrieved story with only allowed names', () => {
    STORY_MAP.set(storyFixture.id, storyFixture);
    const result = validateReply(
      'Prophet Yunus called to Allah, and Allah rescued him. [[story:ST-001]]',
      [],
      'respond',
      ['ST-001']
    );
    expect(result.valid).toBe(true);
    expect(result.storyIds).toEqual(['ST-001']);
  });

  it('rejects an unretrieved story', () => {
    STORY_MAP.set(storyFixture.id, storyFixture);
    expect(validateReply('A story. [[story:ST-001]]', [], 'respond', []).valid).toBe(false);
  });

  it('rejects unreviewed, multiple, listen-stage and crisis stories', () => {
    STORY_MAP.set(storyFixture.id, STORIES.find(story => story.id === 'ST-001')!);
    expect(validateReply('Story [[story:ST-001]]', [], 'respond', ['ST-001']).valid).toBe(false);
    STORY_MAP.set(storyFixture.id, storyFixture);
    expect(validateReply('One [[story:ST-001]] two [[story:ST-001]]', [], 'respond', ['ST-001']).valid).toBe(false);
    expect(validateReply('Story [[story:ST-001]]', [], 'listen', ['ST-001']).valid).toBe(false);
    expect(validateReply('Story [[story:ST-001]]', [], 'respond', ['ST-001'], true).valid).toBe(false);
  });

  it('rejects story names absent from the story allow-list', () => {
    STORY_MAP.set(storyFixture.id, storyFixture);
    const result = validateReply(
      'Prophet Yunus met Zulaikha. [[story:ST-001]]',
      [],
      'respond',
      ['ST-001']
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Zulaikha');
  });

  it('blocks invented story citations for all 20 red-team prompts', () => {
    expect(redTeamPrompts).toHaveLength(20);
    for (const prompt of redTeamPrompts) {
      const safeReply = 'I do not have a reviewed source for that story, so I will not improvise one.';
      const safeResult = validateReply(safeReply, [], 'respond', []);
      const inventedResult = validateReply(`${safeReply} [[story:UNSOURCED]]`, [], 'respond', []);
      expect(safeResult.valid, prompt).toBe(true);
      expect(safeResult.storyIds, prompt).toEqual([]);
      expect(inventedResult.valid, prompt).toBe(false);
    }
  });
});
