# MamaMood: Project Architecture & Design Plan

## Overview

MamaMood is an elegant, polished wellness web app designed specifically for working moms. The app serves as a daily sanctuary featuring mood tracking, LLM-powered affirmations, guided meditations, private journaling, and progress tracking—all wrapped in a calming, feminine aesthetic with thoughtful micro-animations.

## Core Architecture

### Technology Stack

- **Frontend:** React 19 + Tailwind CSS 4 + Framer Motion (micro-animations)
- **Backend:** Express 4 + tRPC 11 (type-safe RPC)
- **Database:** MySQL (via Drizzle ORM)
- **Authentication:** Manus OAuth
- **LLM Integration:** Built-in Forge API (invokeLLM helper)
- **Audio/Meditation:** Pre-recorded meditation library stored in S3
- **Charts:** Recharts for mood history visualization

### Database Schema

The schema includes the following core tables:

1. **users** (pre-existing) - Extends with wellness-specific fields
2. **mood_checkins** - Daily mood entries with emoji scale and optional notes
3. **affirmations** - Saved favorite affirmations per user
4. **journal_entries** - Private daily journal entries with rich text
5. **meditation_sessions** - Pre-loaded meditation library metadata
6. **user_meditation_history** - Tracks which meditations user has completed
7. **daily_streaks** - Tracks consecutive days of engagement

### Data Flow

**Mood Check-In → Personalization:**
1. User completes daily mood check-in (emoji scale + optional notes)
2. Mood data stored in `mood_checkins` table
3. Mood + user context sent to LLM via tRPC procedure
4. LLM generates 3 personalized affirmations and 1 journal prompt
5. Affirmations displayed in feed; prompt shown in journal UI
6. User can save affirmations to `affirmations` table

**User Journey:**
- Login → Dashboard → Mood Check-In → Affirmations Feed + Journal + Meditations → Streak Tracking

## Design System

### Color Palette (Soft Pastels + Warm Accents)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Soft Cream | `#FBF8F3` | Main app background |
| Primary Accent | Warm Rose | `#E8B4B8` | Buttons, highlights, CTAs |
| Secondary Accent | Soft Lavender | `#D4C5E2` | Secondary buttons, dividers |
| Text Primary | Deep Charcoal | `#2C2C2C` | Body text, headings |
| Text Secondary | Warm Taupe | `#8B7D7D` | Labels, helper text |
| Success/Mood Positive | Soft Sage | `#B8D4C8` | Positive mood indicators |
| Calm/Meditation | Soft Blue | `#C5D9E8` | Meditation section |
| Neutral | Warm Beige | `#E8DCC8` | Cards, containers |

### Typography

- **Headings:** "Poppins" (Google Font) - 600 weight, warm and inviting
- **Body:** "Lora" (Google Font) - 400 weight, elegant and readable
- **UI Elements:** "Inter" (Google Font) - 500 weight, clean and modern

### Micro-Animations

All animations use Framer Motion with gentle easing:

- **Page Transitions:** Fade-in + subtle slide-up (0.4s, easeOut)
- **Button Hover:** Soft scale (1.02x) + color shift (0.2s)
- **Card Entrance:** Staggered fade-in for list items (0.3s each)
- **Mood Emoji Selection:** Scale + bounce on click (0.3s)
- **Streak Counter:** Pulse animation on milestone (0.6s)
- **Affirmation Reveal:** Fade-in with text reveal (0.5s)

### Visual Hierarchy

- Large, breathing whitespace between sections
- Soft shadows (0 2px 8px rgba(0,0,0,0.08)) for depth without harshness
- Rounded corners (12-16px) for warmth
- Consistent padding (1.5rem - 2rem) for breathing room

## Feature Breakdown

### 1. Daily Affirmations Feed

**User Flow:**
1. User completes mood check-in
2. System generates 3 personalized affirmations via LLM
3. Affirmations displayed in elegant card format
4. User can save favorites to personal collection
5. Saved affirmations persist in database

**Backend Procedures:**
- `affirmations.generate(moodData)` - Call LLM with mood context
- `affirmations.save(affirmationId)` - Save to user's favorites
- `affirmations.getFavorites()` - Retrieve saved affirmations

**UI Components:**
- AffirmationCard - Single affirmation with save button
- AffirmationsFeed - Grid of 3 personalized affirmations
- SavedAffirmations - Collection view of favorites

### 2. Guided Meditation Library

