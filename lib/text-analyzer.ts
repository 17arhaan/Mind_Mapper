// Advanced text analysis library for mind map generation

// Types for our analysis results
export type Detail = {
  name: string
  relation: string
}

export type Subtopic = {
  name: string
  relation: string
  details: Detail[]
}

export type Topic = {
  name: string
  relation: string
  subtopics: Subtopic[]
}

export type AnalysisResult = {
  mainConcept: string
  promptType: string
  topics: Topic[]
}

// Common stop words to filter out
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "from",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "can",
  "will",
  "just",
  "should",
  "now",
  "also",
  "very",
  "often",
  "however",
  "almost",
  "although",
  "always",
  "among",
  "anyone",
  "anything",
  "anywhere",
  "are",
  "around",
  "because",
  "been",
  "before",
  "being",
  "both",
  "did",
  "does",
  "doing",
  "done",
  "else",
  "ever",
  "every",
  "get",
  "gets",
  "getting",
  "got",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "its",
  "itself",
  "just",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "would",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
])

// Relation types for different concept relationships
const RELATIONS = {
  DEFINITION: ["is defined as", "refers to", "means", "is", "represents"],
  COMPOSITION: ["consists of", "contains", "includes", "comprises", "made up of"],
  EXAMPLE: ["for example", "such as", "like", "including", "e.g."],
  CAUSE_EFFECT: ["causes", "leads to", "results in", "produces", "affects"],
  SEQUENCE: ["first", "then", "next", "finally", "followed by"],
  COMPARISON: ["compared to", "versus", "unlike", "similar to", "different from"],
  FUNCTION: ["used for", "serves to", "functions as", "enables", "helps with"],
  CHARACTERISTIC: ["characterized by", "features", "qualities", "attributes", "properties"],
  REQUIREMENT: ["requires", "needs", "depends on", "necessary for", "essential for"],
  APPLICATION: ["applied to", "used in", "implemented in", "utilized for", "practiced in"],
}

// Domain-specific keywords for topic detection
const DOMAIN_KEYWORDS = {
  TECHNOLOGY: [
    "software",
    "hardware",
    "computer",
    "digital",
    "internet",
    "code",
    "programming",
    "algorithm",
    "data",
    "network",
    "system",
    "application",
    "technology",
    "web",
    "online",
    "device",
    "electronic",
    "virtual",
    "cyber",
    "tech",
  ],
  SCIENCE: [
    "science",
    "scientific",
    "research",
    "experiment",
    "theory",
    "hypothesis",
    "laboratory",
    "chemical",
    "biology",
    "physics",
    "chemistry",
    "molecule",
    "atom",
    "cell",
    "organism",
    "reaction",
    "element",
    "compound",
  ],
  MATH: [
    "mathematics",
    "equation",
    "formula",
    "calculation",
    "algebra",
    "geometry",
    "calculus",
    "theorem",
    "proof",
    "number",
    "variable",
    "function",
    "graph",
    "coordinate",
    "value",
    "solve",
    "solution",
  ],
  BUSINESS: [
    "business",
    "company",
    "corporation",
    "market",
    "finance",
    "economy",
    "investment",
    "profit",
    "loss",
    "revenue",
    "customer",
    "client",
    "product",
    "service",
    "management",
    "strategy",
    "marketing",
    "sales",
  ],
  EDUCATION: [
    "education",
    "learning",
    "teaching",
    "student",
    "teacher",
    "school",
    "university",
    "college",
    "course",
    "curriculum",
    "study",
    "knowledge",
    "skill",
    "training",
    "academic",
    "classroom",
    "lecture",
    "lesson",
  ],
  HEALTH: [
    "health",
    "medical",
    "medicine",
    "disease",
    "treatment",
    "therapy",
    "doctor",
    "patient",
    "hospital",
    "clinic",
    "symptom",
    "diagnosis",
    "cure",
    "healthcare",
    "wellness",
    "illness",
    "condition",
    "syndrome",
  ],
  ARTS: [
    "art",
    "music",
    "literature",
    "painting",
    "sculpture",
    "dance",
    "theater",
    "film",
    "creative",
    "artistic",
    "culture",
    "design",
    "performance",
    "visual",
    "aesthetic",
    "composition",
    "style",
    "genre",
  ],
  PHILOSOPHY: [
    "philosophy",
    "ethics",
    "logic",
    "metaphysics",
    "epistemology",
    "existence",
    "reality",
    "knowledge",
    "truth",
    "belief",
    "concept",
    "idea",
    "thought",
    "mind",
    "consciousness",
    "reason",
    "rational",
  ],
  HISTORY: [
    "history",
    "historical",
    "past",
    "ancient",
    "medieval",
    "modern",
    "century",
    "era",
    "period",
    "civilization",
    "culture",
    "society",
    "event",
    "war",
    "revolution",
    "movement",
    "empire",
    "kingdom",
  ],
  SPORTS: [
    "sport",
    "game",
    "competition",
    "athlete",
    "team",
    "player",
    "coach",
    "tournament",
    "championship",
    "match",
    "race",
    "score",
    "win",
    "lose",
    "play",
    "training",
    "fitness",
    "exercise",
  ],
}

// Prompt type patterns
const PROMPT_PATTERNS = {
  HOW_TO: [
    /how\s+(?:to|do|can|would|should|could)\s+(\w+)/i,
    /steps?\s+(?:to|for|in)\s+(\w+)/i,
    /guide\s+(?:to|for|on)\s+(\w+)/i,
    /process\s+(?:of|for)\s+(\w+)/i,
    /method\s+(?:for|of)\s+(\w+)/i,
    /ways?\s+to\s+(\w+)/i,
    /instructions?\s+(?:for|on|to)\s+(\w+)/i,
  ],
  CONCEPT: [
    /what\s+(?:is|are)\s+(?:a|an|the)?\s*(\w+)/i,
    /define\s+(?:a|an|the)?\s*(\w+)/i,
    /explain\s+(?:the|a|an)?\s*(\w+)/i,
    /describe\s+(?:the|a|an)?\s*(\w+)/i,
    /meaning\s+of\s+(\w+)/i,
    /concept\s+of\s+(\w+)/i,
  ],
  FORMULA: [
    /formula\s+(?:for|of)\s+(\w+)/i,
    /equation\s+(?:for|of)\s+(\w+)/i,
    /calculate\s+(\w+)/i,
    /compute\s+(\w+)/i,
    /(\w+)\s*=\s*[\w+\-*/$$$$]+/i,
    /how\s+(?:to|do|can|would|should|could)\s+(?:calculate|compute|find)\s+(\w+)/i,
  ],
  COMPARISON: [
    /(?:compare|comparison|versus|vs\.?|difference\s+between)\s+(\w+)\s+(?:and|to|with|vs\.?)\s+(\w+)/i,
    /(\w+)\s+(?:versus|vs\.?|or|compared\s+(?:to|with))\s+(\w+)/i,
    /(?:similarities|differences)\s+(?:between|of)\s+(\w+)\s+(?:and|to|with)\s+(\w+)/i,
    /(?:pros|cons|advantages|disadvantages)\s+of\s+(\w+)\s+(?:and|versus|vs\.?|compared\s+to)\s+(\w+)/i,
  ],
  PROBLEM_SOLUTION: [
    /(?:how\s+to\s+(?:fix|solve|resolve|address|handle|deal\s+with))\s+(\w+)/i,
    /(?:fix|solve|resolve|address|handle|deal\s+with)\s+(?:a|an|the)?\s*(\w+)/i,
    /(?:solution|approach|remedy|cure|treatment)\s+(?:for|to)\s+(\w+)/i,
    /(?:problem|issue|trouble|difficulty|challenge)\s+(?:with|of|in)\s+(\w+)/i,
    /(?:troubleshoot|debug|repair)\s+(?:a|an|the)?\s*(\w+)/i,
  ],
  LIST: [
    /(?:list|types|kinds|examples|varieties)\s+of\s+(\w+)/i,
    /(?:what|which)\s+(?:are|is)\s+(?:the|some)?\s*(?:types|kinds|examples|varieties)\s+of\s+(\w+)/i,
  ],
  CAUSE_EFFECT: [
    /(?:causes|effects|impacts|results|consequences|implications)\s+of\s+(\w+)/i,
    /(?:why|how)\s+(?:does|do|is|are)\s+(\w+)/i,
    /(?:what|how)\s+(?:causes|affects|influences|impacts|results\s+in)\s+(\w+)/i,
  ],
}

// Main function to analyze text and generate mind map structure
export function analyzeText(text: string): AnalysisResult {
  // Clean and normalize the text
  const cleanText = text.trim()

  // Extract sentences for better context analysis
  const sentences = extractSentences(cleanText)

  // Determine the type of prompt
  const promptType = identifyPromptType(cleanText)

  // Extract the main concept based on the prompt type
  const mainConcept = extractMainConcept(cleanText, promptType)

  // Extract key topics and their relationships based on prompt type
  const topics = extractTopics(cleanText, mainConcept, promptType, sentences)

  return {
    mainConcept,
    promptType,
    topics,
  }
}

