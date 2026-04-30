"use client";

import { motion } from "motion/react";

const personas = [
  {
    name: "Grandma",
    age: "65",
    emoji: "👵",
    desc: "Can she find the button? Does jargon confuse her? Is the text big enough?",
    color: "#f59e0b",
    bg: "from-amber-500/10 to-amber-500/5",
  },
  {
    name: "Teen",
    age: "16",
    emoji: "🧑‍💻",
    desc: "Is it fast enough? Does it feel modern? Works on mobile?",
    color: "#3b82f6",
    bg: "from-blue-500/10 to-blue-500/5",
  },
  {
    name: "Business User",
    age: "40",
    emoji: "👔",
    desc: "Is there trust? Pricing clarity? Professional design?",
    color: "#22c55e",
    bg: "from-emerald-500/10 to-emerald-500/5",
  },
  {
    name: "Screen Reader",
    age: "--",
    emoji: "♿",
    desc: "Alt text on images? ARIA labels? Keyboard navigable?",
    color: "#a855f7",
    bg: "from-purple-500/10 to-purple-500/5",
  },
];

const pillars = [
  { name: "First Impression", weight: "15%", icon: "👁" },
  { name: "Navigation", weight: "15%", icon: "🧭" },
  { name: "Forms & Inputs", weight: "15%", icon: "📝" },
  { name: "Trust & Credibility", weight: "10%", icon: "🛡" },
  { name: "Mobile Responsive", weight: "15%", icon: "📱" },
  { name: "Performance", weight: "10%", icon: "⚡" },
  { name: "Accessibility", weight: "10%", icon: "♿" },
  { name: "Copy & Clarity", weight: "10%", icon: "✍️" },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      {/* Personas */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-28"
      >
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Who tests your site
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-5xl">
          4 AI personas, 4 perspectives
        </h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-lg text-muted">
          Your site gets evaluated by users who think completely differently from you.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group rounded-2xl border border-border bg-gradient-to-b ${p.bg} p-7 transition-all duration-300 hover:border-[${p.color}]/30 hover:translate-y-[-4px]`}
            >
              <div className="mb-5 text-4xl">{p.emoji}</div>
              <h3 className="mb-1 text-lg font-bold">
                {p.name}
                {p.age !== "--" && (
                  <span className="ml-2 text-sm font-normal text-muted">Age {p.age}</span>
                )}
              </h3>
              <p className="text-[15px] leading-relaxed text-muted">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 8 Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          What gets scored
        </p>
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-5xl">
          8 UX pillars, weighted by impact
        </h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-lg text-muted">
          Each pillar is scored 0-10 and weighted based on how much it affects user experience.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex items-center gap-4 rounded-xl glass-card px-5 py-4 transition-all duration-300 hover:border-accent/20"
            >
              <span className="text-2xl">{p.icon}</span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">{p.name}</p>
              </div>
              <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold font-mono text-accent">
                {p.weight}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
