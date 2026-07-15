import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Dashboard from '@/pages/Dashboard'
import ResumePage from '@/pages/Resume'
import InterviewPage from '@/pages/Interview'
import MockInterviewPage from '@/pages/MockInterview'
import LearningPage from '@/pages/Learning'
import CompanyPage from '@/pages/Company'
import AnalyticsPage from '@/pages/Analytics'
import CareerPage from '@/pages/Career'
import ReportsPage from '@/pages/Reports'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="resume" element={<ResumePage />} />
                  <Route path="interview" element={<InterviewPage />} />
                  <Route path="mock-interview" element={<MockInterviewPage />} />
                  <Route path="learning" element={<LearningPage />} />
                  <Route path="company" element={<CompanyPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="career" element={<CareerPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
