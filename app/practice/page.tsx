import { getAllProblems } from "@/lib/content";
import PracticeClient from "./PracticeClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Problems — PyMastery",
  description: "Browse and filter 150+ Python problems by topic, difficulty, and tier.",
};

export default function PracticePage() {
  const problems = getAllProblems();
  return <PracticeClient problems={problems} />;
}