// Extract sentences from text
function extractSentences(text: string): string[] {
  // Handle common abbreviations to avoid false sentence breaks
  const preparedText = text
    .replace(/Mr\./g, "Mr")
    .replace(/Mrs\./g, "Mrs")
    .replace(/Dr\./g, "Dr")
    .replace(/Ph\.D\./g, "PhD")
    .replace(/i\.e\./g, "ie")
    .replace(/e\.g\./g, "eg")
    .replace(/vs\./g, "vs")
    .replace(/etc\./g, "etc")
    .replace(/(\w)\.(\s+[a-z])/g, "$1$2") // Fix for sentences starting with lowercase

  // Split by sentence-ending punctuation followed by space and capital letter
  return preparedText
    .split(/[.!?]+\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Identify the type of prompt
function identifyPromptType(text: string): string {
  const lowerText = text.toLowerCase()

  // Check each pattern type
  for (const [type, patterns] of Object.entries(PROMPT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return type
      }
    }
  }

  // Check for domain-specific keywords to help determine type
  const words = tokenize(lowerText)
  const domainCounts: Record<string, number> = {}

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    domainCounts[domain] = 0
    for (const word of words) {
      if (keywords.includes(word)) {
        domainCounts[domain]++
      }
    }
  }

  // Find the domain with the most matches
  let topDomain = ""
  let maxCount = 0
  for (const [domain, count] of Object.entries(domainCounts)) {
    if (count > maxCount) {
      maxCount = count
      topDomain = domain
    }
  }

  // Map domains to likely prompt types
  if (maxCount > 0) {
    switch (topDomain) {
      case "MATH":
        return "FORMULA"
      case "TECHNOLOGY":
      case "BUSINESS":
        return lowerText.includes("how") ? "HOW_TO" : "CONCEPT"
      case "HEALTH":
        return lowerText.includes("treat") || lowerText.includes("cure") ? "PROBLEM_SOLUTION" : "CONCEPT"
      default:
        return "CONCEPT"
    }
  }

  // Default to concept explanation
  return "CONCEPT"
}

// Extract the main concept from the prompt
function extractMainConcept(text: string, promptType: string): string {
  const lowerText = text.toLowerCase()

  // Try to extract the main concept based on prompt type patterns
  const patterns = PROMPT_PATTERNS[promptType as keyof typeof PROMPT_PATTERNS] || []

  for (const pattern of patterns) {
    const match = lowerText.match(pattern)
    if (match && match[1]) {
      // Extract a bit more context around the match
      const mainTerm = match[1]
      const contextPattern = new RegExp(`(\\w+\\s+){0,2}${mainTerm}(\\s+\\w+){0,3}`, "i")
      const contextMatch = text.match(contextPattern)

      if (contextMatch) {
        return capitalizePhrase(contextMatch[0].trim())
      }

      return capitalizePhrase(mainTerm)
    }
  }

  // If no pattern match, try to extract a title-like phrase
  const titleMatch = text.match(
    /^(?:what\s+(?:is|are)|how\s+to|define|explain)?\s*(?:the|a|an)?\s*([A-Z][a-z]+(?:\s+[a-z|A-Z]\w+){0,4})/,
  )
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim()
  }

  // Extract the most important noun phrases
  const nounPhrases = extractNounPhrases(text)
  if (nounPhrases.length > 0) {
    return capitalizePhrase(nounPhrases[0])
  }

  // Fallback to first few words
  const words = text.split(/\s+/)
  return capitalizePhrase(words.slice(0, Math.min(5, words.length)).join(" "))
}

// Extract topics based on prompt type
function extractTopics(text: string, mainConcept: string, promptType: string, sentences: string[]): Topic[] {
  const lowerText = text.toLowerCase()
  const mainConceptLower = mainConcept.toLowerCase()

  // Extract keywords and phrases
  const keywords = extractKeywords(text, 15)
  const phrases = extractNounPhrases(text)

  // Generate topics based on prompt type
  switch (promptType) {
    case "HOW_TO":
      return generateHowToTopics(text, mainConcept, sentences)
    case "FORMULA":
      return generateFormulaTopics(text, mainConcept, sentences)
    case "COMPARISON":
      return generateComparisonTopics(text, mainConcept, sentences)
    case "PROBLEM_SOLUTION":
      return generateProblemSolutionTopics(text, mainConcept, sentences)
    case "LIST":
      return generateListTopics(text, mainConcept, keywords, phrases)
    case "CAUSE_EFFECT":
      return generateCauseEffectTopics(text, mainConcept, sentences)
    case "CONCEPT":
    default:
      return generateConceptTopics(text, mainConcept, keywords, phrases, sentences)
  }
}

// Generate topics for "How To" prompts
function generateHowToTopics(text: string, mainConcept: string, sentences: string[]): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()

  // Try to extract explicit steps
  const explicitSteps = extractExplicitSteps(text)

  if (explicitSteps.length >= 2) {
    // Use explicit steps if found
    topics.push({
      name: "Steps",
      relation: "requires",
      subtopics: explicitSteps.map((step, index) => ({
        name: `Step ${index + 1}: ${step}`,
        relation: index === 0 ? "start with" : index === explicitSteps.length - 1 ? "finish with" : "then",
        details: generateStepDetails(step, index),
      })),
    })
  } else {
    // Generate logical steps based on the task
    const taskType = identifyTaskType(text)
    const steps = generateLogicalSteps(taskType)

    topics.push({
      name: "Process",
      relation: "follows",
      subtopics: steps.map((step, index) => ({
        name: step.name,
        relation: step.relation,
        details: step.details,
      })),
    })
  }

  // Add requirements/materials
  topics.push({
    name: "Requirements",
    relation: "needs",
    subtopics: generateRequirements(text, mainConcept),
  })

  // Add tips/best practices
  topics.push({
    name: "Best Practices",
    relation: "considers",
    subtopics: generateTipsAndPractices(text, mainConcept),
  })

  // Add common challenges/troubleshooting
  topics.push({
    name: "Challenges",
    relation: "may face",
    subtopics: generateChallenges(text, mainConcept),
  })

  // Add benefits/outcomes
  topics.push({
    name: "Benefits",
    relation: "results in",
    subtopics: generateBenefits(text, mainConcept),
  })

  return topics
}

// Generate topics for concept explanation prompts
function generateConceptTopics(
  text: string,
  mainConcept: string,
  keywords: string[],
  phrases: string[],
  sentences: string[],
): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()
  const mainConceptLower = mainConcept.toLowerCase()

  // Add definition
  topics.push({
    name: "Definition",
    relation: "is defined as",
    subtopics: [
      {
        name: extractDefinition(text, mainConcept, sentences),
        relation: "meaning",
        details: [
          { name: "Core concept", relation: "refers to" },
          { name: "In simple terms", relation: "means" },
        ],
      },
    ],
  })

  // Add components/elements
  const components = extractComponents(text, mainConcept, keywords, phrases)
  if (components.length > 0) {
    topics.push({
      name: "Components",
      relation: "consists of",
      subtopics: components.map((comp) => ({
        name: comp,
        relation: "part of",
        details: [
          { name: `Role in ${mainConcept}`, relation: "serves as" },
          { name: "Key characteristics", relation: "features" },
        ],
      })),
    })
  }

  // Add examples
  topics.push({
    name: "Examples",
    relation: "such as",
    subtopics: generateExamples(text, mainConcept, keywords, phrases).map((example) => ({
      name: example,
      relation: "illustrates",
      details: [
        { name: "Key features", relation: "demonstrates" },
        { name: "Application", relation: "used in" },
      ],
    })),
  })

  // Add applications/uses
  topics.push({
    name: "Applications",
    relation: "used for",
    subtopics: generateApplications(text, mainConcept, keywords).map((app) => ({
      name: app,
      relation: "applied in",
      details: [
        { name: "Benefits", relation: "provides" },
        { name: "Implementation", relation: "requires" },
      ],
    })),
  })

  // Add advantages/benefits
  topics.push({
    name: "Advantages",
    relation: "provides",
    subtopics: generateAdvantages(text, mainConcept).map((adv) => ({
      name: adv,
      relation: "offers",
      details: [{ name: "Impact", relation: "results in" }],
    })),
  })

  // Add limitations/challenges
  topics.push({
    name: "Limitations",
    relation: "constrained by",
    subtopics: generateLimitations(text, mainConcept).map((lim) => ({
      name: lim,
      relation: "faces",
      details: [{ name: "Workarounds", relation: "can be addressed by" }],
    })),
  })

  return topics
}

// Generate topics for formula/equation prompts
function generateFormulaTopics(text: string, mainConcept: string, sentences: string[]): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()

  // Extract formula if present
  const formula = extractFormula(text)

  // Add the formula itself
  topics.push({
    name: "Formula",
    relation: "expressed as",
    subtopics: [
      {
        name: formula || "Mathematical expression",
        relation: "written as",
        details: [
          { name: "Standard form", relation: "represented by" },
          { name: "Alternative forms", relation: "also written as" },
        ],
      },
    ],
  })

  // Add variables/parameters
  const variables = extractVariables(text, formula)
  if (variables.length > 0) {
    topics.push({
      name: "Variables",
      relation: "uses",
      subtopics: variables.map((variable) => ({
        name: variable.name,
        relation: "where",
        details: [
          { name: variable.description, relation: "represents" },
          { name: variable.units || "Units/dimensions", relation: "measured in" },
        ],
      })),
    })
  }

  // Add calculation steps
  topics.push({
    name: "Calculation Steps",
    relation: "solved by",
    subtopics: generateCalculationSteps(text, formula).map((step, index) => ({
      name: `Step ${index + 1}: ${step}`,
      relation: index === 0 ? "start with" : "then",
      details: [{ name: "Key consideration", relation: "note that" }],
    })),
  })

  // Add applications
  topics.push({
    name: "Applications",
    relation: "applied in",
    subtopics: generateFormulaApplications(text, mainConcept).map((app) => ({
      name: app,
      relation: "used for",
      details: [{ name: "Example scenario", relation: "such as" }],
    })),
  })

  // Add limitations/constraints
  topics.push({
    name: "Constraints",
    relation: "valid when",
    subtopics: generateFormulaConstraints(text).map((constraint) => ({
      name: constraint,
      relation: "requires",
      details: [{ name: "Implications", relation: "means that" }],
    })),
  })

  return topics
}

