# Tasalli — Phase 1 UI Guide for Stitch

Oct 25, 2026 · @Akosita

## How to use this guide in Stitch

Generate one screen per prompt, and start every prompt with the master style block below so all screens share the same look. The app has **4 tabs (Today, Talk, Duas, You)** and **18 Phase 1 screens**. Build them in the order listed in sections 6–8.

1. Paste the master style prompt, then the screen prompt, as one message.
2. Choose **Mobile** as the device, 390 × 844.
3. Generate a light version first. When the set is approved, ask Stitch for dark versions ("same screen, dark theme using the dark tokens").
4. Placeholder Arabic and translations are fine in mockups. Final sacred text always comes from the app's verified library, never from design files.
5. Export to Figma when a screen is approved, and name frames with the screen IDs used here (e.g. `T1 Today`).

### Master style prompt (paste first, every time)

```text
App: Tasalli, a calm Muslim companion app (iOS and Android, 390x844).
Mood: peaceful, warm, merciful, trustworthy. Like a quiet masjid
courtyard at Fajr, not a social app. Generous white space, soft rounded
cards (16px radius), gentle shadows only on floating elements.
Colours: background warm ivory #F7F3EC, surface white #FFFFFF,
primary deep teal #1F5C55, primary-soft #E3EEEC, accent muted gold
#B8913A (use sparingly for highlights), text ink #1E2A28, secondary
text #5F6E6B, dividers #E6E0D6. No bright red anywhere.
Type: Inter for English (titles 24/semibold, body 16/regular, captions
13). Arabic in Amiri or Noto Naskh Arabic, right-aligned, larger
(22-26px) with generous line height (1.9).
Icons: thin outline icons (Lucide style), 24px. A subtle geometric
Islamic star pattern may appear very faintly in headers only.
Bottom tab bar with 4 tabs: Today (sun icon), Talk (chat bubble,
primary), Duas (open hands / book icon), You (person icon).
No photos of people, no faces, no music notes, no ads.
```

## Design principles

Every screen should feel like a kind friend who knows the deen, not a productivity app or a preacher.

1. **Calm first.** One main action per screen. Soft colours, lots of space, slow gentle motion (200–300 ms fades, no bouncing).
2. **Listen before advising.** The Talk screen opens with an open, warm question, not a menu of topics.
3. **Trust is visible.** Every Qur'an verse, hadith or dua appears as a citation card showing its source, reference and grade. Users should feel they can check anything.
4. **Mercy, never guilt.** No red badges, no broken streaks, no "you missed" language. "Not today" is a valid, respected answer.
5. **Help is always one tap away.** A quiet "Need to talk to someone now?" link lives in Talk and You.
6. **Arabic is honoured.** Arabic text is large, right-aligned, never cramped, never decorative-only, and always paired with translation and audio.
7. **For all Muslims.** Neutral, non-sectarian visuals. No specific mosque silhouettes, flags or group symbols.

## Visual style

The palette is deep teal (trust, calm) on warm ivory, with muted gold used only for small highlights such as the active dua or a completed check-in.

### Colour tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| background | #F7F3EC | #0F1A19 | Screen background |
| surface | #FFFFFF | #172422 | Cards, sheets, chat bubbles from Tasalli |
| primary | #1F5C55 | #6FB3A8 | Buttons, active tab, links |
| primary-soft | #E3EEEC | #1E3330 | User chat bubble, selected chips |
| accent-gold | #B8913A | #D4B26A | Small highlights, completed states, ﷺ glyph |
| text | #1E2A28 | #EDEAE3 | Main text |
| text-secondary | #5F6E6B | #A3B0AD | Captions, references, timestamps |
| divider | #E6E0D6 | #2A3836 | Lines and card borders |
| support-blue | #2F5D8A | #8DB4DA | Crisis and support screens (calm, not alarming) |

