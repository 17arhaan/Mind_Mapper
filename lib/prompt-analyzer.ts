import type { PromptAnalysis, Topic } from "@/lib/types"

// Update the generateContentWithAI function to have better error handling and fallback content

// Function to generate content using Gemini API
async function generateContentWithAI(topic: string, mainConcept: string, promptTemplate: string): Promise<string> {
  try {
    // Validate inputs before making the API call
    if (!topic || !mainConcept) {
      const missingFields = []
      if (!topic) missingFields.push("topic")
      if (!mainConcept) missingFields.push("mainConcept")
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
    }

    console.log("Generating content with AI for:", { topic, mainConcept })
    
    const requestBody = {
      topic,
      mainConcept,
      prompt: promptTemplate,
    }

    console.log("Making API request with body:", requestBody)

    const response = await fetch("/api/generate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    console.log("API response status:", response.status)

    let data
    try {
      data = await response.json()
      console.log("API response data:", data)
    } catch (error) {
      console.error("Error parsing API response:", error)
      throw new Error(`Error parsing API response: ${error instanceof Error ? error.message : "Unknown error"}`)
    }

    if (!response.ok) {
      console.error("API error:", data)
      const errorMessage = data?.details || data?.error || "Unknown API error"
      const status = data?.status || response.status
      throw new Error(`API error (${status}): ${errorMessage}`)
    }

    if (!data?.content) {
      console.warn("No content received from API, using fallback")
      return generateFallbackContent(topic, mainConcept, promptTemplate)
    }

    return data.content
  } catch (error) {
    console.error("Error generating content with AI:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Error generating content: ${error}`)
  }
}

// Function to generate fallback content when the API fails
function generateFallbackContent(topic: string, mainConcept: string, promptTemplate: string): string {
  // Check the prompt type to generate appropriate fallback content
  if (promptTemplate.includes("definition")) {
    return `${topic} is a key concept related to ${mainConcept} that plays an important role in this domain.`
  } else if (promptTemplate.includes("components") || promptTemplate.includes("elements")) {
    return `Key aspects that make up ${topic} in the context of ${mainConcept}.`
  } else if (promptTemplate.includes("examples")) {
    return `Common examples that demonstrate ${topic} in practical applications.`
  } else if (promptTemplate.includes("advantages") || promptTemplate.includes("benefits")) {
    return `Benefits that ${topic} provides in relation to ${mainConcept}.`
  } else if (promptTemplate.includes("limitations") || promptTemplate.includes("drawbacks")) {
    return `Potential challenges or constraints associated with ${topic}.`
  } else {
    return `Information about ${topic} related to ${mainConcept}.`
  }
}

// Modify the analyzePrompt function to be async
export async function analyzePrompt(prompt: string): Promise<PromptAnalysis> {
  // Clean and normalize the prompt
  const cleanPrompt = prompt.trim()

  if (!cleanPrompt) {
    throw new Error("Prompt cannot be empty")
  }

  // Identify the type of prompt
  const promptType = identifyPromptType(cleanPrompt)

  // Extract the main concept
  const mainConcept = extractMainConcept(cleanPrompt, promptType)

  if (!mainConcept || mainConcept.trim() === "") {
    throw new Error("Could not extract main concept from prompt")
  }

  // Generate topics based on the prompt type and content
  const topics = await generateTopics(cleanPrompt, mainConcept, promptType)

  return {
    mainConcept,
    type: promptType,
    topics,
  }
}

// Identify the type of prompt
function identifyPromptType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  // Check for "how to" patterns
  if (
    lowerPrompt.startsWith("how to") ||
    lowerPrompt.includes("steps to") ||
    lowerPrompt.includes("guide to") ||
    lowerPrompt.includes("process of") ||
    lowerPrompt.includes("method for") ||
    lowerPrompt.includes("ways to")
  ) {
    return "how-to"
  }

  // Check for formula/equation patterns
  if (
    lowerPrompt.includes("formula") ||
    lowerPrompt.includes("equation") ||
    lowerPrompt.includes("calculate") ||
    lowerPrompt.includes("computation") ||
    /[a-z]=/.test(lowerPrompt) || // Simple variable assignment
    /\d+\s*[+\-*/]\s*\d+/.test(lowerPrompt) // Mathematical operations
  ) {
    return "formula"
  }

  // Check for comparison patterns
  if (
    lowerPrompt.includes(" vs ") ||
    lowerPrompt.includes("versus") ||
    lowerPrompt.includes("compared to") ||
    lowerPrompt.includes("differences between") ||
    lowerPrompt.includes("similarities between")
  ) {
    return "comparison"
  }

  // Check for problem-solution patterns
  if (
    lowerPrompt.includes("problem") ||
    lowerPrompt.includes("solution") ||
    lowerPrompt.includes("issue") ||
    lowerPrompt.includes("resolve") ||
    lowerPrompt.includes("fix") ||
    lowerPrompt.includes("troubleshoot")
  ) {
    return "problem-solution"
  }

  // Check for definition patterns
  if (
    lowerPrompt.startsWith("what is") ||
    lowerPrompt.startsWith("define") ||
    lowerPrompt.includes("meaning of") ||
    lowerPrompt.includes("definition of")
  ) {
    return "definition"
  }

  // Check for list patterns
  if (
    lowerPrompt.includes("list of") ||
    lowerPrompt.includes("types of") ||
    lowerPrompt.includes("examples of") ||
    lowerPrompt.includes("kinds of")
  ) {
    return "list"
  }

  // Default to concept explanation
  return "concept"
}

// Extract the main concept from the prompt
function extractMainConcept(prompt: string, promptType: string): string {
  const lowerPrompt = prompt.toLowerCase()

  // Extract based on prompt type
  switch (promptType) {
    case "how-to": {
      const match = lowerPrompt.match(/how to (.+)/)
      if (match) return capitalizeFirstLetter(match[1])
      break
    }

    case "formula": {
      const match =
        lowerPrompt.match(/formula (?:for|of) (.+)/) ||
        lowerPrompt.match(/equation (?:for|of) (.+)/) ||
        lowerPrompt.match(/calculate (.+)/)
      if (match) return capitalizeFirstLetter(match[1])

      // Try to extract the formula itself
      const formulaMatch = prompt.match(/([A-Za-z]+\s*=\s*[A-Za-z0-9\s+\-*/^()]+)/)
      if (formulaMatch) return formulaMatch[1]
      break
    }

    case "comparison": {
      const match =
        lowerPrompt.match(/(.+) vs (.+)/) ||
        lowerPrompt.match(/(.+) versus (.+)/) ||
        lowerPrompt.match(/compare (.+) and (.+)/) ||
        lowerPrompt.match(/differences between (.+) and (.+)/)
      if (match) return `${capitalizeFirstLetter(match[1])} vs ${capitalizeFirstLetter(match[2])}`
      break
    }

    case "definition": {
      const match =
        lowerPrompt.match(/what is (?:a |an )?(.+)/) ||
        lowerPrompt.match(/define (?:a |an )?(.+)/) ||
        lowerPrompt.match(/meaning of (.+)/)
      if (match) return capitalizeFirstLetter(match[1])
      break
    }
  }

  // Default extraction for other types
  // Look for noun phrases or key terms
  const nounPhraseMatch = prompt.match(/\b[A-Z][a-z]+ [a-z]+ [a-z]+\b|\b[A-Z][a-z]+ [a-z]+\b/)
  if (nounPhraseMatch) return nounPhraseMatch[0]

  // Extract the first few words if nothing else works
  const words = prompt.split(/\s+/)
  return words.slice(0, Math.min(5, words.length)).join(" ")
}

// Modify the generateTopics function to be async
async function generateTopics(prompt: string, mainConcept: string, promptType: string): Promise<Topic[]> {
  switch (promptType) {
    case "how-to":
      return generateHowToTopics(prompt, mainConcept)
    case "formula":
      return generateFormulaTopics(prompt, mainConcept)
    case "comparison":
      return generateComparisonTopics(prompt, mainConcept)
    case "problem-solution":
      return generateProblemSolutionTopics(prompt, mainConcept)
    case "definition":
      return generateDefinitionTopics(prompt, mainConcept)
    case "list":
      return generateListTopics(prompt, mainConcept)
    case "concept":
    default:
      return generateConceptTopics(prompt, mainConcept)
  }
}

// Generate topics for "how to" prompts
function generateHowToTopics(prompt: string, mainConcept: string): Topic[] {
  const topics: Topic[] = []
  const lowerPrompt = prompt.toLowerCase()

  // Extract steps from the prompt
  const steps = extractSteps(prompt)

  // Add steps as a topic
  topics.push({
    name: "Steps",
    relation: "follow these",
    details: `A sequential process to ${mainConcept} broken down into manageable steps. Follow these in order for best results.`,
    subtopics: steps.map((step, index) => ({
      name: `${index + 1}. ${step.title}`,
      relation: index === 0 ? "start with" : index === steps.length - 1 ? "finish with" : "then",
      details:
        step.description ||
        `Detailed instructions for step ${index + 1}: ${step.title}. ${index === 0 ? "This is where you begin the process." : index === steps.length - 1 ? "This completes the process." : "This continues the sequence of steps."}`,
      children: step.details.map((detail) => ({
        name: detail.text,
        relation: detail.relation,
        details: `Important consideration for this step: ${detail.text}. This aspect is crucial for success.`,
      })),
    })),
  })

  // Add materials/requirements
  topics.push({
    name: "Requirements",
    relation: "you'll need",
    details: `Essential items, tools, and prerequisites needed to successfully ${mainConcept}. Make sure you have these before starting.`,
    subtopics: extractRequirements(prompt, mainConcept).map((req) => ({
      name: req.name,
      relation: "necessary for",
      details:
        req.description ||
        `${req.name} is an essential requirement for this process. Without this, you may encounter difficulties or be unable to complete the task.`,
    })),
  })

  // Add tips/best practices
  topics.push({
    name: "Tips & Best Practices",
    relation: "consider these",
    details: `Expert advice and recommendations to improve your results when trying to ${mainConcept}. These insights can make a significant difference.`,
    subtopics: extractTips(prompt, mainConcept).map((tip) => ({
      name: tip.name,
      relation: "helps with",
      details:
        tip.description ||
        `${tip.name} is a valuable practice that can significantly improve your results. Experienced practitioners recommend this approach.`,
    })),
  })

  // Add common challenges
  topics.push({
    name: "Common Challenges",
    relation: "watch out for",
    details: `Potential obstacles and difficulties you might encounter when attempting to ${mainConcept}. Being aware of these will help you prepare and overcome them.`,
    subtopics: extractChallenges(prompt, mainConcept).map((challenge) => ({
      name: challenge.name,
      relation: "may encounter",
      details:
        challenge.description ||
        `${challenge.name} is a frequent issue that many people face. Understanding this challenge in advance will help you navigate it more effectively.`,
    })),
  })

  return topics
}

// Generate topics for formula prompts
function generateFormulaTopics(prompt: string, mainConcept: string): Topic[] {
  const topics: Topic[] = []

  // Extract formula information
  const formulaInfo = extractFormulaInfo(prompt, mainConcept)

  // Add the formula itself
  topics.push({
    name: "Formula",
    relation: "expressed as",
    details: "The mathematical expression that defines the relationship",
    subtopics: [
      {
        name: formulaInfo.formula,
        relation: "written as",
        details: "The standard mathematical notation",
      },
    ],
  })

  // Add variables
  topics.push({
    name: "Variables",
    relation: "consists of",
    subtopics: formulaInfo.variables.map((variable) => ({
      name: `${variable.symbol}: ${variable.name}`,
      relation: "represents",
      details: variable.description,
    })),
  })

  // Add calculation steps
  topics.push({
    name: "How to Calculate",
    relation: "computed by",
    subtopics: formulaInfo.steps.map((step, index) => ({
      name: `Step ${index + 1}: ${step}`,
      relation: index === 0 ? "start with" : "then",
    })),
  })

  // Add applications
  topics.push({
    name: "Applications",
    relation: "used in",
    subtopics: formulaInfo.applications.map((app) => ({
      name: app,
      relation: "applied to",
    })),
  })

  // Add constraints/limitations
  topics.push({
    name: "Constraints",
    relation: "limited by",
    subtopics: formulaInfo.constraints.map((constraint) => ({
      name: constraint,
      relation: "restricted by",
    })),
  })

  return topics
}

// Generate topics for comparison prompts
function generateComparisonTopics(prompt: string, mainConcept: string): Topic[] {
  const topics: Topic[] = []

  // Extract the items being compared
  const comparisonItems = extractComparisonItems(prompt)

  // Add first item
  topics.push({
    name: comparisonItems.item1,
    relation: "compared with",
    subtopics: extractItemFeatures(prompt, comparisonItems.item1).map((feature) => ({
      name: feature.name,
      relation: "characterized by",
      details: feature.description,
    })),
  })

  // Add second item
  topics.push({
    name: comparisonItems.item2,
    relation: "compared with",
    subtopics: extractItemFeatures(prompt, comparisonItems.item2).map((feature) => ({
      name: feature.name,
      relation: "characterized by",
      details: feature.description,
    })),
  })

  // Add similarities
  topics.push({
    name: "Similarities",
    relation: "shared aspects",
    subtopics: extractSimilarities(prompt, comparisonItems).map((similarity) => ({
      name: similarity.name,
      relation: "both have",
      details: similarity.description,
    })),
  })

  // Add differences
  topics.push({
    name: "Differences",
    relation: "distinctions",
    subtopics: extractDifferences(prompt, comparisonItems).map((difference) => ({
      name: difference.name,
      relation: "differ in",
      details: difference.description,
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
        details: extractUseCases(prompt, comparisonItems.item1),
      },
      {
        name: `When to use ${comparisonItems.item2}`,
        relation: "prefer when",
        details: extractUseCases(prompt, comparisonItems.item2),
      },
    ],
  })

  return topics
}

// Generate topics for problem-solution prompts
function generateProblemSolutionTopics(prompt: string, mainConcept: string): Topic[] {
  const topics: Topic[] = []

  // Extract problem information
  const problemInfo = extractProblemInfo(prompt, mainConcept)

  // Add problem description
  topics.push({
    name: "Problem",
    relation: "issue is",
    details: problemInfo.description,
    subtopics: [
      {
        name: "Symptoms",
        relation: "manifests as",
        details: "Observable signs of the problem",
        children: problemInfo.symptoms.map((symptom) => ({
          name: symptom,
          relation: "indicated by",
        })),
      },
    ],
  })

  // Add causes
  topics.push({
    name: "Causes",
    relation: "caused by",
    subtopics: problemInfo.causes.map((cause) => ({
      name: cause.name,
      relation: "results from",
      details: cause.description,
    })),
  })

  // Add solutions
  topics.push({
    name: "Solutions",
    relation: "resolved by",
    subtopics: problemInfo.solutions.map((solution, index) => ({
      name: solution.name,
      relation: index === 0 ? "best approach" : "alternative",
      details: solution.description,
      children: solution.steps
        ? solution.steps.map((step, i) => ({
            name: `Step ${i + 1}: ${step}`,
            relation: "then",
          }))
        : [],
    })),
  })

  // Add prevention
  topics.push({
    name: "Prevention",
    relation: "avoided by",
    subtopics: problemInfo.prevention.map((prevention) => ({
      name: prevention,
      relation: "prevents recurrence",
    })),
  })

  return topics
}

// Generate topics for definition prompts
function generateDefinitionTopics(prompt: string, mainConcept: string): Topic[] {
  const topics: Topic[] = []

  // Extract definition information
  const definitionInfo = extractDefinitionInfo(prompt, mainConcept)

  // Add formal definition
  topics.push({
    name: "Definition",
    relation: "means",
    details: "The formal meaning and explanation",
    subtopics: [
      {
        name: definitionInfo.formal,
        relation: "formally defined as",
        details: "The technical or academic definition",
      },
      {
        name: definitionInfo.simple,
        relation: "in simple terms",
        details: "An easier way to understand it",
      },
    ],
  })

  // Add key characteristics
  topics.push({
    name: "Characteristics",
    relation: "features",
    subtopics: definitionInfo.characteristics.map((char) => ({
      name: char,
      relation: "characterized by",
    })),
  })

  // Add examples
  topics.push({
    name: "Examples",
    relation: "illustrated by",
    subtopics: definitionInfo.examples.map((example) => ({
      name: example,
      relation: "such as",
    })),
  })

  // Add related concepts
  topics.push({
    name: "Related Concepts",
    relation: "connected to",
    subtopics: definitionInfo.related.map((related) => ({
      name: related.name,
      relation: related.relation,
    })),
  })

  return topics
}

// Generate topics for list prompts
function generateListTopics(prompt: string, mainConcept: string): Topic[] {
  const topics: Topic[] = []

  // Extract list information
  const listInfo = extractListInfo(prompt, mainConcept)

  // Add overview
  topics.push({
    name: "Overview",
    relation: "about",
    details: listInfo.description,
    subtopics: [
      {
        name: "Definition",
        relation: "refers to",
        details: listInfo.definition,
      },
    ],
  })

  // Add categories
  listInfo.categories.forEach((category) => {
    topics.push({
      name: category.name,
      relation: "includes",
      details: category.description,
      subtopics: category.items.map((item) => ({
        name: item.name,
        relation: "example of",
        details: item.description,
      })),
    })
  })

  // Add criteria
  topics.push({
    name: "Selection Criteria",
    relation: "chosen by",
    subtopics: listInfo.criteria.map((criterion) => ({
      name: criterion,
      relation: "consider",
    })),
  })

  return topics
}

// Generate topics for concept explanation prompts
async function generateConceptTopics(prompt: string, mainConcept: string): Promise<Topic[]> {
  const topics: Topic[] = []

  // Validate mainConcept
  if (!mainConcept || mainConcept.trim() === "") {
    throw new Error("Main concept cannot be empty")
  }

  // Generate a definition using AI
  const definitionPrompt = `Provide a concise definition of "${mainConcept}" in 1-2 sentences.`
  const definition = await generateContentWithAI(mainConcept, mainConcept, definitionPrompt)

  // Generate a core concept description using AI
  const corePrompt = `Explain the fundamental essence of "${mainConcept}" in 1-2 sentences.`
  const core = await generateContentWithAI(mainConcept, mainConcept, corePrompt)

  // Add definition
  topics.push({
    name: "Definition",
    relation: "means",
    details: `${mainConcept} refers to ${definition}`,
    subtopics: [
      {
        name: "Core Concept",
        relation: "essentially",
        details: core,
      },
    ],
  })

  // Generate components using AI
  const componentsPrompt = `List 3 key components or elements of "${mainConcept}" with a brief description for each.`
  const componentsText = await generateContentWithAI(mainConcept, mainConcept, componentsPrompt)

  // Parse components from the text (simple parsing)
  const componentLines = componentsText.split("\n").filter((line) => line.trim().length > 0)
  const components = componentLines
    .map((line) => {
      const parts = line.split(":")
      const name = parts[0].replace(/^\d+\.\s*/, "").trim()
      const description = parts.length > 1 ? parts[1].trim() : `A key element of ${mainConcept}`
      return { name, description }
    })
    .slice(0, 3)

  // If parsing failed, create default components
  if (components.length === 0) {
    components.push(
      { name: "Primary Element", description: `The most essential aspect of ${mainConcept}` },
      { name: "Supporting Structure", description: `Elements that enhance ${mainConcept}` },
      { name: "Operational Mechanisms", description: `Processes that enable ${mainConcept} to function` },
    )
  }

  // Add components
  topics.push({
    name: "Components",
    relation: "consists of",
    details: `The key elements that make up ${mainConcept}`,
    subtopics: components.map((component) => ({
      name: component.name,
      relation: "part of",
      details: component.description,
    })),
  })

  // Generate examples using AI
  const examplesPrompt = `List 3 concrete examples of "${mainConcept}".`
  const examplesText = await generateContentWithAI(mainConcept, mainConcept, examplesPrompt)

  // Parse examples from the text
  const exampleLines = examplesText.split("\n").filter((line) => line.trim().length > 0)
  const examples = exampleLines.map((line) => line.replace(/^\d+\.\s*/, "").trim()).slice(0, 3)

  // If parsing failed, create default examples
  if (examples.length === 0) {
    examples.push("Example 1", "Example 2", "Example 3")
  }

  // Add examples
  topics.push({
    name: "Examples",
    relation: "such as",
    details: `Real-world instances of ${mainConcept}`,
    subtopics: examples.map((example) => ({
      name: example,
      relation: "illustrates",
      details: `${example} demonstrates key aspects of ${mainConcept}`,
    })),
  })

  // Generate applications using AI
  const applicationsPrompt = `List 3 practical applications or uses of "${mainConcept}" with a brief description for each.`
  const applicationsText = await generateContentWithAI(mainConcept, mainConcept, applicationsPrompt)

  // Parse applications from the text
  const applicationLines = applicationsText.split("\n").filter((line) => line.trim().length > 0)
  const applications = applicationLines
    .map((line) => {
      const parts = line.split(":")
      const name = parts[0].replace(/^\d+\.\s*/, "").trim()
      const description = parts.length > 1 ? parts[1].trim() : `A practical use of ${mainConcept}`
      return { name, description }
    })
    .slice(0, 3)

  // If parsing failed, create default applications
  if (applications.length === 0) {
    applications.push(
      { name: "Primary Use Case", description: `The most common implementation of ${mainConcept}` },
      { name: "Secondary Application", description: `Alternative way ${mainConcept} is applied` },
      { name: "Emerging Utilization", description: `New and developing application of ${mainConcept}` },
    )
  }

  // Add applications
  topics.push({
    name: "Applications",
    relation: "used for",
    details: `Practical uses and implementations of ${mainConcept}`,
    subtopics: applications.map((app) => ({
      name: app.name,
      relation: "applied in",
      details: app.description,
    })),
  })

  // Generate advantages and limitations using AI
  const prosConsPrompt = `List 3 advantages and 3 limitations of "${mainConcept}".`
  const prosConsText = await generateContentWithAI(mainConcept, mainConcept, prosConsPrompt)

  // Try to parse advantages and limitations
  const lines = prosConsText.split("\n").filter((line) => line.trim().length > 0)
  let advantages = []
  let limitations = []

  let currentSection = ""
  for (const line of lines) {
    if (
      line.toLowerCase().includes("advantage") ||
      line.toLowerCase().includes("benefit") ||
      line.toLowerCase().includes("pro")
    ) {
      currentSection = "advantages"
      continue
    } else if (
      line.toLowerCase().includes("limitation") ||
      line.toLowerCase().includes("drawback") ||
      line.toLowerCase().includes("con")
    ) {
      currentSection = "limitations"
      continue
    }

    const cleanLine = line.replace(/^\d+\.\s*/, "").trim()
    if (cleanLine.length > 0) {
      if (currentSection === "advantages") {
        advantages.push(cleanLine)
      } else if (currentSection === "limitations") {
        limitations.push(cleanLine)
      }
    }
  }

  // If parsing failed, create default advantages and limitations
  if (advantages.length === 0) {
    advantages = ["Increased Efficiency", "Improved Quality", "Enhanced Flexibility"]
  }

  if (limitations.length === 0) {
    limitations = ["Resource Requirements", "Implementation Complexity", "Potential Drawbacks"]
  }

  // Limit to 3 items each
  advantages = advantages.slice(0, 3)
  limitations = limitations.slice(0, 3)

  // Add advantages and limitations
  topics.push({
    name: "Pros & Cons",
    relation: "evaluated by",
    details: `Benefits and drawbacks of ${mainConcept}`,
    subtopics: [
      {
        name: "Advantages",
        relation: "benefits include",
        details: `Key benefits of ${mainConcept}`,
        children: advantages.map((adv) => ({
          name: adv,
          relation: "provides",
          details: `${adv} is a significant advantage of ${mainConcept}`,
        })),
      },
      {
        name: "Limitations",
        relation: "drawbacks include",
        details: `Important constraints and challenges of ${mainConcept}`,
        children: limitations.map((lim) => ({
          name: lim,
          relation: "limited by",
          details: `${lim} represents a notable limitation of ${mainConcept}`,
        })),
      },
    ],
  })

  return topics
}

// Extract concept information
function extractConceptInfo(
  prompt: string,
  mainConcept: string,
): {
  definition: string
  core: string
  components: Array<{ name: string; description: string }>
  examples: string[]
  applications: Array<{ name: string; description: string }>
  advantages: string[]
  limitations: string[]
} {
  // Try to extract domain-specific information based on the prompt
  const domain = identifyDomain(prompt)

  // Generate domain-specific content
  switch (domain) {
    case "technology":
      return {
        definition: "a set of tools, methods, and processes used to solve problems or achieve objectives",
        core: "The practical application of knowledge to address specific challenges",
        components: [
          { name: "Hardware", description: "Physical components and devices that make up systems" },
          { name: "Software", description: "Programs and applications that run on hardware" },
          { name: "Infrastructure", description: "Underlying systems that support technological operations" },
        ],
        examples: ["Artificial Intelligence", "Cloud Computing", "Mobile Applications"],
        applications: [
          { name: "Business Operations", description: "Streamlining processes and improving efficiency" },
          { name: "Communication", description: "Enabling faster and more effective information exchange" },
          { name: "Data Analysis", description: "Processing large volumes of information for insights" },
        ],
        advantages: ["Increased Efficiency", "Improved Accuracy", "Enhanced Scalability"],
        limitations: ["Technical Complexity", "Implementation Costs", "Security Vulnerabilities"],
      }

    case "business":
      return {
        definition: "organizational activities focused on commercial, industrial, or professional operations",
        core: "The creation and exchange of goods, services, or value in a marketplace",
        components: [
          { name: "Strategy", description: "Long-term planning and direction for achieving objectives" },
          { name: "Operations", description: "Day-to-day activities that deliver products or services" },
          { name: "Finance", description: "Management of monetary resources and investments" },
        ],
        examples: ["E-commerce", "Manufacturing", "Consulting Services"],
        applications: [
          { name: "Market Expansion", description: "Growing into new customer segments or regions" },
          { name: "Product Development", description: "Creating new offerings to meet customer needs" },
          { name: "Customer Relationship Management", description: "Building and maintaining client connections" },
        ],
        advantages: ["Revenue Generation", "Market Influence", "Economic Growth"],
        limitations: ["Market Competition", "Regulatory Constraints", "Resource Dependencies"],
      }

    case "science":
      return {
        definition: "systematic study of the structure and behavior of the physical and natural world",
        core: "The pursuit of knowledge through observation, experimentation, and theoretical explanation",
        components: [
          { name: "Research Methods", description: "Systematic approaches to investigating phenomena" },
          { name: "Empirical Evidence", description: "Data collected through observation and experimentation" },
          { name: "Theoretical Frameworks", description: "Conceptual structures that explain observations" },
        ],
        examples: ["Physics", "Biology", "Chemistry"],
        applications: [
          { name: "Medical Advancements", description: "Improving healthcare and treatment options" },
          { name: "Environmental Management", description: "Understanding and protecting natural systems" },
          { name: "Technological Innovation", description: "Developing new tools and capabilities" },
        ],
        advantages: ["Knowledge Advancement", "Problem Solving", "Innovation Enablement"],
        limitations: ["Methodological Constraints", "Funding Challenges", "Ethical Considerations"],
      }

    default:
      // Generic content for any concept
      return {
        definition: `a concept or system related to ${mainConcept}`,
        core: `The fundamental essence of ${mainConcept} and its primary purpose`,
        components: [
          { name: "Primary Element", description: "The most essential aspect that defines the concept" },
          { name: "Supporting Structure", description: "Elements that enhance and maintain the primary function" },
          { name: "Operational Mechanisms", description: "Processes that enable the concept to function" },
        ],
        examples: ["Practical Application 1", "Real-world Example 2", "Common Instance 3"],
        applications: [
          { name: "Primary Use Case", description: "The most common implementation or application" },
          { name: "Secondary Application", description: "Alternative ways the concept is applied" },
          { name: "Emerging Utilization", description: "New and developing applications of the concept" },
        ],
        advantages: ["Key Benefit 1", "Significant Advantage 2", "Important Strength 3"],
        limitations: ["Notable Constraint 1", "Significant Challenge 2", "Important Limitation 3"],
      }
  }
}

// Identify the domain of the prompt
function identifyDomain(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  // Technology domain keywords
  if (
    lowerPrompt.includes("technology") ||
    lowerPrompt.includes("software") ||
    lowerPrompt.includes("hardware") ||
    lowerPrompt.includes("digital") ||
    lowerPrompt.includes("computer") ||
    lowerPrompt.includes("internet") ||
    lowerPrompt.includes("app") ||
    lowerPrompt.includes("programming") ||
    lowerPrompt.includes("code") ||
    lowerPrompt.includes("data")
  ) {
    return "technology"
  }

  // Business domain keywords
  if (
    lowerPrompt.includes("business") ||
    lowerPrompt.includes("company") ||
    lowerPrompt.includes("market") ||
    lowerPrompt.includes("finance") ||
    lowerPrompt.includes("management") ||
    lowerPrompt.includes("strategy") ||
    lowerPrompt.includes("customer") ||
    lowerPrompt.includes("product") ||
    lowerPrompt.includes("service") ||
    lowerPrompt.includes("profit")
  ) {
    return "business"
  }

  // Science domain keywords
  if (
    lowerPrompt.includes("science") ||
    lowerPrompt.includes("research") ||
    lowerPrompt.includes("experiment") ||
    lowerPrompt.includes("theory") ||
    lowerPrompt.includes("biology") ||
    lowerPrompt.includes("physics") ||
    lowerPrompt.includes("chemistry") ||
    lowerPrompt.includes("laboratory") ||
    lowerPrompt.includes("scientific") ||
    lowerPrompt.includes("hypothesis")
  ) {
    return "science"
  }

  // Default to generic domain
  return "generic"
}

// Helper functions to extract specific information from prompts

// Extract steps from a "how to" prompt
function extractSteps(prompt: string): Array<{
  title: string
  description: string
  details: Array<{ text: string; relation: string }>
}> {
  const lowerPrompt = prompt.toLowerCase()
  const steps = []

  // Try to identify explicit steps in the prompt
  const lines = prompt.split(/\n/)
  const numberedSteps = lines.filter((line) => /^\d+\.\s/.test(line.trim()))

  if (numberedSteps.length >= 2) {
    // Use explicitly numbered steps
    return numberedSteps.map((line, index) => {
      const stepText = line.replace(/^\d+\.\s/, "").trim()
      return {
        title: stepText,
        description: `Step ${index + 1} in the process`,
        details: generateStepDetails(stepText, index),
      }
    })
  }

  // Check for bullet points
  const bulletSteps = lines.filter((line) => /^[•*-]\s/.test(line.trim()))

  if (bulletSteps.length >= 2) {
    // Use bullet point steps
    return bulletSteps.map((line, index) => {
      const stepText = line.replace(/^[•*-]\s/, "").trim()
      return {
        title: stepText,
        description: `Step ${index + 1} in the process`,
        details: generateStepDetails(stepText, index),
      }
    })
  }

  // If no explicit steps, generate logical steps based on the task
  const taskType = identifyTaskType(prompt)

  // Generate appropriate steps based on task type
  if (lowerPrompt.includes("cook") || lowerPrompt.includes("recipe") || lowerPrompt.includes("bake")) {
    return [
      {
        title: "Gather ingredients",
        description: "Collect all necessary ingredients before starting",
        details: [
          { text: "Check quantities", relation: "ensure" },
          { text: "Prepare substitutions if needed", relation: "consider" },
        ],
      },
      {
        title: "Prepare ingredients",
        description: "Process ingredients as needed before cooking",
        details: [
          { text: "Wash and clean", relation: "first" },
          { text: "Cut and measure", relation: "then" },
        ],
      },
      {
        title: "Combine and cook",
        description: "Mix ingredients and apply heat as specified",
        details: [
          { text: "Follow recipe order", relation: "important" },
          { text: "Monitor temperature", relation: "carefully" },
        ],
      },
      {
        title: "Finish and serve",
        description: "Complete final steps and present the dish",
        details: [
          { text: "Check doneness", relation: "verify" },
          { text: "Plate presentation", relation: "consider" },
        ],
      },
    ]
  } else if (lowerPrompt.includes("build") || lowerPrompt.includes("make") || lowerPrompt.includes("create")) {
    return [
      {
        title: "Gather materials",
        description: "Collect all necessary materials and tools",
        details: [
          { text: "Check inventory", relation: "against list" },
          { text: "Prepare workspace", relation: "by clearing" },
        ],
      },
      {
        title: "Prepare components",
        description: "Process individual parts before assembly",
        details: [
          { text: "Measure twice, cut once", relation: "remember" },
          { text: "Pre-assemble sections", relation: "when possible" },
        ],
      },
      {
        title: "Assemble main structure",
        description: "Put together the core components",
        details: [
          { text: "Follow blueprint/plan", relation: "carefully" },
          { text: "Secure connections", relation: "firmly" },
        ],
      },
      {
        title: "Finish and test",
        description: "Complete final details and verify functionality",
        details: [
          { text: "Add finishing touches", relation: "for quality" },
          { text: "Test functionality", relation: "thoroughly" },
        ],
      },
    ]
  } else {
    // Generic steps for other types of tasks
    return [
      {
        title: "Preparation",
        description: "Get ready with all necessary resources",
        details: [
          { text: "Gather requirements", relation: "first" },
          { text: "Plan approach", relation: "then" },
        ],
      },
      {
        title: "Initial steps",
        description: "Begin the process with foundational actions",
        details: [
          { text: "Start with basics", relation: "building" },
          { text: "Establish foundation", relation: "carefully" },
        ],
      },
      {
        title: "Main process",
        description: "Execute the core activities",
        details: [
          { text: "Follow key techniques", relation: "applying" },
          { text: "Monitor progress", relation: "continuously" },
        ],
      },
      {
        title: "Completion",
        description: "Finalize and verify results",
        details: [
          { text: "Finish remaining tasks", relation: "thoroughly" },
          { text: "Verify outcome", relation: "ensuring quality" },
        ],
      },
    ]
  }
}

// Generate details for a step
function generateStepDetails(step: string, stepIndex: number): Array<{ text: string; relation: string }> {
  const lowerStep = step.toLowerCase()
  const details = []

  // Generate relevant details based on step content
  if (lowerStep.includes("prepare") || lowerStep.includes("gather") || stepIndex === 0) {
    details.push({ text: "Required materials", relation: "needs" })
    details.push({ text: "Preparation time", relation: "takes" })
  } else if (lowerStep.includes("mix") || lowerStep.includes("combine") || lowerStep.includes("assemble")) {
    details.push({ text: "Proper technique", relation: "requires" })
    details.push({ text: "Common mistakes", relation: "avoid" })
  } else if (lowerStep.includes("cook") || lowerStep.includes("bake") || lowerStep.includes("heat")) {
    details.push({ text: "Temperature setting", relation: "at" })
    details.push({ text: "Timing guidelines", relation: "for" })
  } else if (lowerStep.includes("check") || lowerStep.includes("test") || lowerStep.includes("verify")) {
    details.push({ text: "Success indicators", relation: "look for" })
    details.push({ text: "Troubleshooting", relation: "if needed" })
  } else {
    // Generic details based on step position
    if (stepIndex === 0) {
      details.push({ text: "Getting started", relation: "begins with" })
      details.push({ text: "Initial setup", relation: "requires" })
    } else if (stepIndex === 1) {
      details.push({ text: "Key technique", relation: "using" })
      details.push({ text: "Important considerations", relation: "with" })
    } else if (stepIndex === 2) {
      details.push({ text: "Progress indicators", relation: "looking for" })
      details.push({ text: "Common challenges", relation: "overcoming" })
    } else {
      details.push({ text: "Finishing touches", relation: "adding" })
      details.push({ text: "Quality check", relation: "performing" })
    }
  }

  return details
}

// Identify the type of task in a "how to" prompt
function identifyTaskType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes("cook") || lowerPrompt.includes("bake") || lowerPrompt.includes("recipe")) {
    return "cooking"
  } else if (lowerPrompt.includes("build") || lowerPrompt.includes("make") || lowerPrompt.includes("create")) {
    return "building"
  } else if (lowerPrompt.includes("fix") || lowerPrompt.includes("repair") || lowerPrompt.includes("solve")) {
    return "fixing"
  } else if (lowerPrompt.includes("learn") || lowerPrompt.includes("study") || lowerPrompt.includes("understand")) {
    return "learning"
  } else {
    return "general"
  }
}