// Generate topics for comparison prompts
function generateComparisonTopics(text: string, mainConcept: string, sentences: string[]): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()

  // Extract the items being compared
  const comparisonItems = extractComparisonItems(text)

  // Add the items being compared
  topics.push({
    name: comparisonItems.item1,
    relation: "compared with",
    subtopics: [
      {
        name: "Key characteristics",
        relation: "defined by",
        details: [
          { name: "Primary feature", relation: "known for" },
          { name: "Core strength", relation: "excels in" },
        ],
      },
    ],
  })

  topics.push({
    name: comparisonItems.item2,
    relation: "compared with",
    subtopics: [
      {
        name: "Key characteristics",
        relation: "defined by",
        details: [
          { name: "Primary feature", relation: "known for" },
          { name: "Core strength", relation: "excels in" },
        ],
      },
    ],
  })

  // Add similarities
  topics.push({
    name: "Similarities",
    relation: "shared aspects",
    subtopics: generateSimilarities(text, comparisonItems).map((similarity) => ({
      name: similarity,
      relation: "both have",
      details: [{ name: "Significance", relation: "important because" }],
    })),
  })

  // Add differences
  topics.push({
    name: "Differences",
    relation: "distinctions",
    subtopics: generateDifferences(text, comparisonItems).map((diff) => ({
      name: diff,
      relation: "contrast in",
      details: [{ name: "Impact", relation: "affects" }],
    })),
  })

  // Add use cases
  topics.push({
    name: "Use Cases",
    relation: "when to use",
    subtopics: [
      {
        name: `When to use ${comparisonItems.item1}`,
        relation: "prefer when",
        details: [{ name: "Ideal scenario", relation: "best for" }],
      },
      {
        name: `When to use ${comparisonItems.item2}`,
        relation: "prefer when",
        details: [{ name: "Ideal scenario", relation: "best for" }],
      },
    ],
  })

  return topics
}

// Generate topics for problem-solution prompts
function generateProblemSolutionTopics(text: string, mainConcept: string, sentences: string[]): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()

  // Extract the problem
  const problem = extractProblem(text, mainConcept)

  // Add causes
  topics.push({
    name: "Causes",
    relation: "caused by",
    subtopics: generateCauses(text, problem).map((cause) => ({
      name: cause,
      relation: "leads to",
      details: [{ name: "Contributing factors", relation: "influenced by" }],
    })),
  })

  // Add symptoms/signs
  topics.push({
    name: "Symptoms",
    relation: "manifests as",
    subtopics: generateSymptoms(text, problem).map((symptom) => ({
      name: symptom,
      relation: "indicated by",
      details: [{ name: "Severity indicator", relation: "suggests" }],
    })),
  })

  // Add solutions
  topics.push({
    name: "Solutions",
    relation: "resolved by",
    subtopics: generateSolutions(text, problem).map((solution, index) => ({
      name: solution,
      relation: index === 0 ? "best approach" : "alternative",
      details: [
        { name: "Implementation steps", relation: "requires" },
        { name: "Expected outcome", relation: "results in" },
      ],
    })),
  })

  // Add prevention
  topics.push({
    name: "Prevention",
    relation: "avoided by",
    subtopics: generatePrevention(text, problem).map((prevention) => ({
      name: prevention,
      relation: "helps prevent",
      details: [{ name: "Best practice", relation: "follow" }],
    })),
  })

  // Add long-term strategies
  topics.push({
    name: "Long-term Strategies",
    relation: "managed with",
    subtopics: generateLongTermStrategies(text, problem).map((strategy) => ({
      name: strategy,
      relation: "involves",
      details: [{ name: "Key benefit", relation: "provides" }],
    })),
  })

  return topics
}

// Generate topics for list prompts
function generateListTopics(text: string, mainConcept: string, keywords: string[], phrases: string[]): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()

  // Extract list items
  const listItems = extractListItems(text, mainConcept)

  // Group list items into categories
  const categories = categorizeListItems(listItems)

  // Add each category as a topic
  for (const [category, items] of Object.entries(categories)) {
    topics.push({
      name: category,
      relation: "includes",
      subtopics: items.map((item) => ({
        name: item,
        relation: "example of",
        details: [
          { name: "Key characteristics", relation: "features" },
          { name: "Common use", relation: "used for" },
        ],
      })),
    })
  }

  // Add overview/definition
  topics.push({
    name: "Overview",
    relation: "describes",
    subtopics: [
      {
        name: extractDefinition(text, mainConcept, extractSentences(text)),
        relation: "defines",
        details: [
          { name: "Importance", relation: "matters because" },
          { name: "Context", relation: "relevant to" },
        ],
      },
    ],
  })

  // Add selection criteria
  topics.push({
    name: "Selection Criteria",
    relation: "chosen by",
    subtopics: generateSelectionCriteria(text, mainConcept).map((criteria) => ({
      name: criteria,
      relation: "consider",
      details: [{ name: "Impact on choice", relation: "affects" }],
    })),
  })

  return topics
}

// Generate topics for cause-effect prompts
function generateCauseEffectTopics(text: string, mainConcept: string, sentences: string[]): Topic[] {
  const topics: Topic[] = []
  const lowerText = text.toLowerCase()

  // Determine if we're focusing on causes or effects
  const isCauseFocused = lowerText.includes("cause") || lowerText.includes("why") || lowerText.includes("lead to")
  const isEffectFocused = lowerText.includes("effect") || lowerText.includes("impact") || lowerText.includes("result")

  // Add causes
  topics.push({
    name: "Causes",
    relation: isCauseFocused ? "primary focus" : "lead to",
    subtopics: generateDetailedCauses(text, mainConcept).map((cause, index) => ({
      name: cause,
      relation: index === 0 ? "main reason" : "also contributes",
      details: [
        { name: "Mechanism", relation: "works by" },
        { name: "Contributing factors", relation: "influenced by" },
      ],
    })),
  })

  // Add effects
  topics.push({
    name: "Effects",
    relation: isEffectFocused ? "primary focus" : "result from",
    subtopics: generateDetailedEffects(text, mainConcept).map((effect, index) => ({
      name: effect,
      relation: index === 0 ? "major impact" : "also results in",
      details: [
        { name: "Significance", relation: "important because" },
        { name: "Timeline", relation: "occurs" },
      ],
    })),
  })

  // Add mechanisms
  topics.push({
    name: "Mechanisms",
    relation: "operates through",
    subtopics: generateMechanisms(text, mainConcept).map((mechanism) => ({
      name: mechanism,
      relation: "functions by",
      details: [{ name: "Key process", relation: "involves" }],
    })),
  })

  // Add influencing factors
  topics.push({
    name: "Influencing Factors",
    relation: "modified by",
    subtopics: generateInfluencingFactors(text, mainConcept).map((factor) => ({
      name: factor,
      relation: "affects",
      details: [{ name: "Degree of influence", relation: "impacts by" }],
    })),
  })

  // Add real-world examples
  topics.push({
    name: "Examples",
    relation: "illustrated by",
    subtopics: generateCauseEffectExamples(text, mainConcept).map((example) => ({
      name: example,
      relation: "demonstrates",
      details: [{ name: "Key insight", relation: "shows that" }],
    })),
  })

  return topics
}

// Helper function to tokenize text
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word))
}

// Extract keywords from text
function extractKeywords(text: string, maxKeywords = 10): string[] {
  const words = tokenize(text)

  // Count word frequency
  const wordCounts: Record<string, number> = {}
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })

  // Sort by frequency
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map((entry) => entry[0])
}

// Extract noun phrases from text
function extractNounPhrases(text: string): string[] {
  const phrases: string[] = []

  // Simple pattern matching for noun phrases
  // In a real implementation, you'd use NLP libraries
  const matches = text.match(/\b[A-Z][a-z]+ [a-z]+ [a-z]+\b|\b[A-Z][a-z]+ [a-z]+\b/g) || []

  // Also look for lowercase noun phrases
  const lowerMatches = text.match(/\b[a-z]+ (?:of|in|for|with|by) [a-z]+\b/g) || []

  // Combine and deduplicate
  const allMatches = [...matches, ...lowerMatches]
  const uniquePhrases = new Set(allMatches.map((match) => match.toLowerCase()))

  return Array.from(uniquePhrases)
}