**Structure:**
- Pre-loaded meditation library with 20-30 sessions
- Sessions categorized: Stress Relief, Better Sleep, Focus, Self-Compassion, Energy Boost
- Duration: 2-10 minutes
- Format: Audio files stored in S3 + optional text transcripts

**Backend Procedures:**
- `meditations.getByCategory(category)` - Retrieve meditations by mood/need
- `meditations.recordCompletion(meditationId)` - Log completed session
- `meditations.getHistory()` - User's meditation history

**UI Components:**
- MeditationCard - Single meditation with play button + duration
- MeditationLibrary - Categorized meditation browser
- MeditationPlayer - Audio player with progress bar + transcript option

### 3. Private Journaling

**User Flow:**
1. User sees LLM-generated journal prompt based on mood
2. User opens rich-text editor
3. Entry auto-saves as user types
4. Entries stored securely, scoped to user
5. User can view past entries with date filtering

**Backend Procedures:**
- `journal.generatePrompt(moodData)` - Generate prompt via LLM
- `journal.saveEntry(content, moodData)` - Save journal entry
- `journal.getEntries(dateRange)` - Retrieve user's entries
- `journal.deleteEntry(entryId)` - Soft delete with confirmation

**UI Components:**
- JournalPrompt - Display LLM-generated writing prompt
- JournalEditor - Rich-text editor with auto-save
- JournalArchive - Calendar view of past entries
- JournalEntry - Single entry view with date + mood indicator

### 4. Emotional Check-In

**User Flow:**
1. User selects mood using emoji scale (5 emotions: 😢 😕 😐 🙂 😊)
2. Optional text notes field
3. Data stored with timestamp
4. Check-in triggers affirmation + prompt generation
5. Streak counter increments

**Backend Procedures:**
- `checkin.submit(mood, notes)` - Record mood check-in
- `checkin.getToday()` - Check if user already checked in today
- `checkin.getWeekly()` - Retrieve past 7 days of mood data

**UI Components:**
- MoodCheckIn - Emoji scale selector + notes input
- MoodIndicator - Visual representation of current mood

### 5. Streak & Progress Tracking

**User Flow:**
1. Daily check-in increments streak counter
2. Streak resets if user misses a day
3. Weekly summary shows engagement metrics
4. Milestones trigger celebratory animations

**Metrics Tracked:**
- Current streak (consecutive days)
- Longest streak (all-time)
- Affirmations saved this week
- Journal entries this week
- Meditations completed this week
- Average mood this week

**Backend Procedures:**
- `streak.updateStreak()` - Called after daily check-in
- `streak.getStreak()` - Retrieve current streak data
- `streak.getWeeklySummary()` - Aggregate weekly metrics

**UI Components:**
- StreakCounter - Visual streak display with animation
- WeeklySummary - Card showing engagement metrics
- MilestoneNotification - Celebratory animation on streak milestones

### 6. Weekly Mood History Chart

**User Flow:**
1. User navigates to insights/analytics section
2. Chart displays past 7 days of mood data
3. Visual trend line shows emotional patterns
4. Hover/click reveals details for each day

**Backend Procedures:**
- `analytics.getMoodTrend(days)` - Retrieve mood data for charting

**UI Components:**
- MoodChart - Recharts line/bar chart with mood history
- InsightsPage - Dashboard showing mood trends + summary stats

## Implementation Phases

### Phase 1: Schema & Database
- Create all tables with proper relationships
- Set up indexes for performance
- Run migrations via webdev_execute_sql

### Phase 2: Backend Procedures
- Implement all tRPC procedures
- Integrate LLM calls for affirmations + prompts
- Set up meditation library seeding

### Phase 3: Frontend UI
- Build design system components
- Implement layout and navigation
- Create all page templates

### Phase 4: Feature Integration
- Wire mood check-in to affirmation generation
- Connect journaling to LLM prompts
- Implement streak tracking logic

### Phase 5: Refinement
- Add micro-animations
- Optimize performance
- Write comprehensive tests

## Security & Privacy

- All user data scoped to authenticated user via `ctx.user.id`
- Journal entries encrypted at rest (future enhancement)
- No data sharing between users
- Session management via Manus OAuth
- HTTPS enforced for all communications

## Success Metrics

- Users complete daily mood check-ins
- High engagement with affirmations (save rate > 30%)
- Journal entries written consistently
- Meditation sessions completed regularly
- Streak tracking drives habit formation
- App feels calm, polished, and personal

