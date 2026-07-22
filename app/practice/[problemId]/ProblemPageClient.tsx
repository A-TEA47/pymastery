"use client";

import Link from "next/link";
import ProblemCard from "@/components/Problems/ProblemCard";
import type { Problem } from "@/lib/content";

interface ProblemPageClientProps {
  problem: Problem;
}

export default function ProblemPageClient({ problem }: ProblemPageClientProps) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <Link href="/practice" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>← Practice</Link>
        <span>›</span>
        <span>{problem.title}</span>
      </div>

      <ProblemCard problem={problem} conceptId={problem.concept_ids[0] || ""} />
    </div>
  );
}