// Extract explicit steps from a "how to" text
function extractExplicitSteps(text: string): string[] {
  const steps: string[] = []

  // Check for numbered steps
  const lines = text.split(/\n/)
  const numberedSteps = lines
    .filter((line) => /^\d+\.\s/.test(line.trim()))
    .map((line) => line.replace(/^\d+\.\s/, "").trim())

  if (numberedSteps.length >= 2) {
    return numberedSteps
  }

  // Check for bullet points
  const bulletSteps = lines
    .filter((line) => /^[•*-]\s/.test(line.trim()))
    .map((line) => line.replace(/^[•*-]\s/, "").trim())

  if (bulletSteps.length >= 2) {
    return bulletSteps
  }

  // Check for first, then, next, finally pattern
  const sentences = extractSentences(text)
  const stepIndicators = [
    "first",
    "initially",
    "begin by",
    "start",
    "then",
    "next",
    "after",
    "subsequently",
    "finally",
    "lastly",
  ]

  for (const sentence of sentences) {
    for (const indicator of stepIndicators) {
      if (sentence.toLowerCase().includes(indicator)) {
        // Extract the part after the indicator
        const parts = sentence.split(new RegExp(`\\b${indicator}\\b`, "i"), 2)
        if (parts.length > 1) {
          steps.push(parts[1].trim())
          break
        }
      }
    }
  }

  return steps.length >= 2 ? steps : []
}

// Identify the type of task in a "how to" prompt
function identifyTaskType(text: string): string {
  const lowerText = text.toLowerCase()

  if (
    lowerText.includes("cook") ||
    lowerText.includes("bake") ||
    lowerText.includes("recipe") ||
    lowerText.includes("food")
  ) {
    return "COOKING"
  }

  if (
    lowerText.includes("build") ||
    lowerText.includes("make") ||
    lowerText.includes("create") ||
    lowerText.includes("construct")
  ) {
    return "BUILDING"
  }

  if (
    lowerText.includes("fix") ||
    lowerText.includes("repair") ||
    lowerText.includes("solve") ||
    lowerText.includes("troubleshoot")
  ) {
    return "FIXING"
  }

  if (
    lowerText.includes("learn") ||
    lowerText.includes("study") ||
    lowerText.includes("understand") ||
    lowerText.includes("master")
  ) {
    return "LEARNING"
  }

  if (
    lowerText.includes("write") ||
    lowerText.includes("draft") ||
    lowerText.includes("compose") ||
    lowerText.includes("create")
  ) {
    return "WRITING"
  }

  if (
    lowerText.includes("install") ||
    lowerText.includes("setup") ||
    lowerText.includes("configure") ||
    lowerText.includes("deploy")
  ) {
    return "INSTALLATION"
  }

  return "GENERAL"
}

// Generate logical steps based on task type
function generateLogicalSteps(taskType: string): Array<{
  name: string
  relation: string
  details: Array<{ name: string; relation: string }>
}> {
  switch (taskType) {
    case "COOKING":
      return [
        {
          name: "Gather ingredients",
          relation: "start with",
          details: [
            { name: "Check quantities", relation: "ensuring" },
            { name: "Prepare substitutions", relation: "if needed" },
          ],
        },
        {
          name: "Prepare ingredients",
          relation: "then",
          details: [
            { name: "Wash and clean", relation: "first" },
            { name: "Cut and measure", relation: "precisely" },
          ],
        },
        {
          name: "Combine and cook",
          relation: "next",
          details: [
            { name: "Follow recipe order", relation: "carefully" },
            { name: "Monitor temperature", relation: "constantly" },
          ],
        },
        {
          name: "Finish and serve",
          relation: "finally",
          details: [
            { name: "Check doneness", relation: "by testing" },
            { name: "Plate presentation", relation: "considering" },
          ],
        },
      ]

    case "BUILDING":
      return [
        {
          name: "Gather materials and tools",
          relation: "start with",
          details: [
            { name: "Check inventory", relation: "against" },
            { name: "Prepare workspace", relation: "by clearing" },
          ],
        },
        {
          name: "Prepare components",
          relation: "then",
          details: [
            { name: "Measure twice", relation: "before cutting" },
            { name: "Pre-assemble sections", relation: "when possible" },
          ],
        },
        {
          name: "Assemble main structure",
          relation: "next",
          details: [
            { name: "Follow blueprint", relation: "precisely" },
            { name: "Secure connections", relation: "firmly" },
          ],
        },
        {
          name: "Finish and test",
          relation: "finally",
          details: [
            { name: "Add finishing touches", relation: "carefully" },
            { name: "Test functionality", relation: "thoroughly" },
          ],
        },
      ]

    case "FIXING":
      return [
        {
          name: "Identify the problem",
          relation: "start with",
          details: [
            { name: "Observe symptoms", relation: "carefully" },
            { name: "Gather information", relation: "systematically" },
          ],
        },
        {
          name: "Diagnose root cause",
          relation: "then",
          details: [
            { name: "Test hypotheses", relation: "methodically" },
            { name: "Isolate variables", relation: "one by one" },
          ],
        },
        {
          name: "Implement solution",
          relation: "next",
          details: [
            { name: "Gather necessary tools", relation: "before starting" },
            { name: "Follow repair sequence", relation: "step by step" },
          ],
        },
        {
          name: "Test and verify",
          relation: "finally",
          details: [
            { name: "Check functionality", relation: "thoroughly" },
            { name: "Monitor for recurrence", relation: "over time" },
          ],
        },
      ]

    case "LEARNING":
      return [
        {
          name: "Set clear goals",
          relation: "start with",
          details: [
            { name: "Define objectives", relation: "specifically" },
            { name: "Create timeline", relation: "realistically" },
          ],
        },
        {
          name: "Gather resources",
          relation: "then",
          details: [
            { name: "Find quality materials", relation: "from reliable sources" },
            { name: "Organize study environment", relation: "for focus" },
          ],
        },
        {
          name: "Study systematically",
          relation: "next",
          details: [
            { name: "Use active learning", relation: "not just reading" },
            { name: "Take effective notes", relation: "for review" },
          ],
        },
        {
          name: "Practice and apply",
          relation: "finally",
          details: [
            { name: "Test knowledge", relation: "regularly" },
            { name: "Teach others", relation: "to reinforce" },
          ],
        },
      ]

    default:
      return [
        {
          name: "Preparation",
          relation: "start with",
          details: [
            { name: "Gather requirements", relation: "completely" },
            { name: "Plan approach", relation: "strategically" },
          ],
        },
        {
          name: "Initial steps",
          relation: "then",
          details: [
            { name: "Begin basics", relation: "methodically" },
            { name: "Establish foundation", relation: "solidly" },
          ],
        },
        {
          name: "Main process",
          relation: "next",
          details: [
            { name: "Execute core tasks", relation: "carefully" },
            { name: "Monitor progress", relation: "continuously" },
          ],
        },
        {
          name: "Completion",
          relation: "finally",
          details: [
            { name: "Verify results", relation: "thoroughly" },
            { name: "Make adjustments", relation: "as needed" },
          ],
        },
      ]
  }
}

// Generate details for a step
function generateStepDetails(step: string, stepIndex: number): Array<{ name: string; relation: string }> {
  const lowerStep = step.toLowerCase()
  const details = []

  // Generate relevant details based on step content
  if (lowerStep.includes("prepare") || lowerStep.includes("gather") || stepIndex === 0) {
    details.push({ name: "Required materials", relation: "needs" })
    details.push({ name: "Preparation time", relation: "takes approximately" })
  } else if (lowerStep.includes("mix") || lowerStep.includes("combine") || lowerStep.includes("assemble")) {
    details.push({ name: "Proper technique", relation: "requires" })
    details.push({ name: "Common mistakes", relation: "avoid" })
  } else if (lowerStep.includes("cook") || lowerStep.includes("bake") || lowerStep.includes("heat")) {
    details.push({ name: "Temperature setting", relation: "at" })
    details.push({ name: "Timing guidelines", relation: "for" })
  } else if (lowerStep.includes("check") || lowerStep.includes("test") || lowerStep.includes("verify")) {
    details.push({ name: "Success indicators", relation: "look for" })
    details.push({ name: "Troubleshooting", relation: "if needed" })
  } else {
    // Generic details based on step position
    if (stepIndex === 0) {
      details.push({ name: "Getting started", relation: "begins with" })
      details.push({ name: "Initial setup", relation: "requires" })
    } else if (stepIndex === 1) {
      details.push({ name: "Key technique", relation: "using" })
      details.push({ name: "Important considerations", relation: "with" })
    } else if (stepIndex === 2) {
      details.push({ name: "Progress indicators", relation: "looking for" })
      details.push({ name: "Common challenges", relation: "overcoming" })
    } else {
      details.push({ name: "Finishing touches", relation: "adding" })
      details.push({ name: "Quality check", relation: "performing" })
    }
  }

  return details
}

