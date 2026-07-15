import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Star, MessageSquare, Code2, Users, ArrowRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'HR & Behavioral',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    questions: [
      'Tell me about yourself',
      'What are your strengths and weaknesses?',
      'Why do you want to work here?',
      'Where do you see yourself in 5 years?',
      'Why are you leaving your current job?',
    ],
    tips: [
      'Be concise - aim for 2-3 minute responses',
      'Always connect your answer back to the role',
      'Use specific examples from your experience',
    ],
  },
  {
    title: 'Technical Questions',
    icon: Code2,
    color: 'from-purple-500 to-pink-500',
    questions: [
      'Explain the difference between REST and GraphQL',
      'What is a closure in JavaScript?',
      'Design a URL shortening system',
      'How does garbage collection work?',
      'Explain SOLID principles',
    ],
    tips: [
      'Think out loud during problem solving',
      'Ask clarifying questions before starting',
      'Discuss trade-offs of your approach',
    ],
  },
  {
    title: 'STAR Method',
    icon: Star,
    color: 'from-amber-500 to-orange-500',
    questions: [
      'Tell me about a time you failed',
      'Describe a challenging project you led',
      'Give an example of handling conflict',
      'Tell me about overcoming a deadline',
      'Describe a time you showed leadership',
    ],
    tips: [
      'S - Situation: Set the context',
      'T - Task: Describe your responsibility',
      'A - Action: Explain what you did',
      'R - Result: Share the measurable outcome',
    ],
  },
  {
    title: 'Situational Questions',
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-500',
    questions: [
      'How would you handle a difficult stakeholder?',
      'What would you do if you missed a deadline?',
      'How would you prioritize competing tasks?',
      'What would you do if you disagreed with your manager?',
      'How would you onboard to a new codebase?',
    ],
    tips: [
      'Show your problem-solving process',
      'Demonstrate emotional intelligence',
      'Be honest about challenges you would face',
    ],
  },
]

export default function InterviewPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card border-brand-500/20 bg-gradient-to-r from-brand-500/5 to-purple-500/5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ready for a practice session?</h3>
              <p className="text-sm text-slate-400">Jump straight into a mock interview with AI feedback</p>
            </div>
          </div>
          <Link to="/mock-interview" className="btn-primary flex items-center gap-2 shrink-0">
            <Play className="w-4 h-4" />
            Start Mock Interview
          </Link>
        </div>
      </motion.div>

      {/* Question Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section, i) => {
          const Icon = section.icon
          const isExpanded = expanded === section.title
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card"
            >
              <button
                className="w-full flex items-center gap-4 mb-0"
                onClick={() => setExpanded(isExpanded ? null : section.title)}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base font-semibold text-slate-200">{section.title}</h3>
                  <p className="text-xs text-slate-500">{section.questions.length} sample questions</p>
                </div>
                <ArrowRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Sample Questions</p>
                    <ul className="space-y-1.5">
                      {section.questions.map((q) => (
                        <li key={q} className="flex items-start gap-2 text-sm text-slate-400 p-2 rounded-lg hover:bg-white/3 transition-colors">
                          <span className="text-brand-500 mt-1 flex-shrink-0">›</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pro Tips</p>
                    <ul className="space-y-1.5">
                      {section.tips.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-xs text-slate-500">
                          <span className="text-amber-400 mt-0.5 flex-shrink-0">✓</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
