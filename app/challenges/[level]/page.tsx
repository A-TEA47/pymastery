import { getProblemsByLevel, getCurriculum } from "@/lib/content";
import ChallengesClient from "./ChallengesClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ level: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  return {
    title: `${level.charAt(0).toUpperCase() + level.slice(1)} Boss Challenge — PyMastery`,
    description: `End-of-level boss problems for ${level}`,
  };
}

export default async function ChallengesPage({ params }: PageProps) {
  const { level } = await params;
  const problems = getProblemsByLevel(level).filter((p) => p.tier === "challenge");
  return <ChallengesClient level={level} problems={problems} />;
}
