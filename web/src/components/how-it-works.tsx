"use client";

import { motion } from "motion/react";

const steps = [
  {
    num: "01",
    title: "Enter your URL",
    desc: "Paste any website URL. We handle the rest.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI scans your site",
    desc: "Screenshots at 3 viewports. Lighthouse audit. AI analysis from 4 persona perspectives.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Get your report",
    desc: "Scored report with annotated screenshots, persona verdicts, priority fixes, and a shareable link.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-accent">
          How it works
        </p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Three steps. Zero friction.
        </h2>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent md:left-1/2 md:block" />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex items-start gap-6"
              >
                {/* Number circle */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-card text-accent">
                  {step.icon}
                </div>
                <div className="pt-1">
                  <span className="mb-1 block text-xs font-mono text-accent">{step.num}</span>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
