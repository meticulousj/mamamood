import { eq, and, gte, lt, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, moodCheckins, affirmations, journalEntries, meditationSessions, userMeditationHistory, dailyStreaks, affirmationAudioSettings, userThetaSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Mood check-in queries
export async function getMoodCheckInToday(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await db.select()
    .from(moodCheckins)
    .where(
      and(
        eq(moodCheckins.userId, userId),
        gte(moodCheckins.createdAt, today),
        lt(moodCheckins.createdAt, tomorrow)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getMoodCheckInHistory(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(moodCheckins)
    .where(
      and(
        eq(moodCheckins.userId, userId),
        gte(moodCheckins.createdAt, startDate)
      )
    )
    .orderBy(desc(moodCheckins.createdAt));
}

export async function createMoodCheckIn(userId: number, mood: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(moodCheckins).values({
    userId,
    mood,
    notes,
  });
  
  return result;
}

// Affirmation queries
export async function createAffirmation(userId: number, content: string, moodContext?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(affirmations).values({
    userId,
    content,
    moodContext,
    isFavorite: false,
  });
  
  return result;
}

export async function saveAffirmationAsFavorite(affirmationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(affirmations)
    .set({ isFavorite: true })
    .where(
      and(
        eq(affirmations.id, affirmationId),
        eq(affirmations.userId, userId)
      )
    );
}

export async function getFavoriteAffirmations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(affirmations)
    .where(
      and(
        eq(affirmations.userId, userId),
        eq(affirmations.isFavorite, true)
      )
    )
    .orderBy(desc(affirmations.createdAt));
}

// Journal queries
export async function createJournalEntry(userId: number, content: string, moodAtTime?: number, prompt?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(journalEntries).values({
    userId,
    content,
    moodAtTime,
    prompt,
  });
  
  return result;
}

export async function getJournalEntries(userId: number, limit: number = 30, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getJournalEntry(entryId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(journalEntries)
    .where(
      and(
        eq(journalEntries.id, entryId),
        eq(journalEntries.userId, userId)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateJournalEntry(entryId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(journalEntries)
    .set({ content, updatedAt: new Date() })
    .where(
      and(
        eq(journalEntries.id, entryId),
        eq(journalEntries.userId, userId)
      )
    );
}

export async function deleteJournalEntry(entryId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(journalEntries)
    .where(
      and(
        eq(journalEntries.id, entryId),
        eq(journalEntries.userId, userId)
      )
    );
}

// Meditation queries
export async function getMeditationsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(meditationSessions)
    .where(eq(meditationSessions.category, category))
    .orderBy(meditationSessions.title);
}

export async function getAllMeditations() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(meditationSessions)
    .orderBy(meditationSessions.category, meditationSessions.title);
}

export async function getMeditationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(meditationSessions)
    .where(eq(meditationSessions.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function recordMeditationCompletion(userId: number, meditationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userMeditationHistory).values({
    userId,
    meditationId,
  });
}

export async function getUserMeditationHistory(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(userMeditationHistory)
    .where(
      and(
        eq(userMeditationHistory.userId, userId),
        gte(userMeditationHistory.completedAt, startDate)
      )
    )
    .orderBy(desc(userMeditationHistory.completedAt));
}

// Streak queries
export async function getOrCreateStreak(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let streak = await db.select()
    .from(dailyStreaks)
    .where(eq(dailyStreaks.userId, userId))
    .limit(1);
  
  if (streak.length === 0) {
    await db.insert(dailyStreaks).values({
      userId,
      currentStreak: 0,
      longestStreak: 0,
    });
    
    streak = await db.select()
      .from(dailyStreaks)
      .where(eq(dailyStreaks.userId, userId))
      .limit(1);
  }
  
  return streak[0];
}

export async function updateStreak(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const streak = await getOrCreateStreak(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let lastCheckInDate = streak.lastCheckInDate ? new Date(streak.lastCheckInDate) : null;
  if (lastCheckInDate) {
    lastCheckInDate.setHours(0, 0, 0, 0);
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let newCurrentStreak = streak.currentStreak;
  
  // If last check-in was today, don't increment
  if (lastCheckInDate && lastCheckInDate.getTime() === today.getTime()) {
    // Already checked in today
  } else if (!lastCheckInDate || lastCheckInDate.getTime() === yesterday.getTime()) {
    // Consecutive day or first check-in
    newCurrentStreak = (streak.currentStreak || 0) + 1;
  } else {
    // Streak broken, reset to 1
    newCurrentStreak = 1;
  }
  
  const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak || 0);
  
  await db.update(dailyStreaks)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastCheckInDate: today,
    })
    .where(eq(dailyStreaks.userId, userId));
}

export async function getStreak(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(dailyStreaks)
    .where(eq(dailyStreaks.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}



export async function seedMeditations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if meditations already exist
  const existing = await db.select().from(meditationSessions).limit(1);
  if (existing.length > 0) {
    console.log("Meditations already seeded");
    return;
  }
  
  const meditations = [
    {
      title: "Morning Energy Boost",
      description: "Start your day with renewed energy and focus",
      category: "energy",
      duration: 300,
      instructor: "Sarah",
    },
    {
      title: "Stress Relief for Busy Days",
      description: "Quick relief from work stress and overwhelm",
      category: "stress",
      duration: 180,
      instructor: "Emma",
    },
    {
      title: "Peaceful Sleep",
      description: "Drift into restful sleep with gentle guidance",
      category: "sleep",
      duration: 600,
      instructor: "Sarah",
    },
    {
      title: "Midday Calm",
      description: "Reset your mind during lunch break",
      category: "stress",
      duration: 240,
      instructor: "Emma",
    },
    {
      title: "Self-Compassion Practice",
      description: "Cultivate kindness toward yourself",
      category: "self-compassion",
      duration: 420,
      instructor: "Sarah",
    },
    {
      title: "Focus & Clarity",
      description: "Sharpen your mind for important tasks",
      category: "focus",
      duration: 300,
      instructor: "Emma",
    },
    {
      title: "Evening Wind Down",
      description: "Release the day's tension before bed",
      category: "sleep",
      duration: 480,
      instructor: "Sarah",
    },
    {
      title: "Breathing for Anxiety",
      description: "Calm your nervous system with breath work",
      category: "stress",
      duration: 120,
      instructor: "Emma",
    },
    {
      title: "Body Scan Relaxation",
      description: "Release tension from head to toe",
      category: "stress",
      duration: 360,
      instructor: "Sarah",
    },
    {
      title: "Loving Kindness Meditation",
      description: "Extend compassion to yourself and others",
      category: "self-compassion",
      duration: 360,
      instructor: "Emma",
    },
  ];
  
  await db.insert(meditationSessions).values(meditations);
  console.log("Meditations seeded successfully");
}


// Audio-related queries
export async function getOrCreateAudioSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const existing = await db
    .select()
    .from(affirmationAudioSettings)
    .where(eq(affirmationAudioSettings.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create default settings
  await db.insert(affirmationAudioSettings).values({
    userId,
    voiceGender: 'female',
    speechRate: 1.0 as any,
    volume: 100,
    autoPlay: false,
  });
  
  const created = await db
    .select()
    .from(affirmationAudioSettings)
    .where(eq(affirmationAudioSettings.userId, userId))
    .limit(1);
  
  return created[0];
}

export async function updateAudioSettings(userId: number, settings: Partial<Record<string, any>>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(affirmationAudioSettings)
    .set(settings)
    .where(eq(affirmationAudioSettings.userId, userId));
}

export async function updateAffirmationAudio(affirmationId: number, audioUrl: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(affirmations)
    .set({ audioUrl, audioGeneratedAt: new Date() })
    .where(eq(affirmations.id, affirmationId));
}


// Theta frequency queries
export async function getOrCreateUserThetaSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const existing = await db
    .select()
    .from(userThetaSettings)
    .where(eq(userThetaSettings.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create default theta settings
  await db.insert(userThetaSettings).values({
    userId,
    preferredFrequency: 6.0 as any,
    thetaVolume: 30,
    enableTheta: true,
  });
  
  const created = await db
    .select()
    .from(userThetaSettings)
    .where(eq(userThetaSettings.userId, userId))
    .limit(1);
  
  return created[0];
}

export async function updateUserThetaSettings(userId: number, settings: Partial<Record<string, any>>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(userThetaSettings)
    .set(settings)
    .where(eq(userThetaSettings.userId, userId));
}

export async function updateMeditationThetaFrequency(meditationId: number, frequency: number, includeAmbient: boolean) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db
    .update(meditationSessions)
    .set({ thetaFrequency: frequency as any, includeAmbientTones: includeAmbient })
    .where(eq(meditationSessions.id, meditationId));
}

export async function getMeditationsWithThetaTones() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return await db
    .select()
    .from(meditationSessions)
    .where(eq(meditationSessions.includeAmbientTones, true));
}
