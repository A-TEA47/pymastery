import { notFound } from "next/navigation";
import { getConcept, getProblemsForConcept, getNextConcept } from "@/lib/content";
import ConceptPageClient from "./ConceptPageClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ level: string; module: string; concept: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { concept: conceptId } = await params;
  const concept = getConcept(conceptId);
  if (!concept) return { title: "Not Found" };

  return {
    title: `${concept.title} — PyMastery`,
    description: concept.plain_explanation.slice(0, 160),
  };
}

export default async function ConceptPage({ params }: PageProps) {
  const { concept: conceptId } = await params;
  const concept = getConcept(conceptId);

  if (!concept) {
    notFound();
  }

  const problems = getProblemsForConcept(conceptId);
  const nextConcept = getNextConcept(conceptId);

  return (
    <ConceptPageClient
      concept={concept}
      problems={problems}
      nextConcept={nextConcept}
    />
  );
}