// Generate requirements for a task
function generateRequirements(text: string, mainConcept: string): Subtopic[] {
  const lowerText = text.toLowerCase()
  const taskType = identifyTaskType(text)

  switch (taskType) {
    case "COOKING":
      return [
        {
          name: "Ingredients",
          relation: "requires",
          details: [
            { name: "Fresh components", relation: "for quality" },
            { name: "Proper quantities", relation: "measured accurately" },
          ],
        },
        {
          name: "Kitchen equipment",
          relation: "needs",
          details: [
            { name: "Essential tools", relation: "such as" },
            { name: "Optional gadgets", relation: "for convenience" },
          ],
        },
      ]

    case "BUILDING":
      return [
        {
          name: "Materials",
          relation: "requires",
          details: [
            { name: "Quality components", relation: "for durability" },
            { name: "Correct specifications", relation: "matching plans" },
          ],
        },
        {
          name: "Tools",
          relation: "needs",
          details: [
            { name: "Essential equipment", relation: "such as" },
            { name: "Safety gear", relation: "for protection" },
          ],
        },
      ]

    case "FIXING":
      return [
        {
          name: "Diagnostic tools",
          relation: "requires",
          details: [
            { name: "Testing equipment", relation: "for assessment" },
            { name: "Reference materials", relation: "for guidance" },
          ],
        },
        {
          name: "Repair supplies",
          relation: "needs",
          details: [
            { name: "Replacement parts", relation: "matching specifications" },
            { name: "Repair tools", relation: "appropriate for task" },
          ],
        },
      ]

    default:
      return [
        {
          name: "Essential resources",
          relation: "requires",
          details: [
            { name: "Primary materials", relation: "for core tasks" },
            { name: "Supporting elements", relation: "for completion" },
          ],
        },
        {
          name: "Knowledge prerequisites",
          relation: "needs",
          details: [
            { name: "Basic understanding", relation: "of fundamentals" },
            { name: "Key concepts", relation: "to comprehend" },
          ],
        },
      ]
  }
}

// Generate tips and best practices
function generateTipsAndPractices(text: string, mainConcept: string): Subtopic[] {
  const lowerText = text.toLowerCase()
  const taskType = identifyTaskType(text)

  switch (taskType) {
    case "COOKING":
      return [
        {
          name: "Preparation tips",
          relation: "improves with",
          details: [
            { name: "Mise en place", relation: "organizing before starting" },
            { name: "Ingredient handling", relation: "for best results" },
          ],
        },
        {
          name: "Cooking techniques",
          relation: "enhanced by",
          details: [
            { name: "Temperature control", relation: "maintaining properly" },
            { name: "Timing precision", relation: "watching carefully" },
          ],
        },
      ]

    case "BUILDING":
      return [
        {
          name: "Planning advice",
          relation: "benefits from",
          details: [
            { name: "Detailed blueprints", relation: "following closely" },
            { name: "Material allowances", relation: "accounting for waste" },
          ],
        },
        {
          name: "Construction techniques",
          relation: "improved with",
          details: [
            { name: "Proper measurements", relation: "checking twice" },
            { name: "Quality joints", relation: "ensuring strength" },
          ],
        },
      ]

    default:
      return [
        {
          name: "Efficiency strategies",
          relation: "optimized by",
          details: [
            { name: "Time management", relation: "prioritizing tasks" },
            { name: "Resource allocation", relation: "using wisely" },
          ],
        },
        {
          name: "Quality assurance",
          relation: "maintained through",
          details: [
            { name: "Regular checks", relation: "throughout process" },
            { name: "Attention to detail", relation: "at every stage" },
          ],
        },
      ]
  }
}

// Generate common challenges
function generateChallenges(text: string, mainConcept: string): Subtopic[] {
  const lowerText = text.toLowerCase()
  const taskType = identifyTaskType(text)

  switch (taskType) {
    case "COOKING":
      return [
        {
          name: "Common mistakes",
          relation: "to avoid",
          details: [
            { name: "Improper measurements", relation: "leading to" },
            { name: "Temperature issues", relation: "resulting in" },
          ],
        },
        {
          name: "Troubleshooting",
          relation: "solutions for",
          details: [
            { name: "Texture problems", relation: "fixed by" },
            { name: "Flavor adjustments", relation: "corrected with" },
          ],
        },
      ]

    case "BUILDING":
      return [
        {
          name: "Structural issues",
          relation: "to prevent",
          details: [
            { name: "Alignment problems", relation: "causing" },
            { name: "Stability concerns", relation: "addressed by" },
          ],
        },
        {
          name: "Material challenges",
          relation: "overcome by",
          details: [
            { name: "Quality variations", relation: "managed through" },
            { name: "Compatibility issues", relation: "resolved with" },
          ],
        },
      ]

    default:
      return [
        {
          name: "Common obstacles",
          relation: "to overcome",
          details: [
            { name: "Frequent problems", relation: "encountered during" },
            { name: "Typical setbacks", relation: "managed by" },
          ],
        },
        {
          name: "Error prevention",
          relation: "strategies for",
          details: [
            { name: "Critical checkpoints", relation: "established at" },
            { name: "Verification methods", relation: "implemented through" },
          ],
        },
      ]
  }
}

// Generate benefits and outcomes
function generateBenefits(text: string, mainConcept: string): Subtopic[] {
  const lowerText = text.toLowerCase()
  const taskType = identifyTaskType(text)

  return [
    {
      name: "Primary benefits",
      relation: "results in",
      details: [
        { name: "Main advantage", relation: "providing" },
        { name: "Key outcome", relation: "achieving" },
      ],
    },
    {
      name: "Secondary benefits",
      relation: "also provides",
      details: [
        { name: "Additional value", relation: "offering" },
        { name: "Long-term impact", relation: "creating" },
      ],
    },
  ]
}

// Extract definition from text
function extractDefinition(text: string, concept: string, sentences: string[]): string {
  // Look for explicit definition patterns
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()
    const conceptLower = concept.toLowerCase()

    if (
      lowerSentence.includes(`${conceptLower} is`) ||
      lowerSentence.includes(`${conceptLower} are`) ||
      lowerSentence.includes(`${conceptLower} refers to`) ||
      lowerSentence.includes(`${conceptLower} means`) ||
      lowerSentence.includes(`definition of ${conceptLower}`) ||
      lowerSentence.includes(`${conceptLower} can be defined as`)
    ) {
      return sentence
    }
  }

  // If no explicit definition, use the first sentence that mentions the concept
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(concept.toLowerCase())) {
      return sentence
    }
  }

  // Default definition
  return `${concept} is a concept that encompasses various aspects and applications.`
}

// Extract components from text
function extractComponents(text: string, concept: string, keywords: string[], phrases: string[]): string[] {
  const components = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for component indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes(`${conceptLower} consists of`) ||
      lowerSentence.includes(`${conceptLower} comprises`) ||
      lowerSentence.includes(`${conceptLower} contains`) ||
      lowerSentence.includes(`${conceptLower} includes`) ||
      lowerSentence.includes(`components of ${conceptLower}`) ||
      lowerSentence.includes(`elements of ${conceptLower}`) ||
      lowerSentence.includes(`parts of ${conceptLower}`)
    ) {
      // Extract noun phrases from this sentence
      const sentencePhrases = extractNounPhrases(sentence)
      components.push(...sentencePhrases)
    }
  }

  // If we couldn't find explicit components, use some keywords and phrases
  if (components.length < 2) {
    // Use relevant keywords and phrases
    const relevantTerms = [...keywords, ...phrases]
      .filter((term) => !term.toLowerCase().includes(conceptLower) && term.length > 3)
      .slice(0, 3)

    components.push(...relevantTerms.map((term) => capitalizePhrase(term)))
  }

  // Ensure we have at least some components
  if (components.length < 2) {
    components.push("Primary Element", "Secondary Component", "Supporting Structure")
  }

  // Deduplicate and limit
  return [...new Set(components)].slice(0, 3).map((comp) => capitalizePhrase(comp))
}

// Generate examples
function generateExamples(text: string, concept: string, keywords: string[], phrases: string[]): string[] {
  const examples = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for example indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("for example") ||
      lowerSentence.includes("such as") ||
      lowerSentence.includes("like") ||
      lowerSentence.includes("instance") ||
      lowerSentence.includes("e.g.") ||
      lowerSentence.includes("examples include")
    ) {
      // Extract noun phrases from this sentence
      const sentencePhrases = extractNounPhrases(sentence)
      examples.push(...sentencePhrases)
    }
  }

  // If we couldn't find explicit examples, generate some based on the domain
  if (examples.length < 2) {
    // Determine the domain
    const domain = identifyDomain(text)

    // Generate domain-specific examples
    switch (domain) {
      case "TECHNOLOGY":
        examples.push("Smartphone application", "Cloud computing service", "Machine learning algorithm")
        break
      case "SCIENCE":
        examples.push("Laboratory experiment", "Research study", "Scientific theory")
        break
      case "BUSINESS":
        examples.push("Startup company", "Marketing strategy", "Business model")
        break
      case "EDUCATION":
        examples.push("Online course", "Teaching method", "Learning assessment")
        break
      case "HEALTH":
        examples.push("Treatment protocol", "Wellness program", "Medical procedure")
        break
      default:
        examples.push("Practical application", "Real-world case", "Common instance")
    }
  }

  // Deduplicate and limit
  return [...new Set(examples)].slice(0, 3).map((ex) => capitalizePhrase(ex))
}

// Generate applications
function generateApplications(text: string, concept: string, keywords: string[]): string[] {
  const applications = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for application indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("used for") ||
      lowerSentence.includes("applied in") ||
      lowerSentence.includes("application") ||
      lowerSentence.includes("utilized in") ||
      lowerSentence.includes("implemented in")
    ) {
      // Extract noun phrases from this sentence
      const sentencePhrases = extractNounPhrases(sentence)
      applications.push(...sentencePhrases)
    }
  }

  // If we couldn't find explicit applications, generate some based on the domain
  if (applications.length < 2) {
    // Determine the domain
    const domain = identifyDomain(text)

    // Generate domain-specific applications
    switch (domain) {
      case "TECHNOLOGY":
        applications.push("Software development", "Data analysis", "Automation systems")
        break
      case "SCIENCE":
        applications.push("Research methodology", "Experimental design", "Theoretical modeling")
        break
      case "BUSINESS":
        applications.push("Strategic planning", "Market analysis", "Operational efficiency")
        break
      case "EDUCATION":
        applications.push("Curriculum development", "Student assessment", "Educational technology")
        break
      case "HEALTH":
        applications.push("Patient care", "Diagnostic procedures", "Treatment planning")
        break
      default:
        applications.push("Practical implementation", "Real-world usage", "Common application")
    }
  }

  // Deduplicate and limit
  return [...new Set(applications)].slice(0, 3).map((app) => capitalizePhrase(app))
}

