import { useState, useEffect, useCallback } from "react";
import * as api from "../api/client.js";
import { supabase, isSupabaseConfigured } from "../supabase.js";

export function useHabits(user) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isCloud = isSupabaseConfigured() && Boolean(user?.id);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ── Supabase Cloud Mode ──
    if (isCloud && supabase && user?.id) {
      try {
        const { data, error } = await supabase
          .from("habits")
          .select("id, name, emoji, color, created_at, logs:habit_logs(date, done)")
          .order("id", { ascending: true });

        if (error) throw error;

        // If user is brand new and has no habits yet, auto-seed defaults
        if (!data || data.length === 0) {
          const { data: seeded, error: seedErr } = await seedUserHabitsInSupabase(user.id);
          if (!seedErr && seeded) {
            setHabits(seeded);
          } else {
            setHabits([]);
          }
        } else {
          // Format logs ensuring clean YYYY-MM-DD date strings
          let formatted = data.map((h) => ({
            ...h,
            logs: (h.logs || h.habit_logs || []).map((l) => ({
              date: typeof l.date === "string" ? l.date.split("T")[0] : String(l.date),
              done: Boolean(l.done),
            })),
          }));

          // Backfill 90-day history in Supabase if habits exist but have < 14 logs
          const habitsNeedingLogs = formatted.filter((h) => !h.logs || h.logs.length < 14);
          if (habitsNeedingLogs.length > 0) {
            for (const h of habitsNeedingLogs) {
              const logsToInsert = [];
              const today = new Date();
              for (let i = 0; i < 90; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - (89 - i));
                const ds = d.toISOString().split("T")[0];
                const dayOfWeek = d.getDay();
                // Realistic behavior curves per habit type
                let p = 0.65;
                if (h.name.toLowerCase().includes("run")) {
                  p = i < 35 ? 0.82 : (i < 65 ? 0.38 : 0.76);
                } else if (h.name.toLowerCase().includes("read")) {
                  p = i < 30 ? 0.40 : (i < 60 ? 0.68 : 0.88);
                } else if (h.name.toLowerCase().includes("meditat")) {
                  p = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.90 : 0.42;
                } else {
                  p = 0.70;
                }
                logsToInsert.push({
                  habit_id: h.id,
                  user_id: user.id,
                  date: ds,
                  done: Math.random() < p,
                });
              }
              try {
                await supabase.from("habit_logs").upsert(logsToInsert, { onConflict: "habit_id,date" });
                h.logs = logsToInsert.map((l) => ({ date: l.date, done: l.done }));
              } catch (backfillErr) {
                console.warn("Could not backfill logs in Supabase:", backfillErr);
                h.logs = logsToInsert.map((l) => ({ date: l.date, done: l.done }));
              }
            }
          }

          setHabits(formatted);
        }
      } catch (err) {
        console.error("Supabase fetch error, falling back to local:", err);
        fetchLocalHabits();
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Local / API Server Mode ──
    fetchLocalHabits();
  }, [isCloud, user?.id]);

  const fetchLocalHabits = async () => {
    try {
      const { data } = await api.getHabits();
      setHabits(data);
      setError(null);
    } catch (e) {
      setError("Cannot reach backend. Is the server running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Seed user habits in Supabase if trigger was bypassed
  const seedUserHabitsInSupabase = async (userId) => {
    try {
      const defaultHabits = [
        { name: "Morning Run", emoji: "🏃", color: "#f97316" },
        { name: "Read 30 min", emoji: "📚", color: "#38bdf8" },
        { name: "Meditate", emoji: "🧘", color: "#a78bfa" },
        { name: "Cold Shower", emoji: "🚿", color: "#34d399" },
      ];

      const inserted = [];
      for (const dh of defaultHabits) {
        const { data: h } = await supabase
          .from("habits")
          .insert({ user_id: userId, ...dh })
          .select()
          .single();

        if (h) {
          // Generate 90 days of realistic behavioral history
          const logsToInsert = [];
          for (let i = 0; i < 90; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (89 - i));
            const ds = d.toISOString().split("T")[0];
            const dow = d.getDay();
            let p = 0.65;
            if (dh.name.includes("Run")) {
              p = i < 40 ? 0.82 : (i < 65 ? 0.32 : 0.74);
            } else if (dh.name.includes("Read")) {
              p = i < 30 ? 0.38 : (i < 60 ? 0.66 : 0.89);
            } else if (dh.name.includes("Meditate")) {
              p = (dow === 0 || dow === 6) ? 0.92 : 0.38;
            } else {
              p = 0.68;
            }
            logsToInsert.push({
              habit_id: h.id,
              user_id: userId,
              date: ds,
              done: Math.random() < p,
            });
          }
          await supabase.from("habit_logs").insert(logsToInsert);
          inserted.push({ ...h, logs: logsToInsert });
        }
      }
      return { data: inserted, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  };

  const addHabit = useCallback(
    async ({ name, emoji, color, seedHistory = true }) => {
      if (isCloud && supabase && user?.id) {
        const { data, error } = await supabase
          .from("habits")
          .insert({ user_id: user.id, name, emoji, color })
          .select()
          .single();

        if (error) throw error;
        
        let initialLogs = [];
        if (seedHistory) {
          const logsToInsert = [];
          for (let i = 0; i < 90; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (89 - i));
            const ds = d.toISOString().split("T")[0];
            const p = i < 30 ? 0.4 : (i < 60 ? 0.65 : 0.85);
            logsToInsert.push({
              habit_id: data.id,
              user_id: user.id,
              date: ds,
              done: Math.random() < p,
            });
          }
          await supabase.from("habit_logs").insert(logsToInsert);
          initialLogs = logsToInsert;
        }

        const newHabit = { ...data, logs: initialLogs };
        setHabits((prev) => [...prev, newHabit]);
        return newHabit;
      }

      // Local mode
      const { data } = await api.createHabit({ name, emoji, color, seed_history: seedHistory });
      setHabits((prev) => [...prev, data]);
      return data;
    },
    [isCloud, user?.id]
  );

  const removeHabit = useCallback(
    async (id) => {
      if (isCloud && supabase && user?.id) {
        await supabase.from("habits").delete().eq("id", id);
        setHabits((prev) => prev.filter((h) => h.id !== id));
        return;
      }

      // Local mode
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    },
    [isCloud, user?.id]
  );

  const toggleDate = useCallback(
    async (habitId, date, currentDone) => {
      const newDone = !currentDone;

      // Optimistic update
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          const exists = h.logs.some((l) => l.date === date);
          const updatedLogs = exists
            ? h.logs.map((l) => (l.date === date ? { ...l, done: newDone } : l))
            : [...h.logs, { date, done: newDone }];
          return { ...h, logs: updatedLogs };
        })
      );

      if (isCloud && supabase && user?.id) {
        try {
          await supabase.from("habit_logs").upsert(
            {
              habit_id: habitId,
              user_id: user.id,
              date,
              done: newDone,
            },
            { onConflict: "habit_id,date" }
          );
        } catch (e) {
          console.error("Failed to toggle date in Supabase:", e);
        }
        return;
      }

      // Local mode
      try {
        const { data } = await api.toggleLog(habitId, date, newDone);
        setHabits((prev) => prev.map((h) => (h.id === habitId ? data : h)));
      } catch (e) {
        console.error("Failed to toggle date in local API:", e);
      }
    },
    [isCloud, user?.id]
  );

  const reset = useCallback(async () => {
    if (isCloud && supabase && user?.id) {
      await supabase.from("habits").delete().eq("user_id", user.id);
      const { data } = await seedUserHabitsInSupabase(user.id);
      setHabits(data || []);
      return;
    }

    const { data } = await api.resetHabits();
    setHabits(data);
  }, [isCloud, user?.id]);

  return { habits, loading, error, addHabit, removeHabit, toggleDate, reset, refetch: fetchHabits };
}
