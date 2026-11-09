// ===========================================================================
// Match backend learning content to the user's skill gaps.
//
// Sources (both fetched from the API):
//   - recommendations  GET /api/v1/recommendations(/personalized)
//   - courses          GET /api/v1/learning/courses
//
// A skill gap is free text ("CI/CD Pipeline Setup (e.g., GitHub Actions)"),
// while the API only offers category / skill names and titles, so matching is
// done on the meaningful words they share.
// ===========================================================================

const STOPWORDS = new Set([
  "and", "or", "the", "of", "for", "with", "to", "in", "on", "an", "using", "use",
  "etc", "tools", "tool", "skills", "skill", "knowledge", "understanding", "basics",
  "fundamentals", "standards", "standard", "advanced", "setup", "platforms", "platform",
  "dedicated", "practices", "practice", "concepts", "introduction",
]);

// Short names that are still specific enough to count on their own.
const SHORT_TECH = new Set(["sql", "aws", "gcp", "git", "css", "php", "html", "ios", "vue", "c#", "c++"]);

// Broad words that appear in many unrelated skills; on their own they are weak
// evidence ("design" alone must not link "System Design" to "Fashion Design").
const GENERIC = new Set([
  "design", "system", "architecture", "development", "engineering", "management",
  "software", "learning", "course", "online", "computing", "programming", "data",
  "web", "application", "framework", "technology", "business",
]);

const MIN_SCORE = 2;

const tokenize = (text) => {
  const words = String(text || "")
    .toLowerCase()
    .replace(/\.js\b/g, "js") // node.js -> nodejs
    .replace(/[^a-z0-9+#]+/g, " ")
    .split(" ")
    .map((word) => (word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word))
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
  return [...new Set(words)];
};

const weight = (token) => {
  if (GENERIC.has(token)) return 1;
  return token.length >= 4 || SHORT_TECH.has(token) ? 2 : 1;
};

// A course in the same shape the Learn screen uses for recommendations.
export function courseToItem(course) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    url: course.externalUrl || null,
    type: "learning_resource",
    difficulty: course.difficulty,
    estimatedHours: course.estimatedHours,
    skill: { name: course.category || "" },
    provider: course.providerName || null,
    source: "course",
  };
}

export function recommendationToItem(recommendation) {
  return { ...recommendation, source: "recommendation" };
}

export function scoreItemForSkill(skill, item) {
  const wanted = tokenize(skill);
  const available = new Set(
    tokenize([item.title, item.description, item.skill?.name, item.skill?.category].join(" ")),
  );
  return wanted.reduce((sum, token) => (available.has(token) ? sum + weight(token) : sum), 0);
}

// The best matches for one skill gap, strongest first.
export function matchItemsToSkill(skill, items, limit = 3) {
  return items
    .map((item) => ({ item, score: scoreItemForSkill(skill, item) }))
    .filter(({ score }) => score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

// Items that match at least one of the skill gaps.
export function itemsMatchingAnySkill(skills, items) {
  return items.filter((item) => skills.some((skill) => scoreItemForSkill(skill, item) >= MIN_SCORE));
}
