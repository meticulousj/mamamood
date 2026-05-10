import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, ArrowLeft, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "wouter";

export default function Insights() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const moodTrendQuery = trpc.analytics.getMoodTrend.useQuery({ days: 30 });
  const weeklySummaryQuery = trpc.streak.getWeeklySummary.useQuery();

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Poppins' }}>
              Insights
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Weekly Summary Cards */}
        {weeklySummaryQuery.data && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <motion.div variants={item}>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                      Check-ins
                    </p>
                    <p className="text-3xl font-bold text-accent" style={{ fontFamily: 'Poppins' }}>
                      {weeklySummaryQuery.data.moodCheckInsThisWeek}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                      Journal
                    </p>
                    <p className="text-3xl font-bold text-secondary" style={{ fontFamily: 'Poppins' }}>
                      {weeklySummaryQuery.data.journalEntriesThisWeek}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                      Meditations
                    </p>
                    <p className="text-3xl font-bold text-chart-3" style={{ fontFamily: 'Poppins' }}>
                      {weeklySummaryQuery.data.meditationsCompletedThisWeek}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter' }}>
                      Avg Mood
                    </p>
                    <p className="text-3xl font-bold text-accent" style={{ fontFamily: 'Poppins' }}>
                      {weeklySummaryQuery.data.averageMood?.toFixed(1) || '-'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Mood Trend Chart */}
        {moodTrendQuery.data && moodTrendQuery.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins' }}>
                  <TrendingUp className="w-5 h-5 text-accent" />
                  30-Day Mood Trend
                </CardTitle>
                <CardDescription style={{ fontFamily: 'Lora' }}>
                  Your emotional journey over the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrendQuery.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="date"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      formatter={(value) => {
                        const mood = Math.round(value as number);
                        return [
                          `${moodEmojis[mood - 1]} ${mood}/5`,
                          'Mood',
                        ];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="var(--accent)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--accent)', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mood Distribution */}
        {moodTrendQuery.data && moodTrendQuery.data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins' }}>Mood Distribution</CardTitle>
                <CardDescription style={{ fontFamily: 'Lora' }}>
                  How often you've felt each mood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodEmojis.map((emoji, index) => {
                    const count = moodTrendQuery.data!.filter(
                      (d) => Math.round(d.mood) === index + 1
                    ).length;
                    const percentage =
                      ((count / moodTrendQuery.data!.length) * 100).toFixed(0);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ fontFamily: 'Inter' }}>
                            {emoji} {['Overwhelmed', 'Stressed', 'Neutral', 'Good', 'Great'][index]}
                          </span>
                          <span className="text-sm font-semibold text-accent" style={{ fontFamily: 'Poppins' }}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                            className="bg-accent rounded-full h-2"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {(!moodTrendQuery.data || moodTrendQuery.data.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <BarChart3 className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <p className="text-muted-foreground" style={{ fontFamily: 'Lora' }}>
              No mood data yet. Start tracking your mood to see insights.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
