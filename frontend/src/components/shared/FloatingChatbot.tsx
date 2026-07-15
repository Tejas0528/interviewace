import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/api/client'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: "Hi! I'm your InterviewAce AI assistant. Ask me anything about interviews, resumes, technical concepts, or career advice!" }
  ])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([
    'What is the STAR method?',
    'How do I negotiate salary?',
    'Explain React Hooks',
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data } = await apiClient.post('/chat/', {
        message,
        history: messages.slice(-6),
      })
      return data
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
      if (data.suggestions?.length) setSuggestions(data.suggestions)
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, chatMutation.isPending])

  const handleSend = (text?: string) => {
    const msg = text || input
    if (!msg.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setInput('')
    chatMutation.mutate(msg)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-brand-gradient
                   shadow-lg shadow-brand-500/40 flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[560px] glass flex flex-col overflow-hidden
                       shadow-2xl shadow-black/40"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-brand-gradient">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">InterviewAce Assistant</h3>
                <p className="text-xs text-white/70">Always here to help</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-brand-gradient text-white rounded-br-sm'
                        : 'bg-white/5 text-slate-300 border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !chatMutation.isPending && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {suggestions.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-brand-500/10 text-brand-400
                               border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-3.5 py-2.5
                             text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none
                             focus:border-brand-500/40"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center
                             text-white disabled:opacity-40 transition-opacity flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