// Generate advantages
function generateAdvantages(text: string, concept: string): string[] {
  const advantages = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for advantage indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("advantage") ||
      lowerSentence.includes("benefit") ||
      lowerSentence.includes("strength") ||
      lowerSentence.includes("positive") ||
      lowerSentence.includes("improve") ||
      lowerSentence.includes("enhance")
    ) {
      // Extract the advantage
      advantages.push(sentence)
    }
  }

  // If we couldn't find explicit advantages, generate some generic ones
  if (advantages.length < 2) {
    advantages.push(
      `Improves efficiency and effectiveness`,
      `Enhances quality and reliability`,
      `Provides better results with less effort`,
    )
  }

  // Process and limit
  return advantages.slice(0, 3).map((adv) => {
    // If it's a full sentence, extract the key part
    if (adv.length > 60) {
      const keyPart = adv.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : adv.substring(0, 60) + "..."
    }
    return adv
  })
}

// Generate limitations
function generateLimitations(text: string, concept: string): string[] {
  const limitations = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for limitation indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("limitation") ||
      lowerSentence.includes("drawback") ||
      lowerSentence.includes("challenge") ||
      lowerSentence.includes("weakness") ||
      lowerSentence.includes("disadvantage") ||
      lowerSentence.includes("problem") ||
      lowerSentence.includes("issue") ||
      lowerSentence.includes("constraint")
    ) {
      // Extract the limitation
      limitations.push(sentence)
    }
  }

  // If we couldn't find explicit limitations, generate some generic ones
  if (limitations.length < 2) {
    limitations.push(
      `May require specialized knowledge or training`,
      `Can be resource-intensive in some contexts`,
      `Not universally applicable to all situations`,
    )
  }

  // Process and limit
  return limitations.slice(0, 3).map((lim) => {
    // If it's a full sentence, extract the key part
    if (lim.length > 60) {
      const keyPart = lim.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : lim.substring(0, 60) + "..."
    }
    return lim
  })
}

// Extract formula from text
function extractFormula(text: string): string {
  // Look for equation patterns
  const equationMatch = text.match(/([A-Za-z]+\s*=\s*[A-Za-z0-9\s+\-*/^()]+)/)
  if (equationMatch) {
    return equationMatch[1].trim()
  }

  // Look for mathematical expressions
  const mathMatch = text.match(/([A-Za-z0-9]+\s*[+\-*/]\s*[A-Za-z0-9\s+\-*/^()]+)/)
  if (mathMatch) {
    return mathMatch[1].trim()
  }

  // Check for formula keywords followed by expressions
  const formulaKeywordMatch = text.match(/(formula|equation|expression)[\s:]+([A-Za-z0-9\s+\-*/^()=]+)/i)
  if (formulaKeywordMatch) {
    return formulaKeywordMatch[2].trim()
  }

  // Default to a generic formula
  return "f(x) = result"
}

// Extract variables from formula text
function extractVariables(
  text: string,
  formula: string,
): Array<{
  name: string
  description: string
  units?: string
}> {
  const variables = []
  const sentences = extractSentences(text)

  // Extract variable symbols from the formula
  const variableSymbols = formula ? formula.match(/[A-Za-z]/g) || [] : []
  const uniqueSymbols = [...new Set(variableSymbols)]

  // Try to find descriptions for each variable in the text
  for (const symbol of uniqueSymbols) {
    let description = ""
    let units = ""

    // Look for variable descriptions in sentences
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase()

      // Check for variable definition patterns
      if (
        lowerSentence.includes(`${symbol.toLowerCase()} is`) ||
        lowerSentence.includes(`${symbol.toLowerCase()} represents`) ||
        lowerSentence.includes(`${symbol.toLowerCase()} denotes`) ||
        lowerSentence.includes(`where ${symbol.toLowerCase()}`) ||
        lowerSentence.includes(`${symbol.toLowerCase()} stands for`)
      ) {
        description = sentence

        // Try to extract units if present
        const unitsMatch = sentence.match(/measured in ([a-zA-Z]+)/)
        if (unitsMatch) {
          units = unitsMatch[1]
        }

        break
      }
    }

    // If no description found, assign a generic one based on common variables
    if (!description) {
      if (symbol === "x" || symbol === "X") description = "Input value"
      else if (symbol === "y" || symbol === "Y") description = "Output value"
      else if (symbol === "t" || symbol === "T") description = "Time"
      else if (symbol === "v" || symbol === "V") description = "Velocity"
      else if (symbol === "a" || symbol === "A") description = "Acceleration"
      else if (symbol === "m" || symbol === "M") description = "Mass"
      else if (symbol === "F" || symbol === "f") description = "Force"
      else if (symbol === "E" || symbol === "e") description = "Energy"
      else if (symbol === "P" || symbol === "p") description = "Pressure"
      else if (symbol === "r" || symbol === "R") description = "Radius"
      else description = "Variable"
    }

    variables.push({
      name: symbol,
      description: description.length > 60 ? description.substring(0, 60) + "..." : description,
      units: units,
    })
  }

  // If no variables were found, create some generic ones
  if (variables.length === 0) {
    variables.push(
      { name: "x", description: "Input variable", units: "units" },
      { name: "y", description: "Output variable", units: "units" },
      { name: "k", description: "Constant factor", units: "" },
    )
  }

  return variables
}

// Generate calculation steps
function generateCalculationSteps(text: string, formula: string): string[] {
  const steps = []
  const sentences = extractSentences(text)

  // Look for explicit steps in the text
  let foundExplicitSteps = false

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("step") ||
      lowerSentence.includes("first") ||
      lowerSentence.includes("then") ||
      lowerSentence.includes("next") ||
      lowerSentence.includes("finally") ||
      lowerSentence.includes("calculate") ||
      lowerSentence.includes("compute") ||
      lowerSentence.includes("determine")
    ) {
      steps.push(sentence)
      foundExplicitSteps = true
    }
  }

  // If we found explicit steps, process and return them
  if (foundExplicitSteps && steps.length >= 2) {
    return steps.slice(0, 4).map((step) => {
      // If it's a long sentence, extract the key part
      if (step.length > 60) {
        const keyPart = step.split(/[,.;:]/, 1)[0]
        return keyPart.length > 10 ? keyPart : step.substring(0, 60) + "..."
      }
      return step
    })
  }

  // If no explicit steps, generate generic calculation steps
  return [
    "Identify all variables in the formula",
    "Substitute known values into the equation",
    "Perform the mathematical operations in the correct order",
    "Verify the result and check the units",
  ]
}

// Generate formula applications
function generateFormulaApplications(text: string, concept: string): string[] {
  const applications = []
  const sentences = extractSentences(text)

  // Look for application indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("used for") ||
      lowerSentence.includes("applied in") ||
      lowerSentence.includes("application") ||
      lowerSentence.includes("utilized in") ||
      lowerSentence.includes("implemented in") ||
      lowerSentence.includes("useful for") ||
      lowerSentence.includes("helps to")
    ) {
      applications.push(sentence)
    }
  }

  // If we couldn't find explicit applications, generate some based on the domain
  if (applications.length < 2) {
    // Determine the domain
    const domain = identifyDomain(text)

    // Generate domain-specific applications
    switch (domain) {
      case "MATH":
        applications.push("Mathematical problem solving", "Algebraic calculations", "Geometric analysis")
        break
      case "PHYSICS":
        applications.push("Motion analysis", "Force calculations", "Energy transformations")
        break
      case "ENGINEERING":
        applications.push("Design calculations", "System analysis", "Performance prediction")
        break
      case "FINANCE":
        applications.push("Investment analysis", "Risk assessment", "Financial forecasting")
        break
      default:
        applications.push("Practical calculations", "Quantitative analysis", "Predictive modeling")
    }
  }

  // Process and limit
  return applications.slice(0, 3).map((app) => {
    // If it's a full sentence, extract the key part
    if (app.length > 60) {
      const keyPart = app.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : app.substring(0, 60) + "..."
    }
    return app
  })
}

// Generate formula constraints
function generateFormulaConstraints(text: string): string[] {
  const constraints = []
  const sentences = extractSentences(text)

  // Look for constraint indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("valid") ||
      lowerSentence.includes("constraint") ||
      lowerSentence.includes("limitation") ||
      lowerSentence.includes("assumption") ||
      lowerSentence.includes("condition") ||
      lowerSentence.includes("restricted") ||
      lowerSentence.includes("only if") ||
      lowerSentence.includes("requires that")
    ) {
      constraints.push(sentence)
    }
  }

  // If we couldn't find explicit constraints, generate some generic ones
  if (constraints.length < 2) {
    constraints.push(
      "Valid only within specific parameter ranges",
      "Assumes ideal conditions",
      "Neglects certain real-world factors",
    )
  }

  // Process and limit
  return constraints.slice(0, 3).map((constraint) => {
    // If it's a full sentence, extract the key part
    if (constraint.length > 60) {
      const keyPart = constraint.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : constraint.substring(0, 60) + "..."
    }
    return constraint
  })
}

