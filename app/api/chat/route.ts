import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { OpenMultiAgent } from '@open-multi-agent/core'
import type { AgentConfig } from '@open-multi-agent/core'

// 60s fits Vercel's Hobby (free) tier function limit. Bump to 300 on Pro for
// heavier topics. https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 60

// --- Google Gemini via its OpenAI-compatible API ---
// Gemini is reachable from every Vercel region, and both OMA (native
// OpenAI-compatible provider) and the AI SDK call the same endpoint.
// `*-latest` tracks Google's current flash model, so the template keeps working
// even after a specific version (e.g. gemini-2.0-flash) is retired.
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai'
const GEMINI_MODEL = 'gemini-flash-latest'

const gemini = createOpenAICompatible({
  name: 'gemini',
  baseURL: GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
})

const researcher: AgentConfig = {
  name: 'researcher',
  model: GEMINI_MODEL,
  provider: 'openai',
  baseURL: GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
  systemPrompt: `You are a research specialist. Given a topic, provide thorough, factual research
with key findings, relevant data points, and important context.
Be concise but comprehensive. Output structured notes, not prose.`,
  maxTurns: 3,
  temperature: 0.2,
}

const writer: AgentConfig = {
  name: 'writer',
  model: GEMINI_MODEL,
  provider: 'openai',
  baseURL: GEMINI_BASE_URL,
  apiKey: process.env.GEMINI_API_KEY,
  systemPrompt: `You are an expert writer. Using research from team members (available in shared memory),
write a well-structured, engaging article with clear headings and concise paragraphs.
Do not repeat raw research — synthesize it into readable prose.`,
  maxTurns: 3,
  temperature: 0.4,
}

function extractText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  const lastText = extractText(messages.at(-1)!)

  // --- Phase 1: OMA multi-agent orchestration ---
  const orchestrator = new OpenMultiAgent({
    defaultModel: GEMINI_MODEL,
    defaultProvider: 'openai',
    defaultBaseURL: GEMINI_BASE_URL,
    defaultApiKey: process.env.GEMINI_API_KEY,
  })

  const team = orchestrator.createTeam('research-writing', {
    name: 'research-writing',
    agents: [researcher, writer],
    sharedMemory: true,
  })

  const teamResult = await orchestrator.runTeam(
    team,
    `Research and write an article about: ${lastText}`,
  )

  const teamOutput = teamResult.agentResults.get('coordinator')?.output ?? ''

  // --- Phase 2: Stream result via Vercel AI SDK ---
  const result = streamText({
    model: gemini(GEMINI_MODEL),
    system: `You are presenting research from a multi-agent team (researcher + writer).
The team has already done the work. Your only job is to relay their output to the user
in a well-formatted way. Keep the content faithful to the team output below.
At the very end, add a one-line note that this was produced by a researcher agent
and a writer agent collaborating via open-multi-agent.

## Team Output
${teamOutput}`,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
