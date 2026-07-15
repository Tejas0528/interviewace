import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, Play, Lightbulb, AlertTriangle, CheckCircle2, XCircle, Brain, FileQuestion } from 'lucide-react'
import apiClient from '@/api/client'

const topics = [
  { id: 'hr-questions', label: 'HR Questions', icon: '👤', desc: 'Common HR and culture-fit questions',
    color: 'from-blue-500 to-cyan-500', subtopics: ['tell me about yourself', 'why this company', 'strengths and weaknesses', 'salary negotiation'] },
  { id: 'behavioral', label: 'Behavioral', icon: '🧠', desc: 'Situation-based behavioral questions',
    color: 'from-purple-500 to-pink-500', subtopics: ['leadership examples', 'conflict resolution', 'failure stories', 'teamwork examples'] },
  { id: 'star-method', label: 'STAR Method', icon: '⭐', desc: 'Master the STAR framework',
    color: 'from-amber-500 to-orange-500', subtopics: ['star-method', 'situation task action result', 'star examples'] },
  { id: 'technical', label: 'Technical', icon: '💻', desc: 'DSA, System Design, and more',
    color: 'from-emerald-500 to-teal-500', subtopics: ['data structures', 'algorithms', 'system design', 'sql joins', 'react hooks'] },
  { id: 'communication', label: 'Communication', icon: '💬', desc: 'Speak clearly and confidently',
    color: 'from-rose-500 to-red-500', subtopics: ['active listening', 'clarity and conciseness', 'asking questions'] },
  { id: 'body-language', label: 'Body Language', icon: '🤝', desc: 'Make a great non-verbal impression',
    color: 'from-indigo-500 to-violet-500', subtopics: ['body-language', 'eye contact', 'posture', 'handshake'] },
]