// Extract requirements for a task
function extractRequirements(prompt: string, mainConcept: string): Array<{ name: string; description: string }> {
  const taskType = identifyTaskType(prompt)

  switch (taskType) {
    case "cooking":
      return [
        { name: "Ingredients", description: "Essential components for the recipe" },
        { name: "Kitchen Equipment", description: "Tools needed for preparation and cooking" },
        { name: "Time", description: "Total preparation and cooking duration" },
      ]
    case "building":
      return [
        { name: "Materials", description: "Physical components needed for construction" },
        { name: "Tools", description: "Equipment required for assembly and finishing" },
        { name: "Skills", description: "Technical abilities needed for successful completion" },
      ]
    case "fixing":
      return [
        { name: "Diagnostic Tools", description: "Equipment to identify the problem" },
        { name: "Replacement Parts", description: "Components that may need to be replaced" },
        { name: "Technical Knowledge", description: "Understanding of the system being fixed" },
      ]
    case "learning":
      return [
        { name: "Resources", description: "Materials needed for study and practice" },
        { name: "Prerequisites", description: "Prior knowledge or skills required" },
        { name: "Time Commitment", description: "Expected duration for mastery" },
      ]
    default:
      return [
        { name: "Essential Resources", description: "Key materials needed for the task" },
        { name: "Knowledge Base", description: "Information required to proceed" },
        { name: "Time & Effort", description: "Expected investment to complete" },
      ]
  }
}

