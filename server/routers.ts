import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { getOrCreateUserThetaSettings, updateUserThetaSettings, updateMeditationThetaFrequency, getMeditationsWithThetaTones } from "./db";
import { affirmations as affirmationsTable } from "../drizzle/schema";

import {
  createMoodCheckIn,
  getMoodCheckInToday,
  getMoodCheckInHistory,
  createAffirmation,
  saveAffirmationAsFavorite,
  getFavoriteAffirmations,
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getMeditationsByCategory,
  getAllMeditations,
  getMeditationById,
  recordMeditationCompletion,
  getUserMeditationHistory,
  getOrCreateStreak,
  updateStreak,
  getStreak,
  seedMeditations,
  getOrCreateAudioSettings,
  updateAudioSettings,
  updateAffirmationAudio,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Mood check-in router
  checkin: router({
    submit: protectedProcedure
      .input(z.object({
        mood: z.number().min(1).max(5),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create mood check-in
        await createMoodCheckIn(ctx.user.id, input.mood, input.notes);
        
        // Update streak
        await updateStreak(ctx.user.id);
        
        // Get updated streak
        const streak = await getStreak(ctx.user.id);
        
        return { success: true, streak };
      }),
    
    getToday: protectedProcedure.query(async ({ ctx }) => {
      return await getMoodCheckInToday(ctx.user.id);
    }),
    
    getHistory: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return await getMoodCheckInHistory(ctx.user.id, input.days);
      }),
  }),

  // Affirmations router
  affirmations: router({
    generate: protectedProcedure
      .input(z.object({
        mood: z.number().min(1).max(5),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const moodLabels = ['overwhelmed', 'stressed', 'neutral', 'good', 'great'];
        
        const prompt = `Generate 3 personalized, uplifting affirmations for a working mom who is feeling ${moodLabels[input.mood - 1]}${input.notes ? ` and shared: "${input.notes}"` : ''}. Each affirmation should be:
- Specific to working mothers' experiences
- Compassionate and realistic (not toxic positivity)
- 1-2 sentences maximum
- Empowering and actionable

Return ONLY the 3 affirmations, one per line, without numbering or extra formatting.`;
        
        const response = await invokeLLM({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });
        
        const content = response.choices[0]?.message?.content as string | undefined;
        const contentStr = content || '';
        const affirmationTexts = contentStr
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .slice(0, 3);
        
        // Save affirmations to database
        for (const affirmationText of affirmationTexts) {
          await createAffirmation(ctx.user.id, affirmationText, input.mood);
        }
        
        return { affirmations: affirmationTexts };
      }),
    
    save: protectedProcedure
      .input(z.object({ affirmationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await saveAffirmationAsFavorite(input.affirmationId, ctx.user.id);
        return { success: true };
      }),
    
    getFavorites: protectedProcedure.query(async ({ ctx }) => {
      return await getFavoriteAffirmations(ctx.user.id);
    }),
    
    toggleFavorite: protectedProcedure
      .input(z.object({ affirmationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the affirmation to check current favorite status
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const affirmation = await db
          .select()
          .from(affirmationsTable)
          .where(eq(affirmationsTable.id, input.affirmationId))
          .limit(1);
        
        if (affirmation.length === 0) {
          throw new Error('Affirmation not found');
        }
        
        // Toggle favorite status
        const newFavoriteStatus = !affirmation[0].isFavorite;
        await db
          .update(affirmationsTable)
          .set({ isFavorite: newFavoriteStatus })
          .where(eq(affirmationsTable.id, input.affirmationId));
        
        return { success: true, isFavorite: newFavoriteStatus };
      }),
    
    generateAudio: protectedProcedure
      .input(z.object({ affirmationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const affirmation = await db
          .select()
          .from(affirmationsTable)
          .where(eq(affirmationsTable.id, input.affirmationId))
          .limit(1);
        
        if (affirmation.length === 0) {
          throw new Error('Affirmation not found');
        }
        
        const audioSettings = await getOrCreateAudioSettings(ctx.user.id);
        const audioUrl = `https://example.com/audio/${input.affirmationId}.mp3`;
        
        await updateAffirmationAudio(input.affirmationId, audioUrl);
        
        return { success: true, audioUrl };
      }),
    
    getAudioSettings: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateAudioSettings(ctx.user.id);
    }),
    
    updateAudioSettings: protectedProcedure
      .input(z.object({
        voiceGender: z.enum(['female', 'male', 'neutral']).optional(),
        speechRate: z.number().min(0.5).max(2).optional(),
        volume: z.number().min(0).max(100).optional(),
        autoPlay: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings: Record<string, any> = {};
        if (input.voiceGender) settings.voiceGender = input.voiceGender;
        if (input.speechRate !== undefined) settings.speechRate = input.speechRate;
        if (input.volume !== undefined) settings.volume = input.volume;
        if (input.autoPlay !== undefined) settings.autoPlay = input.autoPlay;
        
        await updateAudioSettings(ctx.user.id, settings);
        return { success: true };
      }),
  }),

  // Journal router
  journal: router({
    generatePrompt: protectedProcedure
      .input(z.object({
        mood: z.number().min(1).max(5),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const moodLabels = ['overwhelmed', 'stressed', 'neutral', 'good', 'great'];
        
        const prompt = `Generate a thoughtful, compassionate journaling prompt for a working mom who is feeling ${moodLabels[input.mood - 1]}${input.notes ? ` and shared: "${input.notes}"` : ''}. The prompt should:
- Encourage reflection on her specific experience as a working mother
- Be open-ended and non-judgmental
- Help her process emotions or find clarity
- Be 1-2 sentences maximum

Return ONLY the prompt without any additional text or explanation.`;
        
        const response = await invokeLLM({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });
        
        const promptContent = response.choices[0]?.message?.content as string | undefined;
        const promptStr = promptContent || '';
        return { prompt: promptStr.trim() };
      }),
    
    save: protectedProcedure
      .input(z.object({
        content: z.string(),
        moodAtTime: z.number().min(1).max(5).optional(),
        prompt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createJournalEntry(
          ctx.user.id,
          input.content,
          input.moodAtTime,
          input.prompt
        );
        return { success: true };
      }),
    
    getEntries: protectedProcedure
      .input(z.object({
        limit: z.number().default(30),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        return await getJournalEntries(ctx.user.id, input.limit, input.offset);
      }),
    
    getEntry: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getJournalEntry(input.id, ctx.user.id);
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateJournalEntry(input.id, ctx.user.id, input.content);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteJournalEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Meditations router
  meditations: router({
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await getMeditationsByCategory(input.category);
      }),
    
    getAll: publicProcedure.query(async () => {
      return await getAllMeditations();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMeditationById(input.id);
      }),
    
    recordCompletion: protectedProcedure
      .input(z.object({ meditationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await recordMeditationCompletion(ctx.user.id, input.meditationId);
        return { success: true };
      }),
    
    getHistory: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return await getUserMeditationHistory(ctx.user.id, input.days);
      }),
  }),

  // Streak router
  streak: router({
    getStreak: protectedProcedure.query(async ({ ctx }) => {
      return await getStreak(ctx.user.id);
    }),
    
    getWeeklySummary: protectedProcedure.query(async ({ ctx }) => {
      const streak = await getStreak(ctx.user.id);
      const moodHistory = await getMoodCheckInHistory(ctx.user.id, 7);
      const favoriteAffirmations = await getFavoriteAffirmations(ctx.user.id);
      const journalEntries = await getJournalEntries(ctx.user.id, 100, 0);
      const meditationHistory = await getUserMeditationHistory(ctx.user.id, 7);
      
      // Count this week's entries
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyJournalCount = journalEntries.filter(
        (entry) => new Date(entry.createdAt) >= weekAgo
      ).length;
      
      return {
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        moodCheckInsThisWeek: moodHistory.length,
        affirmationsSavedThisWeek: favoriteAffirmations.filter(
          (aff) => new Date(aff.createdAt) >= weekAgo
        ).length,
        journalEntriesThisWeek: weeklyJournalCount,
        meditationsCompletedThisWeek: meditationHistory.length,
        averageMood: moodHistory.length > 0
          ? Math.round((moodHistory.reduce((sum, m) => sum + m.mood, 0) / moodHistory.length) * 10) / 10
          : null,
      };
    }),
  }),

  // Analytics router
  analytics: router({
    getMoodTrend: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return await getMoodCheckInHistory(ctx.user.id, input.days);
      }),
  }),
  
  // Theta frequency ambient soundwaves router
  theta: router({
    getThetaSettings: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateUserThetaSettings(ctx.user.id);
    }),
    
    updateThetaSettings: protectedProcedure
      .input(z.object({
        preferredFrequency: z.number().min(4).max(8).optional(),
        thetaVolume: z.number().min(0).max(100).optional(),
        enableTheta: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings: Record<string, any> = {};
        if (input.preferredFrequency !== undefined) settings.preferredFrequency = input.preferredFrequency;
        if (input.thetaVolume !== undefined) settings.thetaVolume = input.thetaVolume;
        if (input.enableTheta !== undefined) settings.enableTheta = input.enableTheta;
        
        await updateUserThetaSettings(ctx.user.id, settings);
        return { success: true };
      }),
    
    getMeditationsWithTheta: protectedProcedure.query(async () => {
      return await getMeditationsWithThetaTones();
    }),
    
    updateMeditationTheta: protectedProcedure
      .input(z.object({
        meditationId: z.number(),
        frequency: z.number().min(4).max(8),
        includeAmbient: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await updateMeditationThetaFrequency(input.meditationId, input.frequency, input.includeAmbient);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;


// Add to imports from db
// getOrCreateAudioSettings, updateAudioSettings, updateAffirmationAudio

// Add to affirmations router:
/*
    generateAudio: protectedProcedure
      .input(z.object({ affirmationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const affirmation = await db
          .select()
          .from(affirmationsTable)
          .where(eq(affirmationsTable.id, input.affirmationId))
          .limit(1);
        
        if (affirmation.length === 0) {
          throw new Error('Affirmation not found');
        }
        
        const audioSettings = await getOrCreateAudioSettings(ctx.user.id);
        const audioUrl = `https://example.com/audio/${input.affirmationId}.mp3`;
        
        await updateAffirmationAudio(input.affirmationId, audioUrl);
        
        return { success: true, audioUrl };
      }),
    
    getAudioSettings: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreateAudioSettings(ctx.user.id);
    }),
    
    updateAudioSettings: protectedProcedure
      .input(z.object({
        voiceGender: z.enum(['female', 'male', 'neutral']).optional(),
        speechRate: z.number().min(0.5).max(2).optional(),
        volume: z.number().min(0).max(100).optional(),
        autoPlay: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings: Record<string, any> = {};
        if (input.voiceGender) settings.voiceGender = input.voiceGender;
        if (input.speechRate !== undefined) settings.speechRate = input.speechRate;
        if (input.volume !== undefined) settings.volume = input.volume;
        if (input.autoPlay !== undefined) settings.autoPlay = input.autoPlay;
        
        await updateAudioSettings(ctx.user.id, settings);
        return { success: true };
      }),
*/