Grade badge colours: Sahih uses primary on primary-soft; Hasan uses accent-gold on a light gold tint (#F4ECD9). Qur'an verses show "Qur'an" instead of a grade.

### Typography

| Style | Font | Size / line height | Weight |
| --- | --- | --- | --- |
| Display (screen titles) | Inter | 28 / 34 | Semibold |
| Title | Inter | 20 / 26 | Semibold |
| Body | Inter | 16 / 24 | Regular |
| Caption, references | Inter | 13 / 18 | Regular |
| Arabic (cards) | Amiri or Noto Naskh Arabic | 24 / 46 | Regular |
| Arabic (full screen, adhkar) | Amiri or Noto Naskh Arabic | 30 / 56 | Regular |
| Transliteration | Inter Italic | 15 / 22 | Regular |

### Spacing, shape and motion

- 8-point grid. Screen side padding 20. Space between cards 12.
- Corner radius: cards 16, buttons 14 (full-width, 52 tall), chips 999.
- Tap targets at least 44 × 44.
- Motion: fade and slide 8px, 250 ms, ease-out. Typing indicator: three soft dots.

### Iconography and decoration

- Lucide-style outline icons, 1.75 stroke.
- A faint 8-point star geometric pattern (5% opacity) may sit behind the Today header and the onboarding welcome only.
- App icon idea: a simple crescent-and-light motif or the Arabic word تسلّی in a soft teal tile. No mosque silhouettes.

## Navigation map

&#91;embedded content: Navigation map · 18 screens, 4 tabs\]

Onboarding runs once and lands the user in Talk. After that, every screen sits at most one tap below a tab; the citation sheet and crisis sheet open on top of whatever screen the user is on.

## Core components

Design these five components first; nearly every screen is built from them. In Stitch, generate them together on one "component sheet" screen.

### C1 Citation card (the most important component)

Shows one verse, hadith or dua inside a chat reply or a list.

- Top row: type label ("Dua", "Hadith", "Qur'an") on the left; grade badge ("Sahih") on the right.
- Arabic text, right-aligned, 24px, up to 3 lines then fades with "Read more".
- Transliteration (duas only), italic, 15px.
- Translation, 16px.
- Footer: reference in caption style ("Sahih al-Bukhari 6369"), a play button for audio, and a bookmark / "Add to dua plan" icon.
- The whole card is tappable and opens D1 Citation detail.
- Inside chat it sits full-width under Tasalli's bubble, with a thin primary left border to show it is verified.

### C2 Chat bubbles

- Tasalli: left-aligned, surface colour, small teal crescent avatar, max width 85%.
- User: right-aligned, primary-soft colour, no avatar.
- Suggestion chips under Tasalli's last message (e.g. "Add to my dua plan", "Remind me in 3 days").
- Typing indicator: three soft dots in a Tasalli bubble.

### C3 Check-in card

Used on Today and as the expanded notification. Example: "Asr time. Have you managed to pray?" with three equal buttons: **Prayed** (primary), **Will do now** (outline), **Not today** (text). After answering, it shows a warm one-line response and collapses.

### C4 Support banner and crisis sheet

- Banner: a quiet support-blue line with a heart-hand icon, "Need to talk to someone now?" Appears at the bottom of Talk and in You.
- Sheet: full-height, support-blue header, a short caring message, large tappable helpline rows (name, number, hours, call button), the local emergency number, and "Message someone you trust". No verses or duas on this sheet.

### C5 Situation tile

A rounded tile with a simple outline icon and a label (e.g. "Job & rizq", "Grief", "Anxiety"). Shown in a 2-column grid on Duas and as horizontal chips on Talk's empty state.

## Onboarding screens (O1–O5)

Onboarding takes under a minute, uses a 4-dot progress indicator on O2–O5, and asks for nothing that is not needed. Every reminder starts off.

### O1 Welcome

```text
[Master style] Screen O1 Welcome. Full-screen warm ivory background with a
very faint geometric star pattern at the top. Centered: the app name
"Tasalli" in Inter semibold 32, and below it the Arabic word تسلّی in
Amiri 40 in deep teal. A one-line tagline: "A gentle companion for heavy
days, grounded in the Qur'an and Sunnah." At the bottom: a full-width
primary button "Get started" and a text link "I already have an account".
```

### O2 What Tasalli is (and isn't)

```text
[Master style] Screen O2. Title "Before we begin". Three soft cards
stacked vertically, each with an outline icon:
1) Heart icon: "I listen first, then share what Allah and His
Messenger said."
2) Check-badge icon: "Every verse and hadith is real and checkable,
with its source and grade."
3) Hand icon: "I'm not a scholar, a therapist or an emergency service.
For rulings, ask a qualified scholar. In a crisis, I'll help you reach
people who can help."
Primary button "I understand". Progress dots 1 of 4.
```

### O3 Privacy and consent

```text
[Master style] Screen O3 Privacy. Title "Your trust matters". Short
intro: "Your conversations about faith and feelings are sensitive. You
decide what is kept." Three toggle rows in a card, all OFF by default:
- "Allow Tasalli to process my conversations (needed to chat)"
- "Let the team review my conversations to improve quality (optional)"
- "Share anonymous usage stats (optional)"
A small lock icon line: "Prayer and dua logs stay on your phone. No ads,
ever." Text link "Read the privacy policy". Primary button "Continue",
disabled until the first toggle is on. Progress dots 2 of 4.
```

### O4 Make it yours

```text
[Master style] Screen O4. Title "What should I call you?" Text field
"Your name (optional)". Below, a country picker labelled "Your country
(so I can show the right helplines)". Then a segmented control "How
should I remind you?" with three options: Gentle (selected), Balanced,
Firm, and one caption line explaining Gentle. Primary button "Continue".
Progress dots 3 of 4.
```

### O5 Reminders (opt-in)

```text
[Master style] Screen O5. Title "Would you like gentle reminders?"
Subtitle: "All optional. Change them any time." A list of rows with
switches, all OFF: "Prayer check-ins" (with a small row of 5 prayer
chips Fajr Dhuhr Asr Maghrib Isha), "Morning adhkar", "Evening adhkar",
"Follow-ups after we talk". If prayer is on, show a small line "Uses
your location on your phone only". Primary button "Start talking",
secondary text button "Skip for now". Progress dots 4 of 4.
```

Sign-in is optional at this point: the user starts anonymously, and You offers "Save my account" (email link, Apple, Google) later. "I already have an account" opens a simple sign-in sheet over O1.

## Main tab screens (T1–T4)

The tab bar is always visible on these four screens. Talk is the heart of the app, so its tab icon is slightly larger and filled in primary teal.

### T1 Today

```text
[Master style] Screen T1 Today (tab 1 active). Header with a faint
geometric pattern: greeting "Assalamu alaikum, Ahmed" and the Hijri and
Gregorian date in caption style. Below, a "Next prayer" card: "Asr in
42 min, 15:12" with a small row of 5 prayer dots showing today's
check-ins (filled gold = prayed, outline = not yet; no red). Then a
check-in card ("Dhuhr time. Have you managed to pray?" with Prayed /
Will do now / Not today). Then "This week's duas" card showing 1 dua
from the plan with Arabic, translation, play button and an "I read it"
button with a soft count "Read 4 times". Then a "Morning adhkar" card
with a play icon. Then a follow-up card from Tasalli: "How did the
interview go?" with a button "Tell Tasalli". Bottom tab bar.
```

### T2 Talk (chat)

```text
[Master style] Screen T2 Talk (tab 2 active). Top bar: small teal
crescent avatar, "Tasalli", and a history icon on the right. Chat:
user bubble "Assalam o Alaikum, I'm worried about my job. What should I
do?". Tasalli bubble: "Wa alaikum assalam. I'm sorry you're carrying
this worry. Have you lost the job, or are you afraid of losing it?".
User bubble: "Afraid of losing it, there are layoffs.". Tasalli bubble
with 3 short practical steps as a list, then one verified citation card
below it: label Dua, badge Sahih, Arabic line, transliteration,
translation "O Allah, I seek refuge in You from worry and grief...",
reference "Sahih al-Bukhari 6369", play button, add-to-plan icon. Under
it two suggestion chips: "Add to my dua plan", "Check on me after the
interview". A quiet support banner above the input: "Need to talk to
someone now?". Input bar: rounded text field "Share what's on your
heart...", send button in teal. Bottom tab bar.
```

Also generate the **Talk empty state**: a warm line "What's on your heart today?" with situation chips (Job & rizq, Anxiety, Grief, Exams, Family, Feeling far from Allah) that start a conversation when tapped.

### T3 Duas

```text
[Master style] Screen T3 Duas (tab 3 active). Title "Duas & guidance".
Search field "Search a feeling or situation". Section "My dua plan" with
a horizontal card showing this week's 2 duas and progress. Section
"When you feel..." with a 2-column grid of 13 situation tiles with
outline icons: Job & rizq, Money & debt, Anxiety, Grief, Illness, Exams,
Marriage, Family conflict, Guilt & tawbah, Loneliness, Anger, Gratitude,
Patience in hardship. Section "Daily adhkar" with two cards: Morning,
Evening. Bottom tab bar.
```

### T4 You

```text
[Master style] Screen T4 You (tab 4 active). Top: name "Ahmed" and a
small line "Anonymous account" with a button "Save my account". A
simple card "This week": prayers checked in, duas read, conversations,
shown as three small numbers with gentle labels (no streaks, no
rankings). Settings list rows with chevrons: Reminders, Prayer times &
location, Companion tone, Conversation history, Privacy & data, Help &
support, About Tasalli & our scholar reviewer. At the bottom the quiet
support banner "Need to talk to someone now?". Bottom tab bar.
```

## Detail, safety and settings screens (D1–D6, S1–S3)

These screens open on top of the tabs with a back arrow; sheets (D1, S1) slide up from the bottom.

### D1 Citation detail (bottom sheet)

```text
[Master style] Screen D1, a tall bottom sheet over a dimmed chat. Handle
bar at top. Type label "Dua" and grade badge "Sahih". Full Arabic text
in Amiri 30, right-aligned, generous line height. Large round play
button with a thin progress bar and "Recited by ..." caption.
Transliteration in italic. Translation in body text. A details card:
Source "Sahih al-Bukhari", Reference "6369", Grade "Sahih", Graded by
"...", Translation "...". A small note row with a check-badge icon:
"Verified from Tasalli's reviewed library". Buttons: "Add to my dua
plan" (primary), "Share" (outline).
```

### D2 Situation page

```text
[Master style] Screen D2 "Job & rizq". Header with outline briefcase
icon and a one-line comforting intro. A primary button "Talk to Tasalli
about this". Section "Duas" with 3 citation cards. Section "From the
Qur'an" with 2 verse cards. Section "From the Sunnah" with 2 hadith
cards. Each card has a play button and an add-to-plan icon.
```

### D3 My dua plan

```text
[Master style] Screen D3 "This week's duas". Caption "For: Job & rizq ·
Week of 26 Oct". Up to 3 large dua cards, each with Arabic, translation,
play button, and an "I read it" button with a gentle count ("Read 6
times this week") shown as small gold dots, not a progress bar. A row
"Daily reminder at 21:00" with a switch. At the bottom: "Change duas"
(outline) and "End this plan" (text button).
```

### D4 Adhkar player

```text
[Master style] Screen D4 "Morning adhkar". Calm full-screen reader. Top:
"3 of 12" and a close icon. Centre: one dhikr in very large Arabic
(Amiri 30), transliteration, translation, and reference caption. A
large circular tap counter showing "1 / 3" that fills in teal as the
user taps. Bottom: audio play/pause, previous and next arrows.
```

### D5 Prayer times

```text
[Master style] Screen D5 "Prayer times". Location line "Berlin · Muslim
World League" with an edit link. A list of 6 rows (Fajr, Sunrise,
Dhuhr, Asr, Maghrib, Isha) with times, the next prayer highlighted with
primary-soft background, and a bell icon per row to toggle check-ins.
Below, "This week" as a simple 7-day grid of small dots (gold = prayed,
outline = no answer, soft grey = not today). Caption: "Only you can see
this. It stays on your phone."
```

### D6 Conversation history

```text
[Master style] Screen D6 "Conversations". Caption "Kept for 90 days ·
Change". A list grouped by date: each row shows a situation icon, a
short title ("Worried about my job"), and date. Swipe left to delete.
Empty state: "Nothing saved here. Your conversations are private."
```

### S1 Crisis support (sheet)

```text
[Master style] Screen S1, full-height sheet with a calm support-blue
header (#2F5D8A) and no gold. Heading "You don't have to carry this
alone". Two short sentences of care: "What you're feeling matters.
Please reach out to someone who can help right now." A large row "In
immediate danger? Call 112" with a call button. Then a list "Talk to
someone now" with 2-3 helpline rows (name, number, "Free, 24/7", call
button). A button "Message someone I trust". A small line: "Seeking
help is encouraged in Islam." Close icon top right. No verses, no
duas, no chat on this screen.
```

### S2 Privacy & data

```text
[Master style] Screen S2 "Privacy & data". Card "Keep conversations
for" with segmented options: 7 days, 30 days, 90 days (selected),
Don't keep. Card "Permissions" with three switches matching onboarding
consent. Rows: "Download my data", "Privacy policy". At the bottom,
separated, a text button in ink colour (not red): "Delete everything"
with caption "Removes your account, conversations and logs from this
phone and our servers. This can't be undone."
```

### S3 Reminders

```text
[Master style] Screen S3 "Reminders". Grouped list with switches:
"Prayer check-ins" (with 5 prayer chips and a "Remind me 20 min after
adhan" stepper), "Morning adhkar" with time, "Evening adhkar" with time,
"Dua plan reminder" with time, "Follow-ups after we talk". A caption
under the group: "Reminders are gentle. You can answer 'Not today'
without any judgement."
```

## States, accessibility and handoff

Each screen needs its loading, empty and error states before handoff; Stitch can generate them with "same screen, \[state\] state".

### States to design

| Where | State | What it shows |
| --- | --- | --- |
| Talk | Thinking | Typing dots in a Tasalli bubble, input disabled |
| Talk | Offline | Soft banner "You're offline. Duas and adhkar still work." |
| Talk | Reply could not be verified | Gentle line "Let me share something I'm sure of" followed by 2 citation cards (this is the safe fallback) |
| Talk | Scholar referral | Tasalli bubble with a small "Ask a scholar" info card: "This needs a qualified scholar. Your local imam is a good place to start." |
| Citation card | Audio loading / playing | Spinner in play button; animated thin progress bar |
| Today | Nothing set up | Friendly card "Turn on gentle reminders" and a "Start talking" button |
| Duas | Search no results | "No match yet. Try talking to Tasalli about it." |
| Any | Error | Plain sentence plus "Try again"; never technical codes |

### Accessibility

- Text contrast at least 4.5:1 (check gold text on ivory; use gold for icons and badges, not small text).
- Support system font scaling up to 200% without clipping Arabic.
- Every icon button has a label for screen readers; Arabic text has a language tag so it is read correctly.
- Arabic blocks are right-to-left inside left-to-right screens; mirror only those blocks, not the whole layout.
- Never rely on colour alone: prayer dots use fill and shape (filled, outline, dash).

### Handoff checklist

- [ ] Master style applied to all 18 screens and 5 components
- [ ] Light and dark versions of every screen
- [ ] States from the table above
- [ ] Frames named with screen IDs (O1–O5, T1–T4, D1–D6, S1–S3, C1–C5)
- [ ] Exported to Figma with the colour and type tokens as styles
- [ ] Crisis sheet (S1) and onboarding copy (O2, O3) reviewed by the founder before development
- [ ] Placeholder Arabic marked clearly as placeholder in every frame
