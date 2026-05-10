# MamaMood TODO

## Phase 1: Database Schema & Setup
- [x] Create mood_checkins table
- [x] Create affirmations table
- [x] Create journal_entries table
- [x] Create meditation_sessions table
- [x] Create user_meditation_history table
- [x] Create daily_streaks table
- [x] Run all migrations via webdev_execute_sql
- [ ] Seed meditation library data

## Phase 2: Backend tRPC Procedures
- [x] Implement mood check-in submission (checkin.submit)
- [x] Implement affirmation generation via LLM (affirmations.generate)
- [x] Implement affirmation save/favorite (affirmations.save)
- [x] Implement get saved affirmations (affirmations.getFavorites)
- [x] Implement journal prompt generation via LLM (journal.generatePrompt)
- [x] Implement journal entry save (journal.saveEntry)
- [x] Implement get journal entries (journal.getEntries)
- [x] Implement meditation retrieval by category (meditations.getByCategory)
- [x] Implement meditation completion tracking (meditations.recordCompletion)
- [x] Implement streak update logic (streak.updateStreak)
- [x] Implement get streak data (streak.getStreak)
- [x] Implement weekly summary (streak.getWeeklySummary)
- [x] Implement mood trend analytics (analytics.getMoodTrend)

## Phase 3: Frontend Design System
- [x] Set up Tailwind color palette with CSS variables
- [x] Import Google Fonts (Poppins, Lora, Inter)
- [x] Create base component styles
- [ ] Set up Framer Motion animation utilities
- [ ] Create reusable animation variants

## Phase 4: Frontend Layout & Navigation
- [ ] Build DashboardLayout for authenticated users
- [ ] Create main navigation structure
- [x] Build Home/Dashboard page
- [x] Create Affirmations page
- [x] Create Journal page
- [x] Create Meditations page
- [x] Create Insights/Analytics page
- [x] Implement page transitions with animations

## Phase 5: Mood Check-In Feature
- [x] Build MoodCheckIn component with emoji scale
- [x] Implement notes input field
- [x] Create check-in submission logic
- [ ] Add daily check-in validation (one per day)
- [ ] Display check-in confirmation animation
- [x] Trigger affirmation + prompt generation on submit

## Phase 6: Affirmations Feature
- [x] Build AffirmationCard component
- [x] Build AffirmationsFeed component
- [x] Implement LLM affirmation generation
- [x] Add save/favorite functionality
- [x] Build SavedAffirmations view
- [x] Add affirmation reveal animations

## Phase 7: Journaling Feature
- [x] Build JournalPrompt display component
- [x] Build rich-text JournalEditor
- [ ] Implement auto-save functionality
- [x] Build JournalArchive with date filtering
- [x] Implement journal entry retrieval
- [x] Add LLM prompt generation
- [x] Create entry delete with confirmation

## Phase 8: Meditation Feature
- [ ] Seed meditation library (20-30 sessions)
- [x] Build MeditationCard component
- [x] Build MeditationLibrary with category filtering
- [ ] Build MeditationPlayer with audio controls
- [x] Implement meditation completion tracking
- [ ] Add meditation history display

## Phase 9: Streak & Progress Tracking
- [ ] Build StreakCounter component with animations
- [ ] Build WeeklySummary component
- [ ] Implement streak calculation logic
- [ ] Add milestone celebration animations
- [ ] Create weekly metrics aggregation
- [ ] Display engagement summary

## Phase 10: Analytics & Insights
- [x] Build MoodChart component with Recharts
- [x] Implement mood trend calculation
- [x] Create InsightsPage dashboard
- [x] Add trend analysis display
- [x] Build historical mood view

## Phase 11: Micro-Animations & Polish
- [x] Add page transition animations
- [x] Implement button hover/click animations
- [x] Add card entrance animations
- [x] Create mood emoji selection animations
- [ ] Add streak milestone pulse animation
- [x] Implement affirmation reveal animations
- [ ] Test animation performance

## Phase 12: Testing & Validation
- [x] Write tests for all tRPC procedures
- [x] Write tests for LLM integration
- [x] Write tests for streak logic
- [ ] Write component tests for key UI elements
- [x] Test authentication flow
- [x] Test data privacy/scoping
- [ ] Validate all animations perform smoothly
- [ ] Test responsive design on mobile/tablet

## Phase 13: Final Polish & Delivery
- [ ] Review all copy for working mom context
- [ ] Ensure consistent design language
- [ ] Verify all micro-animations are smooth
- [ ] Test full user journey end-to-end
- [ ] Create checkpoint
- [ ] Deliver to user



## Phase 14: Guided Meditations Enhancement
- [x] Create meditation seed script with 25+ sessions
- [x] Build MeditationPlayer component with audio/text display
- [x] Implement session progress tracking
- [x] Add meditation timer and completion logic
- [ ] Create meditation history view
- [ ] Add meditation recommendations based on mood
- [ ] Implement meditation audio generation via LLM
- [ ] Add meditation session notes/reflections
