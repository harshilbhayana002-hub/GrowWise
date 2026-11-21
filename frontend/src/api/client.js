import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/"
});

// ── Habits ────────────────────────────────────────────────────
export const getHabits        = ()                          => api.get("/habits/");
export const createHabit      = (data)                      => api.post("/habits/", data);
export const deleteHabit      = (id)                        => api.delete(`/habits/${id}`);
export const updateHabit      = (id, data)                  => api.patch(`/habits/${id}`, data);
export const toggleLog        = (id, date, done)            => api.put(`/habits/${id}/logs/${date}`, { date, done });
export const resetHabits      = ()                          => api.post("/habits/reset");

// ── ML Analysis ────────────────────────────────────────────────
export const getAnalysis      = (id)                        => api.get(`/analysis/${id}`);
export const runAnalysis      = (habit)                     => api.post("/analysis/run", habit);
export const getSynergyMatrix = ()                          => api.get("/analysis/synergy/matrix");
export const runSynergy       = (habits)                    => api.post("/analysis/synergy/run", habits);
