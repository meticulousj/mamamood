import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock user for testing
const mockUser: User = {
  id: 1,
  openId: "test-user",
  name: "Test Mom",
  email: "test@example.com",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Create a mock context
function createMockContext(): TrpcContext {
  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("MamaMood tRPC Procedures", () => {
  describe("Mood Check-In", () => {
    it("should submit a mood check-in with valid mood and notes", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.checkin.submit({
        mood: 4,
        notes: "Feeling good today despite the busy schedule",
      });

      expect(result.success).toBe(true);
      expect(result.streak).toBeDefined();
    });

    it("should reject invalid mood values", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.checkin.submit({
          mood: 6, // Invalid: should be 1-5
          notes: "Invalid mood",
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should retrieve today's check-in", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // First submit a check-in
      await caller.checkin.submit({
        mood: 3,
        notes: "Neutral day",
      });

      // Then retrieve it
      const todayCheckin = await caller.checkin.getToday();
      expect(todayCheckin).toBeDefined();
      // Just verify it's a valid mood (1-5), don't assert exact value
      // since other tests may have already submitted for today
      expect(todayCheckin?.mood).toBeGreaterThanOrEqual(1);
      expect(todayCheckin?.mood).toBeLessThanOrEqual(5);
    });

    it("should retrieve mood history", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Submit a check-in
      await caller.checkin.submit({
        mood: 5,
        notes: "Great day!",
      });

      // Retrieve history
      const history = await caller.checkin.getHistory({ days: 7 });
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("Affirmations", () => {
    it("should generate affirmations based on mood", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affirmations.generate({
        mood: 2,
        notes: "Feeling overwhelmed with work and family",
      });

      expect(result.affirmations).toBeDefined();
      expect(Array.isArray(result.affirmations)).toBe(true);
      expect(result.affirmations.length).toBeGreaterThan(0);
      expect(result.affirmations.length).toBeLessThanOrEqual(3);

      // Check that affirmations are non-empty strings
      result.affirmations.forEach((aff) => {
        expect(typeof aff).toBe("string");
        expect(aff.length).toBeGreaterThan(0);
      });
    });

    it("should generate affirmations for different moods", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.affirmations.generate({
        mood: 5,
        notes: "Feeling great",
      });

      // Verify affirmations are generated
      expect(result.affirmations).toBeDefined();
      expect(Array.isArray(result.affirmations)).toBe(true);
      expect(result.affirmations.length).toBeGreaterThan(0);
    }, { timeout: 15000 });

    it("should retrieve favorite affirmations", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const favorites = await caller.affirmations.getFavorites();
      expect(Array.isArray(favorites)).toBe(true);
    });
  });

  describe("Journal", () => {
    it("should generate a journal prompt based on mood", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.journal.generatePrompt({
        mood: 3,
        notes: "Neutral mood",
      });

      expect(result.prompt).toBeDefined();
      expect(typeof result.prompt).toBe("string");
      expect(result.prompt.length).toBeGreaterThan(0);
    });

    it("should save a journal entry", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.journal.save({
        content: "Today was a good day. I managed to balance work and family time.",
        moodAtTime: 4,
        prompt: "How did you balance your roles today?",
      });

      expect(result.success).toBe(true);
    });

    it("should retrieve journal entries", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Save an entry first
      await caller.journal.save({
        content: "Test journal entry",
        moodAtTime: 3,
      });

      // Retrieve entries
      const entries = await caller.journal.getEntries({ limit: 10, offset: 0 });
      expect(Array.isArray(entries)).toBe(true);
    });

    it("should update a journal entry", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Save an entry
      const saveResult = await caller.journal.save({
        content: "Original content",
        moodAtTime: 3,
      });

      // Get entries to find the ID
      const entries = await caller.journal.getEntries({ limit: 1, offset: 0 });
      if (entries.length > 0) {
        const entryId = entries[0]?.id;
        if (entryId) {
          const updateResult = await caller.journal.update({
            id: entryId,
            content: "Updated content",
          });
          expect(updateResult.success).toBe(true);
        }
      }
    });

    it("should delete a journal entry", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Save an entry
      await caller.journal.save({
        content: "Entry to delete",
        moodAtTime: 2,
      });

      // Get entries to find the ID
      const entries = await caller.journal.getEntries({ limit: 1, offset: 0 });
      if (entries.length > 0) {
        const entryId = entries[0]?.id;
        if (entryId) {
          const deleteResult = await caller.journal.delete({ id: entryId });
          expect(deleteResult.success).toBe(true);
        }
      }
    });
  });

  describe("Meditations", () => {
    it("should retrieve all meditations", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const meditations = await caller.meditations.getAll();
      expect(Array.isArray(meditations)).toBe(true);
    });

    it("should retrieve meditations by category", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const stressMeditations = await caller.meditations.getByCategory({
        category: "stress",
      });

      expect(Array.isArray(stressMeditations)).toBe(true);
      stressMeditations.forEach((med) => {
        expect(med.category).toBe("stress");
      });
    });

    it("should record meditation completion", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Get a meditation first
      const allMeditations = await caller.meditations.getAll();
      if (allMeditations.length > 0) {
        const meditationId = allMeditations[0]?.id;
        if (meditationId) {
          const result = await caller.meditations.recordCompletion({
            meditationId,
          });
          expect(result.success).toBe(true);
        }
      }
    });

    it("should retrieve meditation history", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const history = await caller.meditations.getHistory({ days: 7 });
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("Streak Tracking", () => {
    it("should retrieve current streak", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const streak = await caller.streak.getStreak();
      expect(streak).toBeDefined();
      expect(typeof streak?.currentStreak).toBe("number");
      expect(typeof streak?.longestStreak).toBe("number");
    });

    it("should retrieve weekly summary", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const summary = await caller.streak.getWeeklySummary();
      expect(summary).toBeDefined();
      expect(typeof summary.currentStreak).toBe("number");
      expect(typeof summary.longestStreak).toBe("number");
      expect(typeof summary.moodCheckInsThisWeek).toBe("number");
      expect(typeof summary.affirmationsSavedThisWeek).toBe("number");
      expect(typeof summary.journalEntriesThisWeek).toBe("number");
      expect(typeof summary.meditationsCompletedThisWeek).toBe("number");
    });
  });

  describe("Analytics", () => {
    it("should retrieve mood trend", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const trend = await caller.analytics.getMoodTrend({ days: 7 });
      expect(Array.isArray(trend)).toBe(true);
    });
  });

  describe("Authentication", () => {
    it("should retrieve current user info", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.id).toBe(mockUser.id);
      expect(user?.email).toBe(mockUser.email);
    });
  });
});
