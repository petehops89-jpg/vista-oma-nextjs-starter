# OMA × Next.js Starter

Deploy a multi-agent app in one click. A **researcher** agent gathers information and a **writer** agent composes an article, orchestrated by [open-multi-agent](https://github.com/open-multi-agent/open-multi-agent) (`runTeam()`) and streamed to a chat UI via the [Vercel AI SDK](https://ai-sdk.dev).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopen-multi-agent%2Foma-nextjs-starter&env=DEEPSEEK_API_KEY&envDescription=API%20key%20to%20run%20the%20agent%20team%20on%20DeepSeek&envLink=https%3A%2F%2Fplatform.deepseek.com%2Fapi_keys&project-name=oma-nextjs-starter&repository-name=oma-nextjs-starter)

## What this shows

The Vercel AI SDK gives you a single agent loop and a streaming UI. open-multi-agent adds the layer the AI SDK deliberately leaves out: **multi-agent orchestration**. A coordinator decomposes your goal into a task DAG, agents run in dependency order with shared memory, and the result streams back through the AI SDK.

```
User topic
  │
  ▼
app/api/chat/route.ts
  ├─ open-multi-agent runTeam()  →  coordinator → researcher → writer (shared memory)
  └─ Vercel AI SDK streamText()  →  streams the article to the browser
  ▼
Chat UI (app/page.tsx, useChat)
```

## Deploy

Click the button above, set `DEEPSEEK_API_KEY`, and deploy. Get a key at [platform.deepseek.com](https://platform.deepseek.com/api_keys).

> The agent team runs inside a serverless function. `maxDuration` defaults to 60s to fit Vercel's Hobby (free) tier. Heavier topics may need [Vercel Pro](https://vercel.com/docs/functions/configuring-functions/duration) (up to 300s).

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your DEEPSEEK_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a topic, and watch the team work.

## Use a different model

The demo runs on DeepSeek because it is cheap and OpenAI-compatible. Both open-multi-agent and the AI SDK speak the OpenAI-compatible API, so switching to OpenAI, Anthropic, Groq, or a local model is a few-line change to the constants in `app/api/chat/route.ts`. See the [open-multi-agent provider docs](https://github.com/open-multi-agent/open-multi-agent/blob/main/docs/providers.md).

## Key files

| File | Role |
|------|------|
| `app/api/chat/route.ts` | open-multi-agent orchestration + AI SDK streaming |
| `app/page.tsx` | Chat UI (`useChat`) |

## License

MIT
