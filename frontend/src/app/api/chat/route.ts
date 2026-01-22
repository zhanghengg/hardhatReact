import { projects, skills } from '@/data/projects'
import { profile } from '@/data/profile'

// Cloudflare Workers AI REST API
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

// 可选模型列表 - 修改这里切换模型
// '@cf/meta/llama-3.2-3b-instruct'           - 3B 轻量快速（当前）
// '@cf/meta/llama-3.1-8b-instruct-fast'      - 8B 平衡性能
// '@cf/meta/llama-3.3-70b-instruct-fp8-fast' - 70B 最强能力
// '@cf/qwen/qwen3-30b-a3b-fp8'               - 30B 中文优化推荐
// '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b' - 32B 推理能力强
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast'

// 动态生成系统提示词
function generateSystemPrompt(): string {
  // 状态映射
  const statusMap: Record<string, string> = {
    completed: '已完成',
    'in-progress': '进行中',
    planned: '规划中',
  }

  // 生成项目列表
  const projectsText = projects
    .map((p, i) => {
      const status = statusMap[p.status] || p.status
      const demoLink = p.demoUrl ? `\n  - 链接：${p.demoUrl}` : ''
      const network = p.network ? `\n  - 部署网络：${p.network}` : ''

      return `### ${i + 1}. ${p.title}
- 简介：${p.description}
- 状态：${status}${network}${demoLink}
- 技术栈：${p.techStack.join(', ')}
- 主要功能：${p.features.join('、')}
- 详细描述：
${p.longDescription}`
    })
    .join('\n\n')

  // 生成技术栈列表
  const skillsText = Object.entries(skills)
    .map(([category, items]) => {
      const categoryNames: Record<string, string> = {
        frontend: '前端开发',
        smart_contract: '智能合约',
        blockchain: '区块链',
        tools: '开发工具',
      }
      return `**${categoryNames[category] || category}**: ${items.join(', ')}`
    })
    .join('\n')

  // 生成 AI 回答指南
  const guidelinesText = profile.aiGuidelines
    .map((g, i) => `${i + 1}. ${g}`)
    .join('\n')

  return `你是一个友好的 AI 助手，专门为这个 Web3 开发者作品集网站提供帮助。

## 关于网站主人
- 职业：${profile.title}
- 经验：${profile.experience}
- 位置：${profile.location}
- 专长：${profile.specialties.join('、')}
- 理念：${profile.philosophy}

## 联系方式
- GitHub: ${profile.contact.github}
- Twitter: ${profile.contact.twitter}
- Email: ${profile.contact.email}

## 技术栈
${skillsText}

## 项目列表（共 ${projects.length} 个项目）

${projectsText}

## 回答指南
${guidelinesText}`
}

// 创建自定义 Cloudflare AI provider
async function callCloudflareAI(
  messages: Array<{ role: string; content: string }>
) {
  const systemPrompt = generateSystemPrompt()

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${AI_MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: true,
        max_tokens: 2048, // 增加输出长度限制，避免回答被截断
      }),
    }
  )

  return response
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // 检查环境变量
    if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: '请配置 Cloudflare API 凭证' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 转换消息格式
    const formattedMessages = messages.map(
      (m: {
        role: string
        content?: string
        parts?: Array<{ type: string; text: string }>
      }) => ({
        role: m.role,
        content:
          m.content ||
          m.parts?.find((p: { type: string }) => p.type === 'text')?.text ||
          '',
      })
    )

    const response = await callCloudflareAI(formattedMessages)

    if (!response.ok) {
      const error = await response.text()
      console.error('Cloudflare AI error:', error)
      return new Response(
        JSON.stringify({ error: 'AI 服务暂时不可用' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 处理 Cloudflare 的 SSE 流式响应
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.response) {
                    // 转换为 AI SDK 的数据流格式
                    controller.enqueue(
                      new TextEncoder().encode(
                        `0:${JSON.stringify(parsed.response)}\n`
                      )
                    )
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: '服务器错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const runtime = 'edge'
