import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI",
  description: "AI skills, pet projects, and autonomous agents by Risk-Flux.",
};

const AI_TOPICS = [
  {
    slug: "skills",
    title: "Skills",
    description: "Prompt engineering, RAG pipelines, model fine-tuning, and LLM orchestration patterns.",
    count: 8,
  },
  {
    slug: "pet-projects",
    title: "Pet Projects",
    description: "Hands-on AI experiments — from document chatbots to trading signal generators.",
    count: 12,
  },
  {
    slug: "agents",
    title: "Agents",
    description: "Autonomous agents, tool-use patterns, multi-agent systems, and agentic workflows.",
    count: 6,
  },
];

export default function AIPage() {
  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container">
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-label">AI</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Artificial Intelligence</h1>
          <p style={{ color: "var(--text-muted)", maxWidth: 600 }}>
            Skills, experiments, and autonomous agents at the intersection of AI and quantitative finance.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {AI_TOPICS.map((t) => (
            <Link key={t.slug} href={`/ai/${t.slug}`} style={{ textDecoration: "none" }}>
              <article className="card" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <h2 style={{ fontSize: "1rem", margin: 0 }}>{t.title}</h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.65, flex: 1 }}>
                  {t.description}
                </p>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{t.count} articles</span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
