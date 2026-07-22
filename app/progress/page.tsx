import ProgressClient from "./ProgressClient";
import { getCurriculum } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress | PyMastery",
  description: "Track your Python learning journey, stats, and achievements.",
};

export default function ProgressPage() {
  const curriculum = getCurriculum();
  const totalConcepts = curriculum.reduce((sum, l) => sum + l.modules.reduce((s, m) => s + m.concepts.length, 0), 0);

  return <ProgressClient totalConcepts={totalConcepts} />;
}
