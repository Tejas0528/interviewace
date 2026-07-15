import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import FloatingChatbot from '@/components/shared/FloatingChatbot'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <FloatingChatbot />
    </div>
  )
}
