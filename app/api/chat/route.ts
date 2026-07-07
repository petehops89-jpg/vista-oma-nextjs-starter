import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { ManagerAgent, default as stateManager } from 'core-engine';

// 60s fits Vercel's Hobby (free) tier function limit. Bump to 300 on Pro for
// heavier topics. https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 60;

// --- DeepSeek via its OpenAI-compatible API (for the final streaming step) ---
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = 'deepseek-v4-flash';

const deepseek = createOpenAICompatible({
  name: 'deepseek',
  baseURL: DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

function extractText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const lastText = extractText(messages.at(-1)!);

  // --- Phase 1: VISTAMATIONS core_engine orchestration ---
  const manager = new ManagerAgent();
  // The stateManager is required by the interface, but this agent doesn't use it.
  const plan = await manager.executeTask(stateManager, { goal: lastText }); 
  const planJson = JSON.stringify(plan, null, 2);

  // --- Phase 2: Stream result via Vercel AI SDK ---
  const result = streamText({
    model: deepseek(DEEPSEEK_MODEL),
    system: `You are presenting a plan from the VISTAMATIONS ManagerAgent.
The agent has already done the work of decomposing a goal into a series of steps. Your only job is to relay its output to the user
in a well-formatted way. The output is a JSON array of tasks. Present it clearly as a code block.
At the very end, add a one-line note that this was produced by the VISTAMATIONS ManagerAgent.

## Manager Agent Plan
${planJson}`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
