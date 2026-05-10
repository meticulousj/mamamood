import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, tinyint, boolean, json, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Mood check-ins: Daily mood tracking with emoji scale
export const moodCheckins = mysqlTable("mood_checkins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mood: tinyint("mood").notNull(), // 1-5 scale: 1=😢, 2=😕, 3=😐, 4=🙂, 5=😊
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MoodCheckin = typeof moodCheckins.$inferSelect;
export type InsertMoodCheckin = typeof moodCheckins.$inferInsert;

// Affirmations: Saved favorite affirmations per user
export const affirmations = mysqlTable("affirmations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  moodContext: tinyint("moodContext"), // Optional: mood when affirmation was generated
  isFavorite: boolean("isFavorite").default(false).notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }), // S3 URL to generated audio file
  audioGeneratedAt: timestamp("audioGeneratedAt"), // When audio was generated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affirmation = typeof affirmations.$inferSelect;
export type InsertAffirmation = typeof affirmations.$inferInsert;

// Affirmation audio settings: User preferences for audio playback
export const affirmationAudioSettings = mysqlTable("affirmation_audio_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  voiceGender: mysqlEnum("voiceGender", ["female", "male", "neutral"]).default("female").notNull(),
  speechRate: decimal("speechRate", { precision: 3, scale: 2 }).default("1.0").notNull(), // 0.5 to 2.0
  volume: tinyint("volume").default(100).notNull(), // 0-100
  autoPlay: boolean("autoPlay").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffirmationAudioSettings = typeof affirmationAudioSettings.$inferSelect;
export type InsertAffirmationAudioSettings = typeof affirmationAudioSettings.$inferInsert;

// Journal entries: Private daily journaling with rich text
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  moodAtTime: tinyint("moodAtTime"), // Mood when entry was written
  prompt: text("prompt"), // The LLM-generated prompt that inspired this entry
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// Meditation sessions: Pre-loaded meditation library
export const meditationSessions = mysqlTable("meditation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // stress, sleep, focus, self-compassion, energy
  duration: int("duration").notNull(), // Duration in seconds
  audioUrl: varchar("audioUrl", { length: 512 }), // S3 URL to audio file
  transcript: text("transcript"), // Optional text transcript
  instructor: varchar("instructor", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMeditationSession = typeof meditationSessions.$inferInsert;

// User meditation history: Track completed meditations
export const userMeditationHistory = mysqlTable("user_meditation_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  meditationId: int("meditationId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type UserMeditationHistory = typeof userMeditationHistory.$inferSelect;
export type InsertUserMeditationHistory = typeof userMeditationHistory.$inferInsert;

// Daily streaks: Track consecutive days of engagement
export const dailyStreaks = mysqlTable("daily_streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastCheckInDate: timestamp("lastCheckInDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyStreak = typeof dailyStreaks.$inferSelect;
export type InsertDailyStreak = typeof dailyStreaks.$inferInsert;