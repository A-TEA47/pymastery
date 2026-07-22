// lib/content.ts
// YAML content loader for concepts and problems

import fs from "fs";
import path from "path";
import * as yaml from "js-yaml";

export interface Example {
  title: string;
  code: string;
  explanation: string;
}

export interface Concept {
  id: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  module: string;
  title: string;
  prerequisites: string[];
  plain_explanation: string;
  technical_explanation: string;
  examples: Example[];
  common_mistakes: string[];
  related_concepts: string[];
  estimated_minutes: number;
  problem_ids: string[];
  glossary_terms?: GlossaryTerm[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface TestCase {
  input: unknown[];
  expected: unknown;
}

export interface Problem {
  id: string;
  concept_ids: string[];
  level: "beginner" | "intermediate" | "advanced" | "expert";
  tier: "warmup" | "applied" | "challenge";
  difficulty: number;
  title: string;
  prompt: string;
  starter_code: string;
  solution_code: string;
  function_name: string;
  test_cases: TestCase[];
  hidden_test_cases: TestCase[];
  hints: string[];
  external_reference?: {
    source: string;
    title: string;
    url: string;
  };
  time_limit_minutes?: number;
  tags?: string[];
}

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllConcepts(): Concept[] {
  const dir = path.join(CONTENT_DIR, "concepts");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  return files.map((f) => {
    const content = fs.readFileSync(path.join(dir, f), "utf8");
    return yaml.load(content) as Concept;
  });
}

export function getConcept(id: string): Concept | null {
  const filePath = path.join(CONTENT_DIR, "concepts", `${id}.yaml`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.load(content) as Concept;
}

export function getAllProblems(): Problem[] {
  const dir = path.join(CONTENT_DIR, "problems");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  return files.map((f) => {
    const content = fs.readFileSync(path.join(dir, f), "utf8");
    return yaml.load(content) as Problem;
  });
}

export function getProblem(id: string): Problem | null {
  const filePath = path.join(CONTENT_DIR, "problems", `${id}.yaml`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.load(content) as Problem;
}

export function getProblemsForConcept(conceptId: string): Problem[] {
  const all = getAllProblems();
  return all.filter((p) => p.concept_ids.includes(conceptId));
}

export function getProblemsByLevel(level: string): Problem[] {
  const all = getAllProblems();
  return all.filter((p) => p.level === level);
}

export function getConceptsByLevel(level: string): Concept[] {
  const all = getAllConcepts();
  return all.filter((c) => c.level === level);
}

export function getConceptsByModule(level: string, module: string): Concept[] {
  const all = getAllConcepts();
  return all.filter((c) => c.level === level && c.module === module);
}

// Curriculum structure
export interface CurriculumLevel {
  id: string;
  title: string;
  description: string;
  modules: CurriculumModule[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  concepts: Concept[];
}

export function getCurriculum(): CurriculumLevel[] {
  const levels = [
    { id: "beginner", title: "Level 1 — Beginner", description: "Python foundations: variables, loops, functions, and more." },
    { id: "intermediate", title: "Level 2 — Intermediate", description: "OOP, decorators, generators, file I/O, and more." },
    { id: "advanced", title: "Level 3 — Advanced", description: "Algorithms, data structures, and complexity analysis." },
    { id: "expert", title: "Level 4 — Expert / Interview-Ready", description: "Advanced patterns, system design, performance, and mock interviews." },
  ];

  const allConcepts = getAllConcepts();

  return levels.map((level) => {
    const levelConcepts = allConcepts.filter((c) => c.level === level.id);

    // Group by module
    const moduleMap = new Map<string, Concept[]>();
    levelConcepts.forEach((c) => {
      if (!moduleMap.has(c.module)) moduleMap.set(c.module, []);
      moduleMap.get(c.module)!.push(c);
    });

    const modules: CurriculumModule[] = Array.from(moduleMap.entries()).map(([moduleId, concepts]) => ({
      id: moduleId,
      title: moduleId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      concepts,
    }));

    return { ...level, modules };
  });
}

// Glossary aggregation
export function getAllGlossaryTerms(): GlossaryTerm[] {
  const all = getAllConcepts();
  const terms: GlossaryTerm[] = [];
  all.forEach((c) => {
    if (c.glossary_terms) terms.push(...c.glossary_terms);
  });
  return terms.sort((a, b) => a.term.localeCompare(b.term));
}

// Next concept helper
export function getNextConcept(currentConceptId: string): Concept | null {
  const all = getAllConcepts();
  const levelOrder = ["beginner", "intermediate", "advanced", "expert"];

  const current = all.find((c) => c.id === currentConceptId);
  if (!current) return null;

  const sameLevelConcepts = all.filter((c) => c.level === current.level);
  const currentIdx = sameLevelConcepts.findIndex((c) => c.id === currentConceptId);

  if (currentIdx < sameLevelConcepts.length - 1) {
    return sameLevelConcepts[currentIdx + 1];
  }

  // Move to next level
  const currentLevelIdx = levelOrder.indexOf(current.level);
  if (currentLevelIdx < levelOrder.length - 1) {
    const nextLevel = levelOrder[currentLevelIdx + 1];
    const nextLevelConcepts = all.filter((c) => c.level === nextLevel);
    return nextLevelConcepts[0] || null;
  }

  return null;
}