// Extract comparison items
function extractComparisonItems(text: string): { item1: string; item2: string } {
  const lowerText = text.toLowerCase()

  // Check for "X vs Y" pattern
  const vsMatch = text.match(/([^\s]+)\s+(?:vs|versus)\s+([^\s.,]+)/)
  if (vsMatch) {
    return {
      item1: capitalizePhrase(vsMatch[1]),
      item2: capitalizePhrase(vsMatch[2]),
    }
  }

  // Check for "difference between X and Y" pattern
  const diffMatch = text.match(/differences?\s+between\s+([^\s]+)\s+and\s+([^\s.,]+)/)
  if (diffMatch) {
    return {
      item1: capitalizePhrase(diffMatch[1]),
      item2: capitalizePhrase(diffMatch[2]),
    }
  }

  // Check for "compare X and Y" pattern
  const compareMatch = text.match(/compare\s+([^\s]+)\s+and\s+([^\s.,]+)/)
  if (compareMatch) {
    return {
      item1: capitalizePhrase(compareMatch[1]),
      item2: capitalizePhrase(compareMatch[2]),
    }
  }

  // Default to generic items
  return {
    item1: "Item 1",
    item2: "Item 2",
  }
}

// Generate similarities between comparison items
function generateSimilarities(text: string, items: { item1: string; item2: string }): string[] {
  const similarities = []
  const sentences = extractSentences(text)
  const item1Lower = items.item1.toLowerCase()
  const item2Lower = items.item2.toLowerCase()

  // Look for similarity indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes(item1Lower) &&
      lowerSentence.includes(item2Lower) &&
      (lowerSentence.includes("similar") ||
        lowerSentence.includes("both") ||
        lowerSentence.includes("share") ||
        lowerSentence.includes("common") ||
        lowerSentence.includes("alike"))
    ) {
      similarities.push(sentence)
    }
  }

  // If we couldn't find explicit similarities, generate some generic ones
  if (similarities.length < 2) {
    similarities.push(
      `Both ${items.item1} and ${items.item2} serve similar purposes`,
      `Both have overlapping features and capabilities`,
      `Share common underlying principles`,
    )
  }

  // Process and limit
  return similarities.slice(0, 3).map((similarity) => {
    // If it's a full sentence, extract the key part
    if (similarity.length > 60) {
      const keyPart = similarity.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : similarity.substring(0, 60) + "..."
    }
    return similarity
  })
}

// Generate differences between comparison items
function generateDifferences(text: string, items: { item1: string; item2: string }): string[] {
  const differences = []
  const sentences = extractSentences(text)
  const item1Lower = items.item1.toLowerCase()
  const item2Lower = items.item2.toLowerCase()

  // Look for difference indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes(item1Lower) &&
      lowerSentence.includes(item2Lower) &&
      (lowerSentence.includes("differ") ||
        lowerSentence.includes("unlike") ||
        lowerSentence.includes("whereas") ||
        lowerSentence.includes("while") ||
        lowerSentence.includes("contrast") ||
        lowerSentence.includes("however") ||
        lowerSentence.includes("but"))
    ) {
      differences.push(sentence)
    }
  }

  // If we couldn't find explicit differences, generate some generic ones
  if (differences.length < 2) {
    differences.push(
      `${items.item1} focuses on X, while ${items.item2} emphasizes Y`,
      `${items.item1} is typically more A, whereas ${items.item2} is more B`,
      `They differ in their approach to key functionality`,
    )
  }

  // Process and limit
  return differences.slice(0, 3).map((difference) => {
    // If it's a full sentence, extract the key part
    if (difference.length > 60) {
      const keyPart = difference.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : difference.substring(0, 60) + "..."
    }
    return difference
  })
}

// Extract problem from text
function extractProblem(text: string, mainConcept: string): string {
  const lowerText = text.toLowerCase()

  // Look for problem indicators
  const problemMatch = lowerText.match(/problem\s+(?:of|with)\s+([^.,]+)/)
  if (problemMatch) {
    return capitalizePhrase(problemMatch[1].trim())
  }

  const issueMatch = lowerText.match(/(?:issue|trouble)\s+(?:with|of)?\s+([^.,]+)/)
  if (issueMatch) {
    return capitalizePhrase(issueMatch[1].trim())
  }

  const fixMatch = lowerText.match(/(?:fix|solve|resolve)\s+([^.,]+)/)
  if (fixMatch) {
    return capitalizePhrase(fixMatch[1].trim())
  }

  // Default to the main concept
  return mainConcept
}

// Generate causes for a problem
function generateCauses(text: string, problem: string): string[] {
  const causes = []
  const sentences = extractSentences(text)
  const problemLower = problem.toLowerCase()

  // Look for cause indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("cause") ||
      lowerSentence.includes("due to") ||
      lowerSentence.includes("because") ||
      lowerSentence.includes("result of") ||
      lowerSentence.includes("stems from") ||
      lowerSentence.includes("root") ||
      lowerSentence.includes("source")
    ) {
      causes.push(sentence)
    }
  }

  // If we couldn't find explicit causes, generate some generic ones
  if (causes.length < 2) {
    causes.push("Underlying technical issues", "Configuration problems", "Resource limitations")
  }

  // Process and limit
  return causes.slice(0, 3).map((cause) => {
    // If it's a full sentence, extract the key part
    if (cause.length > 60) {
      const keyPart = cause.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : cause.substring(0, 60) + "..."
    }
    return cause
  })
}

// Generate symptoms for a problem
function generateSymptoms(text: string, problem: string): string[] {
  const symptoms = []
  const sentences = extractSentences(text)
  const problemLower = problem.toLowerCase()

  // Look for symptom indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("symptom") ||
      lowerSentence.includes("sign") ||
      lowerSentence.includes("indication") ||
      lowerSentence.includes("manifest") ||
      lowerSentence.includes("exhibit") ||
      lowerSentence.includes("display") ||
      lowerSentence.includes("show")
    ) {
      symptoms.push(sentence)
    }
  }

  // If we couldn't find explicit symptoms, generate some generic ones
  if (symptoms.length < 2) {
    symptoms.push("Error messages appearing", "System performance degradation", "Unexpected behavior")
  }

  // Process and limit
  return symptoms.slice(0, 3).map((symptom) => {
    // If it's a full sentence, extract the key part
    if (symptom.length > 60) {
      const keyPart = symptom.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : symptom.substring(0, 60) + "..."
    }
    return symptom
  })
}

// Generate solutions for a problem
function generateSolutions(text: string, problem: string): string[] {
  const solutions = []
  const sentences = extractSentences(text)
  const problemLower = problem.toLowerCase()

  // Look for solution indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("solution") ||
      lowerSentence.includes("fix") ||
      lowerSentence.includes("resolve") ||
      lowerSentence.includes("solve") ||
      lowerSentence.includes("address") ||
      lowerSentence.includes("correct") ||
      lowerSentence.includes("remedy")
    ) {
      solutions.push(sentence)
    }
  }

  // If we couldn't find explicit solutions, generate some generic ones
  if (solutions.length < 2) {
    solutions.push("Update system components", "Reconfigure settings", "Implement workaround")
  }

  // Process and limit
  return solutions.slice(0, 3).map((solution) => {
    // If it's a full sentence, extract the key part
    if (solution.length > 60) {
      const keyPart = solution.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : solution.substring(0, 60) + "..."
    }
    return solution
  })
}

// Generate prevention strategies
function generatePrevention(text: string, problem: string): string[] {
  const prevention = []
  const sentences = extractSentences(text)
  const problemLower = problem.toLowerCase()

  // Look for prevention indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("prevent") ||
      lowerSentence.includes("avoid") ||
      lowerSentence.includes("mitigate") ||
      lowerSentence.includes("reduce risk") ||
      lowerSentence.includes("precaution") ||
      lowerSentence.includes("proactive")
    ) {
      prevention.push(sentence)
    }
  }

  // If we couldn't find explicit prevention strategies, generate some generic ones
  if (prevention.length < 2) {
    prevention.push(
      "Regular maintenance and updates",
      "Proper configuration practices",
      "Monitoring and early detection",
    )
  }

  // Process and limit
  return prevention.slice(0, 3).map((strategy) => {
    // If it's a full sentence, extract the key part
    if (strategy.length > 60) {
      const keyPart = strategy.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : strategy.substring(0, 60) + "..."
    }
    return strategy
  })
}

// Generate long-term strategies
function generateLongTermStrategies(text: string, problem: string): string[] {
  const strategies = []
  const sentences = extractSentences(text)
  const problemLower = problem.toLowerCase()

  // Look for long-term strategy indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("long-term") ||
      lowerSentence.includes("permanent") ||
      lowerSentence.includes("sustainable") ||
      lowerSentence.includes("ongoing") ||
      lowerSentence.includes("future") ||
      lowerSentence.includes("strategic")
    ) {
      strategies.push(sentence)
    }
  }

  // If we couldn't find explicit long-term strategies, generate some generic ones
  if (strategies.length < 2) {
    strategies.push(
      "Implement comprehensive monitoring system",
      "Develop standardized procedures",
      "Invest in training and documentation",
    )
  }

  // Process and limit
  return strategies.slice(0, 3).map((strategy) => {
    // If it's a full sentence, extract the key part
    if (strategy.length > 60) {
      const keyPart = strategy.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : strategy.substring(0, 60) + "..."
    }
    return strategy
  })
}