// Extract tips for a task
function extractTips(prompt: string, mainConcept: string): Array<{ name: string; description: string }> {
  const taskType = identifyTaskType(prompt)

  switch (taskType) {
    case "cooking":
      return [
        { name: "Mise en Place", description: "Prepare and organize all ingredients before starting" },
        { name: "Temperature Control", description: "Monitor and adjust heat for optimal results" },
        { name: "Taste as You Go", description: "Regularly check flavor and adjust seasonings" },
      ]
    case "building":
      return [
        { name: "Measure Twice, Cut Once", description: "Verify measurements before making irreversible cuts" },
        { name: "Use Proper Safety Equipment", description: "Protect yourself with appropriate gear" },
        { name: "Work Systematically", description: "Follow a logical order to avoid mistakes" },
      ]
    case "fixing":
      return [
        { name: "Document Original State", description: "Take photos or notes before disassembly" },
        { name: "Isolate Variables", description: "Change one thing at a time when troubleshooting" },
        { name: "Keep Track of Parts", description: "Organize components during disassembly" },
      ]
    default:
      return [
        { name: "Plan Ahead", description: "Think through the process before starting" },
        { name: "Take Breaks", description: "Maintain focus with periodic rest periods" },
        { name: "Document Your Process", description: "Keep notes for future reference" },
      ]
  }
}

