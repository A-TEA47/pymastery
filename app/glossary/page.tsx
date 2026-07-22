import { getAllGlossaryTerms } from "@/lib/content";
import GlossaryClient from "./GlossaryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python Glossary — PyMastery",
  description: "Searchable Python glossary — look up any term from variables to metaclasses.",
};

export default function GlossaryPage() {
  const terms = getAllGlossaryTerms();
  return <GlossaryClient terms={terms} />;
}
