"use client";

import { motion } from "motion/react";

const personas = [
  {
    name: "Grandma",
    age: "65",
    emoji: "👵",
    desc: "Can she find the button? Does jargon confuse her?",
    color: "#f59e0b",
  },
  {
    name: "Teen",
    age: "16",
    emoji: "🧑‍💻",
    desc: "Is it fast? Does it feel modern? Mobile-first?",
    color: "#3b82f6",
  },
  {
    name: "Business",
    age: "40",
    emoji: "👔",
    desc: "Is there trust? Pricing clarity? Professional feel?",
    color: "#22c55e",
  },
  {
    name: "Screen Reader",
    age: "--",
    emoji: "♿",
    desc: "Alt text, ARIA labels, keyboard navigation",
    color: "#a855f7",
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
    <section className="mx-auto max-w-6xl px-4 py-24">
      {/* Section: Personas */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-accent">
          Who tests your site?
        </p>
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          4 AI personas, 4 perspectives
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {personas.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/40 hover:bg-card-hover"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${p.color}15` }}
              >
                {p.emoji}
              </div>
              <h3 className="mb-1 text-lg font-semibold">
                {p.name}
                <span className="ml-2 text-sm font-normal text-muted">
                  {p.age !== "--" ? `Age ${p.age}` : ""}
                </span>
              </h3>
              <p className="text-sm text-muted">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section: 8 Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-accent">
          What gets scored?
        </p>
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          8 UX pillars, weighted by impact
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all duration-300 hover:border-accent/40"
            >
              <span className="text-xl">{p.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{p.name}</p>
              </div>
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-mono text-accent">
                {p.weight}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