// Extract list items
function extractListItems(text: string, concept: string): string[] {
  const items = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for list indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("types of") ||
      lowerSentence.includes("kinds of") ||
      lowerSentence.includes("examples of") ||
      lowerSentence.includes("varieties of") ||
      lowerSentence.includes("categories of") ||
      lowerSentence.includes("include")
    ) {
      // Extract potential list items
      const parts = sentence.split(/,|and|or|such as|like|including|e\.g\.|i\.e\./)
      items.push(...parts.map((part) => part.trim()).filter((part) => part.length > 0))
    }
  }

  // If we couldn't find explicit list items, generate some generic ones
  if (items.length < 3) {
    items.push("Type 1", "Type 2", "Type 3", "Type 4", "Type 5")
  }

  // Process and limit
  return items.slice(0, 5).map((item) => {
    // Remove any leading numbers or bullets
    return item.replace(/^\d+\.\s*|\*\s*|-\s*/, "")
  })
}

// Categorize list items
function categorizeListItems(items: string[]): Record<string, string[]> {
  // This is a simplified implementation
  // In a real app, you would use clustering or semantic analysis

  const categories: Record<string, string[]> = {}

  // If we have few items, put them all in one category
  if (items.length <= 3) {
    categories["Main Types"] = items
    return categories
  }

  // Split items into categories
  const categoryCount = Math.min(3, Math.ceil(items.length / 2))
  const itemsPerCategory = Math.ceil(items.length / categoryCount)

  for (let i = 0; i < categoryCount; i++) {
    const start = i * itemsPerCategory
    const end = Math.min(start + itemsPerCategory, items.length)
    const categoryItems = items.slice(start, end)

    if (categoryItems.length > 0) {
      categories[`Category ${i + 1}`] = categoryItems
    }
  }

  return categories
}

// Generate selection criteria
function generateSelectionCriteria(text: string, concept: string): string[] {
  const criteria = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for criteria indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("criteria") ||
      lowerSentence.includes("factor") ||
      lowerSentence.includes("consider") ||
      lowerSentence.includes("choose") ||
      lowerSentence.includes("select") ||
      lowerSentence.includes("decide") ||
      lowerSentence.includes("determine")
    ) {
      criteria.push(sentence)
    }
  }

  // If we couldn't find explicit criteria, generate some generic ones
  if (criteria.length < 2) {
    criteria.push("Functionality and features", "Cost and resource requirements", "Compatibility with existing systems")
  }

  // Process and limit
  return criteria.slice(0, 3).map((criterion) => {
    // If it's a full sentence, extract the key part
    if (criterion.length > 60) {
      const keyPart = criterion.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : criterion.substring(0, 60) + "..."
    }
    return criterion
  })
}

// Generate detailed causes for cause-effect analysis
function generateDetailedCauses(text: string, concept: string): string[] {
  const causes = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for cause indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("cause") ||
      lowerSentence.includes("lead to") ||
      lowerSentence.includes("result in") ||
      lowerSentence.includes("due to") ||
      lowerSentence.includes("because") ||
      lowerSentence.includes("reason")
    ) {
      causes.push(sentence)
    }
  }

  // If we couldn't find explicit causes, generate some domain-specific ones
  if (causes.length < 2) {
    // Determine the domain
    const domain = identifyDomain(text)

    switch (domain) {
      case "HEALTH":
        causes.push("Biological factors", "Environmental exposure", "Lifestyle choices")
        break
      case "TECHNOLOGY":
        causes.push("Software configuration", "Hardware limitations", "User interaction patterns")
        break
      case "BUSINESS":
        causes.push("Market conditions", "Strategic decisions", "Competitive pressures")
        break
      case "ENVIRONMENT":
        causes.push("Human activity", "Natural processes", "Climate patterns")
        break
      default:
        causes.push("Primary factor", "Secondary influence", "Contributing element")
    }
  }

  // Process and limit
  return causes.slice(0, 3).map((cause) => {
    // If it's a full sentence, extract the key part
    if (cause.length > 60) {
      const keyPart = cause.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : cause.substring(0, 60) + "..."
    }
    return cause
  })
}

// Generate detailed effects for cause-effect analysis
function generateDetailedEffects(text: string, concept: string): string[] {
  const effects = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for effect indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("effect") ||
      lowerSentence.includes("impact") ||
      lowerSentence.includes("result") ||
      lowerSentence.includes("consequence") ||
      lowerSentence.includes("outcome") ||
      lowerSentence.includes("leads to")
    ) {
      effects.push(sentence)
    }
  }

  // If we couldn't find explicit effects, generate some domain-specific ones
  if (effects.length < 2) {
    // Determine the domain
    const domain = identifyDomain(text)

    switch (domain) {
      case "HEALTH":
        effects.push("Symptoms manifestation", "Physiological changes", "Quality of life impact")
        break
      case "TECHNOLOGY":
        effects.push("System performance", "User experience", "Data integrity")
        break
      case "BUSINESS":
        effects.push("Profitability changes", "Market position shifts", "Operational efficiency")
        break
      case "ENVIRONMENT":
        effects.push("Ecosystem changes", "Resource availability", "Climate patterns")
        break
      default:
        effects.push("Primary outcome", "Secondary consequence", "Long-term impact")
    }
  }

  // Process and limit
  return effects.slice(0, 3).map((effect) => {
    // If it's a full sentence, extract the key part
    if (effect.length > 60) {
      const keyPart = effect.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : effect.substring(0, 60) + "..."
    }
    return effect
  })
}

// Generate mechanisms for cause-effect analysis
function generateMechanisms(text: string, concept: string): string[] {
  const mechanisms = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for mechanism indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("mechanism") ||
      lowerSentence.includes("process") ||
      lowerSentence.includes("how it works") ||
      lowerSentence.includes("function") ||
      lowerSentence.includes("operation") ||
      lowerSentence.includes("pathway")
    ) {
      mechanisms.push(sentence)
    }
  }

  // If we couldn't find explicit mechanisms, generate some generic ones
  if (mechanisms.length < 2) {
    mechanisms.push("Direct interaction pathway", "Sequential process flow", "Feedback loop system")
  }

  // Process and limit
  return mechanisms.slice(0, 3).map((mechanism) => {
    // If it's a full sentence, extract the key part
    if (mechanism.length > 60) {
      const keyPart = mechanism.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : mechanism.substring(0, 60) + "..."
    }
    return mechanism
  })
}

// Generate influencing factors for cause-effect analysis
function generateInfluencingFactors(text: string, concept: string): string[] {
  const factors = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for factor indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("factor") ||
      lowerSentence.includes("influence") ||
      lowerSentence.includes("affect") ||
      lowerSentence.includes("modify") ||
      lowerSentence.includes("determine") ||
      lowerSentence.includes("impact")
    ) {
      factors.push(sentence)
    }
  }

  // If we couldn't find explicit factors, generate some generic ones
  if (factors.length < 2) {
    factors.push("Environmental conditions", "System parameters", "External variables")
  }

  // Process and limit
  return factors.slice(0, 3).map((factor) => {
    // If it's a full sentence, extract the key part
    if (factor.length > 60) {
      const keyPart = factor.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : factor.substring(0, 60) + "..."
    }
    return factor
  })
}

// Generate examples for cause-effect analysis
function generateCauseEffectExamples(text: string, concept: string): string[] {
  const examples = []
  const sentences = extractSentences(text)
  const conceptLower = concept.toLowerCase()

  // Look for example indicators in sentences
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()

    if (
      lowerSentence.includes("example") ||
      lowerSentence.includes("instance") ||
      lowerSentence.includes("case") ||
      lowerSentence.includes("illustration") ||
      lowerSentence.includes("such as") ||
      lowerSentence.includes("like")
    ) {
      examples.push(sentence)
    }
  }

  // If we couldn't find explicit examples, generate some generic ones
  if (examples.length < 2) {
    examples.push("Real-world scenario", "Common occurrence", "Documented case study")
  }

  // Process and limit
  return examples.slice(0, 3).map((example) => {
    // If it's a full sentence, extract the key part
    if (example.length > 60) {
      const keyPart = example.split(/[,.;:]/, 1)[0]
      return keyPart.length > 10 ? keyPart : example.substring(0, 60) + "..."
    }
    return example
  })
}

// Identify the domain of the text
function identifyDomain(text: string): string {
  const lowerText = text.toLowerCase()
  const words = tokenize(lowerText)

  // Count domain-specific keywords
  const domainCounts: Record<string, number> = {}

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    domainCounts[domain] = 0
    for (const word of words) {
      if (keywords.includes(word)) {
        domainCounts[domain]++
      }
    }
  }

  // Find the domain with the most matches
  let topDomain = ""
  let maxCount = 0
  for (const [domain, count] of Object.entries(domainCounts)) {
    if (count > maxCount) {
      maxCount = count
      topDomain = domain
    }
  }

  return topDomain || "GENERAL"
}

// Helper function to capitalize the first letter of each word in a phrase
function capitalizePhrase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