// Extract challenges for a task
function extractChallenges(prompt: string, mainConcept: string): Array<{ name: string; description: string }> {
  const taskType = identifyTaskType(prompt)

  switch (taskType) {
    case "cooking":
      return [
        { name: "Timing Issues", description: "Coordinating multiple components to finish together" },
        { name: "Ingredient Substitutions", description: "Finding appropriate alternatives when needed" },
        { name: "Temperature Management", description: "Maintaining proper cooking temperatures" },
      ]
    case "building":
      return [
        { name: "Alignment Problems", description: "Ensuring components fit together properly" },
        { name: "Material Variations", description: "Adapting to inconsistencies in materials" },
        { name: "Tool Limitations", description: "Working around inadequate equipment" },
      ]
    case "fixing":
      return [
        { name: "Diagnostic Uncertainty", description: "Identifying the true cause of problems" },
        { name: "Hidden Damage", description: "Discovering additional issues during repair" },
        { name: "Specialized Components", description: "Sourcing difficult-to-find parts" },
      ]
    default:
      return [
        { name: "Time Management", description: "Allocating sufficient time for completion" },
        { name: "Unexpected Complications", description: "Handling unforeseen issues" },
        { name: "Knowledge Gaps", description: "Overcoming areas of limited understanding" },
      ]
  }
}

