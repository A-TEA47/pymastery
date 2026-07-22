import { getCurriculum } from "@/lib/content";
import CurriculumClient from "./CurriculumClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curriculum — PyMastery",
  description: "Browse the complete Python curriculum from beginner to expert. 50+ concepts, 150+ problems.",
};

export default function CurriculumPage() {
  const curriculum = getCurriculum();
  return <CurriculumClient curriculum={curriculum} />;
}
