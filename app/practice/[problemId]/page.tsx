import { notFound } from "next/navigation";
import { getProblem } from "@/lib/content";
import ProblemPageClient from "./ProblemPageClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ problemId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { problemId } = await params;
  const problem = getProblem(problemId);
  if (!problem) return { title: "Not Found" };
  return {
    title: `${problem.title} — PyMastery Practice`,
    description: problem.prompt.slice(0, 160),
  };
}

export default async function ProblemPage({ params }: PageProps) {
  const { problemId } = await params;
  const problem = getProblem(problemId);
  if (!problem) notFound();
  return <ProblemPageClient problem={problem!} />;
}