// Extract formula information
function extractFormulaInfo(
  prompt: string,
  mainConcept: string,
): {
  formula: string
  variables: Array<{ symbol: string; name: string; description: string }>
  steps: string[]
  applications: string[]
  constraints: string[]
} {
  // Try to extract an actual formula if present
  let formula = "f(x) = y"
  const formulaMatch = prompt.match(/([A-Za-z]+\s*=\s*[A-Za-z0-9\s+\-*/^()]+)/)
  if (formulaMatch) {
    formula = formulaMatch[1].trim()
  } else if (prompt.includes("=")) {
    // Try to extract a simpler equation
    const parts = prompt.split("=")
    if (parts.length >= 2) {
      formula = parts[0].trim() + " = " + parts[1].trim().split(/[\s,.]/, 1)[0]
    }
  }

  // Extract variables based on the formula
  const variables = []
  const variableSymbols = formula.match(/[A-Za-z]/g) || []
  const uniqueSymbols = [...new Set(variableSymbols)]

  uniqueSymbols.forEach((symbol) => {
    let name = ""
    let description = ""

    // Assign names based on common variables
    if (symbol === "x" || symbol === "X") {
      name = "Input variable"
      description = "The independent variable or input value"
    } else if (symbol === "y" || symbol === "Y") {
      name = "Output variable"
      description = "The dependent variable or result"
    } else if (symbol === "t" || symbol === "T") {
      name = "Time"
      description = "Time elapsed or duration"
    } else if (symbol === "v" || symbol === "V") {
      name = "Velocity"
      description = "Rate of change in position"
    } else if (symbol === "a" || symbol === "A") {
      name = "Acceleration"
      description = "Rate of change in velocity"
    } else if (symbol === "m" || symbol === "M") {
      name = "Mass"
      description = "Quantity of matter"
    } else if (symbol === "F" || symbol === "f") {
      name = "Force"
      description = "Influence that causes an object to change"
    } else if (symbol === "E" || symbol === "e") {
      name = "Energy"
      description = "Capacity to do work"
    } else {
      name = "Variable"
      description = "A quantity that may change"
    }

    variables.push({ symbol, name, description })
  })

  // If no variables were found, create some generic ones
  if (variables.length === 0) {
    variables.push(
      { symbol: "x", name: "Input", description: "The value being processed" },
      { symbol: "y", name: "Output", description: "The resulting value" },
    )
  }

  // Generate calculation steps
  const steps = [
    "Identify the values of all variables",
    "Substitute the values into the formula",
    "Perform the calculations following order of operations",
    "Verify the result and check units",
  ]

  // Generate applications
  const applications = [
    "Problem solving in related domains",
    "Predictive modeling and forecasting",
    "System analysis and optimization",
  ]

  // Generate constraints
  const constraints = [
    "Valid within specific parameter ranges",
    "Assumes ideal conditions",
    "May require adjustments for real-world scenarios",
  ]

  return {
    formula,
    variables,
    steps,
    applications,
    constraints,
  }
}

