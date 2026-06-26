'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatBot() {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 打开聊天时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }
      setMessages(prev => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.slice(2))
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id
                      ? { ...m, content: m.content + text }
                      : m
                  )
                )
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t.chatbot?.errorMessage || '抱歉，发生了一些错误，请稍后再试。',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    t.chatbot?.q1 || '你有哪些项目经验？',
    t.chatbot?.q2 || '你的技术栈是什么？',
    t.chatbot?.q3 || '如何联系你？',
  ]

  return (
    <>
      {/* 浮动按钮 */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Button
          size="icon-lg"
          onClick={() => setIsOpen(!isOpen)}
          className="size-12 rounded-[4px] shadow-[4px_4px_0_var(--site-cyan)]"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X data-icon="inline-start" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageCircle data-icon="inline-start" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] overflow-hidden border border-border bg-background shadow-[8px_8px_0_rgba(10,167,223,0.18)]"
          >
            {/* 头部 */}
            <div className="border-b border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center border border-border bg-background">
                  <Bot className="size-5 text-[var(--site-cyan)]" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.chatbot?.title || 'AI 助手'}</h3>
                  <p className="text-sm text-muted-foreground">{t.chatbot?.subtitle || '有什么可以帮你的？'}</p>
                </div>
              </div>
            </div>

            {/* 消息区域 */}
            <div className="flex h-[350px] flex-col gap-4 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground text-center">
                    {t.chatbot?.welcome || '👋 你好！我是这个网站的 AI 助手，可以帮你了解项目和技术栈。'}
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">{t.chatbot?.tryAsking || '试试问我：'}</p>
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="block w-full border border-border bg-muted p-2 text-left text-sm transition-colors hover:bg-accent"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center border ${
                        message.role === 'user'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="size-4" />
                      ) : (
                        <Bot className="size-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] border p-3 text-sm ${
                        message.role === 'user'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted'
                      }`}
                    >
                      {message.content || (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t.chatbot?.placeholder || '输入消息...'}
                  disabled={isLoading}
                  className="flex-1 rounded-[4px] border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="rounded-[4px]"
                >
                  {isLoading ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Send data-icon="inline-start" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
