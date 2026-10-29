import React, { useState, useEffect, useRef } from 'react';
import { Conversation, LibraryText, Message, SituationSlug, UserProfile } from '../types';
import { SITUATIONS, SITUATIONS_MAP } from '../data/situations';
import { executeChatPipeline } from '../lib/chatPipeline';
import { getStoredConversations, getStoredMessages, saveStoredConversations, saveStoredMessages, saveStoredDuaPlans, getStoredDuaPlans } from '../lib/storage';
import { CitationCard } from '../components/CitationCard';
import { HadithCard } from '../components/HadithCard';
import { StoryCard } from '../components/StoryCard';
import { LIBRARY_MAP } from '../data/library';
import { STORY_MAP } from '../lib/storyRetrieval';

const CHAT_UNAVAILABLE = "Tasalli can't reply right now, please try again";

function splitReplyIntoBubbles(reply: string, maxWords = 60): string[] {
  const words = reply.match(/\S+\s*/g) || [];
  const bubbles: string[] = [];
  for (let offset = 0; offset < words.length; offset += maxWords) {
    bubbles.push(words.slice(offset, offset + maxWords).join('').trim());
  }
  return bubbles.filter(Boolean);
}

function pause(milliseconds: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

interface TalkScreenProps {
  profile: UserProfile;
  initialSituationSlug?: SituationSlug;
  initialText?: string;
  onOpenDetail: (item: LibraryText) => void;
  onOpenCrisis: () => void;
}

export const TalkScreen: React.FC<TalkScreenProps> = ({
  profile,
  initialSituationSlug,
  initialText,
  onOpenDetail,
  onOpenCrisis
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => getStoredConversations());
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState<SituationSlug | undefined>(initialSituationSlug);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = getStoredConversations();
    if (existing.length > 0 && !activeConversation) {
      setActiveConversation(existing[0]);
      setMessages(getStoredMessages(existing[0].id));
    } else if (!activeConversation) {
      startNewConversation(initialSituationSlug);
    }
  }, []);

  useEffect(() => {
    if (initialText && activeConversation && !isLoading) {
      handleSend(initialText);
    }
  }, [initialText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startNewConversation = (situation?: SituationSlug) => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      situation_slug: situation,
      title: situation ? SITUATIONS_MAP.get(situation)?.title || 'Peaceful Sanctuary' : 'A Listening Space',
      created_at: new Date().toISOString(),
      stage: 'listen'
    };

    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveConversation(newConv);
    setSelectedSituation(situation);
    setMessages([]);
    saveStoredConversations(updated);
  };

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || !activeConversation || isLoading) return;

    setInputText('');

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConversation.id,
      role: 'user',
      content,
      cited_ids: [],
      created_at: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveStoredMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await executeChatPipeline(
        activeConversation.id,
        content,
        messages,
        profile,
        selectedSituation
      );

      if (response.mode === 'crisis') {
        onOpenCrisis();
        return;
      }

      if (response.mode === 'refer_scholar') {
        const referral: Message = {
          id: `msg-${Date.now() + 1}`,
          conversation_id: activeConversation.id,
          role: 'assistant',
          content: '',
          cited_ids: [],
          mode: 'refer_scholar',
          created_at: new Date().toISOString()
        };
        const finalMessages = [...newHistory, referral];
        setMessages(finalMessages);
        saveStoredMessages(finalMessages);
        return;
      }
      const segments = splitReplyIntoBubbles(response.text);
      const assistantMessages: Message[] = [];
      for (const [segmentIndex, segment] of segments.entries()) {
        const tokens = segment.match(/\[\[cite:([a-zA-Z0-9_-]+)\]\]/g) || [];
        const citedIds = tokens.map(token => token.slice(7, -2));
        const storyTokens = segment.match(/\[\[story:([a-zA-Z0-9_-]+)\]\]/g) || [];
        const storyIds = storyTokens.map(token => token.slice(8, -2));
        const hadithTokens = segment.match(/\[\[hadith:\d+\]\]/g) || [];
        const hadithIds = hadithTokens.map(token => Number(token.slice(9, -2)));
        const message: Message = {
          id: `msg-${Date.now()}-${segmentIndex}`,
          conversation_id: activeConversation.id,
          role: 'assistant',
          content: '',
          cited_ids: citedIds,
          story_ids: storyIds,
          hadith_ids: hadithIds,
          hadiths: response.hadiths.filter(hadith => hadithIds.includes(hadith.no)),
          mode: 'normal',
          created_at: new Date().toISOString()
        };
        for (const word of segment.match(/\S+\s*/g) || []) {
          message.content += word;
          setMessages([...newHistory, ...assistantMessages, { ...message }]);
          await pause(32);
        }
        assistantMessages.push(message);
        if (segmentIndex < segments.length - 1) await pause(350);
      }
      const finalMessages = [...newHistory, ...assistantMessages];
      setMessages(finalMessages);
      saveStoredMessages(finalMessages);
    } catch {
      const unavailable: Message = {
        id: `msg-${Date.now() + 1}`,
        conversation_id: activeConversation.id,
        role: 'assistant',
        content: CHAT_UNAVAILABLE,
        cited_ids: [],
        mode: 'normal',
        created_at: new Date().toISOString()
      };
      setMessages([...newHistory, unavailable]);
      saveStoredMessages([...newHistory, unavailable]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    if (suggestionText === 'Add to my dua plan') {
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant' && m.cited_ids.length > 0);
      if (lastAssistant && lastAssistant.cited_ids.length > 0) {
        const textId = lastAssistant.cited_ids[0];
        const existingPlans = getStoredDuaPlans();
        const updated = existingPlans.length > 0 ? existingPlans[0] : {
          id: `plan-${Date.now()}`,
          situation_slug: selectedSituation || 'anxiety',
          week_start: new Date().toISOString().split('T')[0],
          active: true,
          items: []
        };
        if (!updated.items.some(i => i.text_id === textId)) {
          updated.items.push({ text_id: textId, times_read: 0 });
          saveStoredDuaPlans([updated]);
        }
        handleSend("I have added that dua to my weekly focus. Thank you.");
        return;
      }
    } else if (suggestionText === 'Talk to someone now' || suggestionText === 'View Emergency Numbers') {
      onOpenCrisis();
      return;
    }

    handleSend(suggestionText);
  };

  const currentSituationObj = selectedSituation ? SITUATIONS_MAP.get(selectedSituation) : null;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface-container-low)',
        overflow: 'hidden'
      }}
    >
      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Always show a useful starting point when a conversation has no messages. */}
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px 4px' }}>
            <p style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 600 }}>
              What is sitting on your chest today?
            </p>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
              Choose a topic, or write in your own words.
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SITUATIONS.slice(0, 6).map(situation => (
                <button
                  key={situation.slug}
                  type="button"
                  aria-pressed={selectedSituation === situation.slug}
                  onClick={() => setSelectedSituation(situation.slug)}
                  style={{
                    backgroundColor: selectedSituation === situation.slug ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                    border: '1px solid var(--dividers)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '7px 13px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--on-surface)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {situation.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const bodyText = msg.content
              .replace(/\[\[cite:[a-zA-Z0-9_\-]+\]\]/g, '')
              .replace(/\[\[story:[a-zA-Z0-9_\-]+\]\]/g, '')
              .replace(/\[\[hadith:\d+\]\]/g, '')
              .trim();

            return (
              <div
                key={msg.id}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxWidth: isUser ? '85%' : '94%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  gap: '4px'
                }}
              >
                {/* Header label */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 4px',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  {!isUser && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: isUser ? 'var(--on-surface-variant)' : 'var(--primary)' }}>
                    {isUser ? 'You' : 'Tasalli Companion'}
                  </span>
                </div>

                {/* Message Bubble */}
                {msg.mode !== 'refer_scholar' && (bodyText || (msg.cited_ids.length === 0 && !msg.story_ids?.length && !msg.hadith_ids?.length)) && <div
                  style={{
                    backgroundColor: isUser ? 'var(--surface-container-lowest)' : 'var(--surface-container-lowest)',
                    color: 'var(--on-surface)',
                    borderRadius: '16px',
                    borderBottomRightRadius: isUser ? '4px' : '16px',
                    borderBottomLeftRadius: isUser ? '16px' : '4px',
                    padding: '14px 16px',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Left primary accent border for companion messages */}
                  {!isUser && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        backgroundColor: 'var(--primary)'
                      }}
                    />
                  )}

                  <p style={{ fontSize: '15px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {bodyText}
                  </p>
                </div>}

                {/* Render Verified Citation Cards directly from Database */}
                {!isUser && msg.cited_ids.length > 0 && (
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    {msg.cited_ids.map(id => {
                      const item = (LIBRARY_MAP as any).get(id);
                      if (!item) return null;
                      return (
                        <CitationCard
                          key={id}
                          item={item}
                          onOpenDetail={onOpenDetail}
                        />
                      );
                    })}
                  </div>
                )}

                {!isUser && msg.story_ids && msg.story_ids.length > 0 && (
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    {msg.story_ids.map(id => {
                      const story = STORY_MAP.get(id);
                      if (!story || story.status !== 'reviewed') return null;
                      return <StoryCard key={id} story={story} />;
                    })}
                  </div>
                )}

                {!isUser && msg.hadiths && msg.hadiths.length > 0 && (
                  <div style={{ width: '100%', marginTop: '6px' }}>
                    {msg.hadiths.map(hadith => (
                      <HadithCard key={hadith.no} hadith={hadith} />
                    ))}
                  </div>
                )}

                {/* Fiqh Boundary Note */}
                {!isUser && msg.mode === 'refer_scholar' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--surface-container)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '4px 12px',
                      fontSize: '11px',
                      color: 'var(--primary)',
                      fontWeight: 500,
                      alignSelf: 'flex-start'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shield</span>
                    <span>Fiqh Boundary: Consult your local imam for official verdicts</span>
                  </div>
                )}

                {/* Ambient Reflection Prompt */}
                {!isUser && idx === messages.length - 1 && (
                  <div
                    style={{
                      backgroundColor: 'rgba(235, 232, 225, 0.6)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: 'var(--on-surface-variant)',
                      marginTop: '4px'
                    }}
                  >
                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--secondary)' }}>flare</span>
                      Take one slow breath before responding
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--primary)', cursor: 'pointer' }}>volume_up</span>
                  </div>
                )}

                {/* Suggestion Chips */}
                {!isUser && idx === messages.length - 1 && msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSuggestionClick(sug)}
                        style={{
                          backgroundColor: 'var(--surface-container)',
                          border: 'none',
                          color: 'var(--primary)',
                          borderRadius: 'var(--radius-pill)',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                          {sug.includes('Dua') ? 'favorite' : sug.includes('listen') ? 'hearing' : 'self_improvement'}
                        </span>
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', padding: '0 4px', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 4px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-fixed-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>spa</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
              Tasalli is reflecting on authentic words of solace...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Contemplative Quiet Input Zone */}
      <div
        style={{
          paddingTop: '8px',
          paddingBottom: 'calc(12px + var(--safe-area-bottom))',
          paddingLeft: 'calc(16px + var(--safe-area-left))',
          paddingRight: 'calc(16px + var(--safe-area-right))',
          backgroundColor: 'rgba(247, 243, 236, 0.95)',
          backdropFilter: 'blur(4px)',
          borderTop: '1px solid var(--dividers)',
          flexShrink: 0
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderRadius: 'var(--radius-card)',
            padding: '6px 10px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px'
          }}
        >
          {/* Text input */}
          <textarea
            placeholder="Pour out your thoughts here peacefully..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--on-surface)',
              lineHeight: '1.5',
              resize: 'none',
              maxHeight: '80px',
              padding: '6px 0'
            }}
          />

          {/* Send button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() && !isLoading ? 'var(--primary)' : 'var(--surface-container-high)',
              color: inputText.trim() && !isLoading ? 'var(--on-primary)' : 'var(--outline-variant)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
              transition: 'all 0.15s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          </button>
        </div>

        {/* Footer reassurance */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', paddingTop: '6px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--on-surface-variant)' }}>
            Safe • Ad-free • Sacred space
          </span>
        </div>
      </div>
    </div>
  );
};
