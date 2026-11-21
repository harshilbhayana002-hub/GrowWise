import React, { useState, useRef } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useHabits } from "./hooks/useHabits.js";
import { useML } from "./hooks/useML.js";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import InteractiveWidget from "./components/InteractiveWidget.jsx";
import AddGoalModal from "./components/AddGoalModal.jsx";
import AuthModal from "./components/AuthModal.jsx";
import MLDashboard from "./components/MLDashboard.jsx";
import GoalLifecycleManager from "./components/GoalLifecycleManager.jsx";
import CorrelationMatrix from "./components/CorrelationMatrix.jsx";
import FeaturesPage from "./components/FeaturesPage.jsx";

export default function App() {
  const { user, profile, signIn, signUp, signOut, isConfigured } = useAuth();
  const { habits, loading, error, addHabit, removeHabit, toggleDate, reset } = useHabits(user);
  const [activeId, setActiveId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("Product"); // "Product" | "Features"
  const analyticsRef = useRef(null);

  // Default active habit
  const resolvedId = activeId ?? habits[0]?.id ?? null;
  const activeHabit = habits.find((h) => h.id === resolvedId);

  // ML data from backend
  const { ml, synergy, mlLoading, mlError } = useML(resolvedId, habits);

  const today = new Date().toISOString().split("T")[0];

  const scrollToAnalytics = () => {
    if (analyticsRef.current) {
      analyticsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteHabit = async (id) => {
    await removeHabit(id);
    if (resolvedId === id) {
      const remaining = habits.filter((h) => h.id !== id);
      setActiveId(remaining[0]?.id ?? null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #070b14;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: #070b14; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 75% 25%, rgba(14, 165, 233, 0.14) 0%, transparent 45%), radial-gradient(circle at 15% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 40%), #070b14",
        position: "relative",
      }}>

        {/* ── Top Navigation Bar with Supabase Auth ── */}
        <Navbar
          user={user}
          profile={profile}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          onOpenAddModal={() => setAddModalOpen(true)}
          onSignOut={signOut}
          activeTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* ── Cloud Mode Status Notice Banner ── */}
        <div style={{
          maxWidth: 1240,
          margin: "12px auto 0",
          padding: "0 32px",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <div style={{
            fontSize: 11,
            fontFamily: "monospace",
            color: isConfigured ? "#4ade80" : "#94a3b8",
            background: isConfigured ? "rgba(34, 197, 94, 0.08)" : "rgba(30, 41, 59, 0.4)",
            border: isConfigured ? "1px solid rgba(34, 197, 94, 0.25)" : "1px solid rgba(255, 255, 255, 0.06)",
            padding: "4px 12px",
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isConfigured ? "#22c55e" : "#38bdf8" }} />
            {isConfigured
              ? user
                ? `Supabase Connected: ${user.email}`
                : "Supabase Database Ready · Sign In to save online"
              : "Local DB Active (Add Supabase URL/Key to .env for Cloud Sync)"}
          </div>
        </div>

        {/* ── Error Banner if Backend is offline ── */}
        {error && !isConfigured && (
          <div style={{
            maxWidth: 1200,
            margin: "16px auto 0",
            padding: "12px 20px",
            background: "rgba(127, 29, 29, 0.3)",
            border: "1px solid #7f1d1d",
            borderRadius: 12,
            fontSize: 13,
            color: "#fca5a5",
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#7f1d1d",
                color: "#fff",
                border: "none",
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── View Switcher: Features Page vs Main Dashboard ── */}
        {currentTab === "Features" ? (
          <FeaturesPage
            habits={habits}
            activeHabit={activeHabit}
            ml={ml}
            synergy={synergy}
            onSelectHabit={setActiveId}
            onNavigateToDashboard={() => setCurrentTab("Product")}
          />
        ) : (
          <>
            {/* ── Hero & Live Operator Widget Section ── */}
            <main style={{
              maxWidth: 1240,
              margin: "0 auto",
              padding: "40px 32px 80px",
            }}>
              {loading ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "60vh",
                  color: "#64748b",
                  fontFamily: "monospace",
                  fontSize: 14,
                }}>
                  Loading AI operator environment…
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                  gap: 48,
                  alignItems: "center",
                }}>
                  {/* Left Column: Hero Copy & Controls */}
                  <HeroSection
                    habits={habits}
                    activeHabitId={resolvedId}
                    onSelectHabit={setActiveId}
                    onOpenAddModal={() => setAddModalOpen(true)}
                    onScrollToAnalytics={scrollToAnalytics}
                  />

                  {/* Right Column: Live Interactive Widget Matching Screenshot */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <InteractiveWidget
                      habits={habits}
                      activeHabit={activeHabit}
                      onSelectHabit={setActiveId}
                      onToggleDate={(id, date, cur) => toggleDate(id, date, cur)}
                      onOpenAddModal={() => setAddModalOpen(true)}
                      onDeleteHabit={handleDeleteHabit}
                      ml={ml}
                      synergy={synergy}
                      todayStr={today}
                    />
                  </div>
                </div>
              )}
            </main>

            {/* ── Deep Analytics & ML Behavioral Intelligence ── */}
            <section
              ref={analyticsRef}
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.07)",
                background: "rgba(10, 15, 29, 0.95)",
                backdropFilter: "blur(20px)",
                padding: "60px 32px 100px",
              }}
            >
              <div style={{ maxWidth: 1240, margin: "0 auto" }}>
                <div style={{ marginBottom: 36 }}>
                  <div style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#38bdf8",
                    letterSpacing: 2,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}>
                    ML-POWERED BEHAVIORAL PATTERN ENGINE
                  </div>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc" }}>
                    Deep Behavioral Intelligence: {activeHabit?.name || "Habit Analysis"}
                  </h2>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                    Real-time algorithm pipeline: K-Means++ week archetypes, CUSUM shift points, Logistic Regression next-day forecast, and Pearson cross-habit synergy.
                  </p>
                </div>

                {activeHabit ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <MLDashboard
                      habit={activeHabit}
                      ml={ml}
                      mlLoading={mlLoading}
                      mlError={mlError}
                      onToggleDate={(date, cur) => toggleDate(activeHabit.id, date, cur)}
                      onDeleteHabit={handleDeleteHabit}
                    />

                    {/* Habit Synergy Matrix Card */}
                    {synergy && synergy.length > 0 && (
                      <div style={{
                        background: "#0d1117",
                        border: "1px solid #1e293b",
                        borderRadius: 14,
                        padding: "20px 22px",
                      }}>
                        <div style={{
                          fontSize: 10,
                          fontFamily: "monospace",
                          color: "#475569",
                          letterSpacing: 2,
                          marginBottom: 14,
                          textTransform: "uppercase",
                        }}>
                          Pearson Synergy Matrix · Multi-Habit Cross Correlation
                        </div>
                        <CorrelationMatrix habits={habits} pairs={synergy} />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* ── Dedicated Goal Lifecycle & Management Analytics Section ── */}
                <GoalLifecycleManager
                  habits={habits}
                  activeHabitId={resolvedId}
                  onSelectHabit={setActiveId}
                  onDeleteHabit={handleDeleteHabit}
                  onOpenAddModal={() => setAddModalOpen(true)}
                  todayStr={today}
                />

              </div>
            </section>
          </>
        )}

        {/* ── Add Goal Modal ── */}
        <AddGoalModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdd={addHabit}
        />

        {/* ── Auth Modal (Sign In / Sign Up) ── */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSignIn={signIn}
          onSignUp={signUp}
          isConfigured={isConfigured}
        />
      </div>
    </>
  );
}