// Extract comparison items
function extractComparisonItems(prompt: string): { item1: string; item2: string } {
  // Check for "X vs Y" pattern
  const vsMatch = prompt.match(/([^\s]+)\s+(?:vs|versus)\s+([^\s.,]+)/)
  if (vsMatch) {
    return {
      item1: capitalizeFirstLetter(vsMatch[1]),
      item2: capitalizeFirstLetter(vsMatch[2]),
    }
  }

  // Check for "difference between X and Y" pattern
  const diffMatch = prompt.match(/differences?\s+between\s+([^\s]+)\s+and\s+([^\s.,]+)/)
  if (diffMatch) {
    return {
      item1: capitalizeFirstLetter(diffMatch[1]),
      item2: capitalizeFirstLetter(diffMatch[2]),
    }
  }

  // Check for "compare X and Y" pattern
  const compareMatch = prompt.match(/compare\s+([^\s]+)\s+and\s+([^\s.,]+)/)
  if (compareMatch) {
    return {
      item1: capitalizeFirstLetter(compareMatch[1]),
      item2: capitalizeFirstLetter(compareMatch[2]),
    }
  }

  // Default to generic items
  return {
    item1: "Item 1",
    item2: "Item 2",
  }
}

// Extract features for a comparison item
function extractItemFeatures(prompt: string, item: string): Array<{ name: string; description: string }> {
  // Generate generic features based on the item
  return [
    { name: "Key Characteristic", description: `Primary feature of ${item}` },
    { name: "Core Functionality", description: `Main purpose or function of ${item}` },
    { name: "Common Usage", description: `How ${item} is typically used` },
  ]
}