export default function LearningPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'content' | 'videos' | 'quiz'>('content')

  const { data: content, isLoading } = useQuery({
    queryKey: ['learning-full', selectedSubtopic],
    queryFn: async () => {
      const { data } = await apiClient.get(`/interview/learn/${encodeURIComponent(selectedSubtopic!)}/full`)
      return data
    },
    enabled: !!selectedSubtopic,
  })

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['videos', selectedSubtopic],
    queryFn: async () => {
      const { data } = await apiClient.get(`/interview/videos/${encodeURIComponent(selectedSubtopic!)}`)
      return data
    },
    enabled: !!selectedSubtopic && activeSection === 'videos',
  })

  const { data: quiz, isLoading: quizLoading, refetch: refetchQuiz } = useQuery({
    queryKey: ['quiz', selectedSubtopic],
    queryFn: async () => {
      const { data } = await apiClient.post('/interview/quiz', { topic: selectedSubtopic })
      return data
    },
    enabled: !!selectedSubtopic && activeSection === 'quiz',
  })

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [showQuizResults, setShowQuizResults] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, i) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setSelectedTopic(topic.id === selectedTopic ? null : topic.id)
              setSelectedSubtopic(null)
              setActiveSection('content')
            }}
            className={`glass-card text-left transition-all ${selectedTopic === topic.id ? 'border-brand-500/40' : ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl mb-3`}>
              {topic.icon}
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">{topic.label}</h3>
            <p className="text-sm text-slate-500">{topic.desc}</p>

            <AnimatePresence>
              {selectedTopic === topic.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-1.5">
                  {topic.subtopics.map((sub) => (
                    <button key={sub} onClick={(e) => { e.stopPropagation(); setSelectedSubtopic(sub); setActiveSection('content') }}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center justify-between capitalize
                        ${selectedSubtopic === sub ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                          : 'bg-white/3 text-slate-400 border border-white/5 hover:border-white/15'}`}>
                      {sub}
                      <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedSubtopic && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-4">
            {/* Section Tabs */}
            <div className="flex gap-2">
              {[
                { key: 'content', label: 'Learn', icon: BookOpen },
                { key: 'videos', label: 'Videos', icon: Play },
                { key: 'quiz', label: 'Quiz', icon: FileQuestion },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveSection(key as any)}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all
                    ${activeSection === key ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {/* Content Section */}
            {activeSection === 'content' && (
              <div className="glass-card">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + i * 5}%` }} />
                    ))}
                  </div>
                ) : content ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-brand-400" />
                        <h3 className="text-lg font-semibold text-slate-200 capitalize">{content.topic || selectedSubtopic}</h3>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{content.overview}</p>
                    </div>

                    {content.key_concepts?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {content.key_concepts.map((c: string) => (
                          <span key={c} className="badge-info">{c}</span>
                        ))}
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Theory</h4>
                      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{content.theory}</p>
                    </div>

                    {content.examples?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Examples</h4>
                        {content.examples.map((ex: any, i: number) => (
                          <div key={i} className="space-y-2">
                            <p className="text-sm font-medium text-slate-300">Q: {ex.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs font-medium text-emerald-400">Best Answer</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{ex.best_answer}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  <span className="text-xs font-medium text-red-400">Weak Answer</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{ex.wrong_answer}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.tips?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <h4 className="text-sm font-semibold text-slate-300">Tips</h4>
                          </div>
                          <ul className="space-y-1.5">
                            {content.tips.map((t: string, i: number) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-amber-400">›</span> {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {content.common_mistakes?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <h4 className="text-sm font-semibold text-slate-300">Common Mistakes</h4>
                          </div>
                          <ul className="space-y-1.5">
                            {content.common_mistakes.map((m: string, i: number) => (
                              <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                <span className="text-red-400">›</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {content.recruiter_mindset && (
                      <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Brain className="w-4 h-4 text-brand-400" />
                          <span className="text-xs font-medium text-brand-400">Recruiter Mindset</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{content.recruiter_mindset}</p>
                      </div>
                    )}

                    {content.practice_questions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Practice Questions</h4>
                        <div className="space-y-2">
                          {content.practice_questions.map((q: any, i: number) => (
                            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
                              <p className="text-sm text-slate-300">{q.question}</p>
                              {q.hint && <p className="text-xs text-slate-600 mt-1">💡 {q.hint}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Videos Section */}
            {activeSection === 'videos' && (
              <div className="glass-card">
                <h3 className="section-title">Recommended Learning Videos</h3>
                {videosLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos?.videos?.map((v: any, i: number) => (
                      <a key={i} href={v.search_url} target="_blank" rel="noopener noreferrer"
                        className="group flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-brand-500/30 transition-all">
                        <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Play className="w-6 h-6 text-brand-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-300 line-clamp-2 group-hover:text-brand-400 transition-colors">{v.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{v.channel} · {v.duration}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quiz Section */}
            {activeSection === 'quiz' && (
              <div className="glass-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title mb-0">Quick Quiz</h3>
                  <button onClick={() => { setShowQuizResults(false); setQuizAnswers({}); refetchQuiz() }}
                    className="btn-secondary text-xs">New Quiz</button>
                </div>
                {quizLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quiz?.quiz?.map((q: any, qi: number) => (
                      <div key={qi} className="p-4 rounded-xl bg-white/3 border border-white/5">
                        <p className="text-sm font-medium text-slate-200 mb-3">{qi + 1}. {q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt: string) => {
                            const optionLetter = opt.charAt(0)
                            const isSelected = quizAnswers[qi] === optionLetter
                            const isCorrect = optionLetter === q.correct
                            return (
                              <button key={opt} disabled={showQuizResults}
                                onClick={() => setQuizAnswers((p) => ({ ...p, [qi]: optionLetter }))}
                                className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all
                                  ${showQuizResults && isCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                                    showQuizResults && isSelected && !isCorrect ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                                    isSelected ? 'bg-brand-500/15 border-brand-500/30 text-brand-400' :
                                    'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'}`}>
                                {opt}
                              </button>
                            )
                          })}
                        </div>
                        {showQuizResults && (
                          <p className="text-xs text-slate-500 mt-2 italic">{q.explanation}</p>
                        )}
                      </div>
                    ))}
                    {quiz?.quiz?.length > 0 && !showQuizResults && (
                      <button onClick={() => setShowQuizResults(true)} className="btn-primary w-full">
                        Check Answers
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
