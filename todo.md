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
- [ ] Create Affirmations page
- [ ] Create Journal page
- [ ] Create Meditations page
- [ ] Create Insights/Analytics page
- [ ] Implement page transitions with animations

## Phase 5: Mood Check-In Feature
- [x] Build MoodCheckIn component with emoji scale
- [x] Implement notes input field
- [x] Create check-in submission logic
- [ ] Add daily check-in validation (one per day)
- [ ] Display check-in confirmation animation
- [x] Trigger affirmation + prompt generation on submit

## Phase 6: Affirmations Feature
- [ ] Build AffirmationCard component
- [ ] Build AffirmationsFeed component
- [ ] Implement LLM affirmation generation
- [ ] Add save/favorite functionality
- [ ] Build SavedAffirmations view
- [ ] Add affirmation reveal animations

## Phase 7: Journaling Feature
- [ ] Build JournalPrompt display component
- [ ] Build rich-text JournalEditor
- [ ] Implement auto-save functionality
- [ ] Build JournalArchive with date filtering
- [ ] Implement journal entry retrieval
- [ ] Add LLM prompt generation
- [ ] Create entry delete with confirmation

## Phase 8: Meditation Feature
- [ ] Seed meditation library (20-30 sessions)
- [ ] Build MeditationCard component
- [ ] Build MeditationLibrary with category filtering
- [ ] Build MeditationPlayer with audio controls
- [ ] Implement meditation completion tracking
- [ ] Add meditation history display

## Phase 9: Streak & Progress Tracking
- [ ] Build StreakCounter component with animations
- [ ] Build WeeklySummary component
- [ ] Implement streak calculation logic
- [ ] Add milestone celebration animations
- [ ] Create weekly metrics aggregation
- [ ] Display engagement summary

## Phase 10: Analytics & Insights
- [ ] Build MoodChart component with Recharts
- [ ] Implement mood trend calculation
- [ ] Create InsightsPage dashboard
- [ ] Add trend analysis display
- [ ] Build historical mood view

## Phase 11: Micro-Animations & Polish
- [ ] Add page transition animations
- [ ] Implement button hover/click animations
- [ ] Add card entrance animations
- [ ] Create mood emoji selection animations
- [ ] Add streak milestone pulse animation
- [ ] Implement affirmation reveal animations
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