// Extract similarities between comparison items
function extractSimilarities(
  prompt: string,
  items: { item1: string; item2: string },
): Array<{ name: string; description: string }> {
  return [
    { name: "Common Purpose", description: `Both ${items.item1} and ${items.item2} serve similar functions` },
    { name: "Shared Features", description: "Features present in both items" },
    { name: "Overlapping Use Cases", description: "Scenarios where either can be used" },
  ]
}

// Extract differences between comparison items
function extractDifferences(
  prompt: string,
  items: { item1: string; item2: string },
): Array<{ name: string; description: string }> {
  return [
    { name: "Implementation Approach", description: `How ${items.item1} and ${items.item2} differ in approach` },
    { name: "Performance Characteristics", description: "Differences in efficiency and effectiveness" },
    { name: "Feature Set", description: "Unique capabilities of each option" },
  ]
}

// Extract use cases for a comparison item
function extractUseCases(prompt: string, item: string): string {
  return `Scenarios where ${item} is the preferred choice based on its strengths and characteristics`
}

// Extract problem information
function extractProblemInfo(
  prompt: string,
  mainConcept: string,
): {
  description: string
  symptoms: string[]
  causes: Array<{ name: string; description: string }>
  solutions: Array<{ name: string; description: string; steps?: string[] }>
  prevention: string[]
} {
  return {
    description: `Detailed explanation of the ${mainConcept} issue and its impact`,
    symptoms: ["Observable sign 1", "Observable sign 2", "Observable sign 3"],
    causes: [
      { name: "Primary Cause", description: "Main factor contributing to the problem" },
      { name: "Secondary Factor", description: "Additional element that may worsen the issue" },
      { name: "Environmental Condition", description: "External circumstances affecting the situation" },
    ],
    solutions: [
      {
        name: "Recommended Solution",
        description: "The most effective approach to resolve the issue",
        steps: [
          "Diagnose the specific problem",
          "Prepare necessary tools and resources",
          "Implement the fix methodically",
          "Verify the solution works properly",
        ],
      },
      {
        name: "Alternative Approach",
        description: "A different method that may work in certain situations",
        steps: [
          "Assess suitability for your specific case",
          "Gather alternative materials",
          "Follow modified procedure",
          "Test effectiveness",
        ],
      },
    ],
    prevention: ["Regular maintenance practice", "Proactive monitoring approach", "Environmental or behavioral change"],
  }
}

