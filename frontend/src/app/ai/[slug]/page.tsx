import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return [
    { slug: "skills" },
    { slug: "pet-projects" },
    { slug: "agents" },
  ];
}

const TOPICS: Record<string, { title: string; description: string; articles: { title: string; desc: string }[] }> = {
  skills: {
    title: "AI Skills",
    description: "Prompt engineering, RAG pipelines, model fine-tuning, and LLM orchestration patterns for quantitative finance.",
    articles: [
      { title: "Prompt Engineering for Financial Analysis", desc: "Crafting effective prompts for LLMs to analyze market data and risk reports." },
      { title: "Building RAG Pipelines for Trading Docs", desc: "Retrieval-augmented generation over research papers, trade blotters, and risk manuals." },
      { title: "Fine-Tuning LLMs on Domain Corpora", desc: "Adapting open-source models for energy trading and risk management vocabulary." },
    ],
  },
  "pet-projects": {
    title: "AI Pet Projects",
    description: "Hands-on AI experiments — from document chatbots to trading signal generators.",
    articles: [
      { title: "Document Chatbot for Risk Reports", desc: "Chat with your VaR and PnL reports using a custom RAG pipeline." },
      { title: "AI-Powered Trade Signal Generator", desc: "Combining technical indicators with LLM-based market sentiment analysis." },
      { title: "Automated Meeting Summarizer", desc: "Transcribe and summarize trading desk meetings with Whisper + GPT." },
    ],
  },
  agents: {
    title: "AI Agents",
    description: "Autonomous agents, tool-use patterns, multi-agent systems, and agentic workflows for finance.",
    articles: [
      { title: "Building a Research Agent with Tool Use", desc: "An agent that searches the web, queries databases, and generates reports autonomously." },
      { title: "Multi-Agent Systems for Trade Workflow", desc: "Coordinating specialized agents for data collection, analysis, and execution." },
      { title: "Agentic RAG for Compliance Checks", desc: "Using agents to verify trade compliance against regulatory rules." },
    ],
  },
};

export default async function AITopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPICS[slug];

  if (!topic) {
    return (
      <div style={{ padding: "4rem 0", textAlign: "center" }}>
        <h1>Topic not found</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>No AI topic matches that slug.</p>
        <Link href="/ai" className="btn btn-outline" style={{ marginTop: "1.5rem", display: "inline-flex" }}><ArrowLeft size={14} /> Back to AI</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0" }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link href="/ai" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "2rem", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to AI
        </Link>

        <h1 style={{ marginBottom: "0.5rem" }}>{topic.title}</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: 600, marginBottom: "2.5rem" }}>{topic.description}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {topic.articles.map((a) => (
            <article className="card" key={a.title}>
              <h2 style={{ fontSize: "1.0625rem", marginBottom: "0.4rem" }}>{a.title}</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>{a.desc}</p>
              <Link href={`/ai/${slug}/${a.title.toLowerCase().replace(/\s+/g, "-")}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", marginTop: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                Read more <ArrowRight size={13} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
