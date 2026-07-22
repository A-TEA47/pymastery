import { getCurriculum } from "@/lib/content";
import DashboardClient from "./DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PyMastery — Learn Python from Beginner to Expert",
  description: "Your personal Python learning platform with in-browser code execution, auto-graded problems, and progress tracking.",
};

export default function HomePage() {
  const curriculum = getCurriculum();
  return <DashboardClient curriculum={curriculum} />;
}