// Extract definition information
function extractDefinitionInfo(
  prompt: string,
  mainConcept: string,
): {
  formal: string
  simple: string
  characteristics: string[]
  examples: string[]
  related: Array<{ name: string; relation: string }>
} {
  return {
    formal: `The technical definition of ${mainConcept} with precise terminology`,
    simple: `${mainConcept} explained in everyday language`,
    characteristics: ["Key characteristic 1", "Key characteristic 2", "Key characteristic 3"],
    examples: ["Concrete example 1", "Concrete example 2", "Concrete example 3"],
    related: [
      { name: "Related concept 1", relation: "similar to" },
      { name: "Related concept 2", relation: "part of" },
      { name: "Related concept 3", relation: "contrasts with" },
    ],
  }
}

// Extract list information
function extractListInfo(
  prompt: string,
  mainConcept: string,
): {
  description: string
  definition: string
  categories: Array<{
    name: string
    description: string
    items: Array<{ name: string; description: string }>
  }>
  criteria: string[]
} {
  return {
    description: `Overview of ${mainConcept} and their significance`,
    definition: `What constitutes a ${mainConcept} and how it's defined`,
    categories: [
      {
        name: "Category 1",
        description: "First major classification",
        items: [
          { name: "Item 1.1", description: "Description of first item in category 1" },
          { name: "Item 1.2", description: "Description of second item in category 1" },
          { name: "Item 1.3", description: "Description of third item in category 1" },
        ],
      },
      {
        name: "Category 2",
        description: "Second major classification",
        items: [
          { name: "Item 2.1", description: "Description of first item in category 2" },
          { name: "Item 2.2", description: "Description of second item in category 2" },
          { name: "Item 2.3", description: "Description of third item in category 2" },
        ],
      },
      {
        name: "Category 3",
        description: "Third major classification",
        items: [
          { name: "Item 3.1", description: "Description of first item in category 3" },
          { name: "Item 3.2", description: "Description of second item in category 3" },
          { name: "Item 3.3", description: "Description of third item in category 3" },
        ],
      },
    ],
    criteria: ["Selection criterion 1", "Selection criterion 2", "Selection criterion 3"],
  }
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}
