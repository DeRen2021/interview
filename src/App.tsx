import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './component/HomePage'
import QuestionCollection from './component/QuestionCollection'
import QuestionInterview from './component/interview/questionInterview'
import QuestionUpload from './component/QuestionUpload'
import DebugPanel from './component/DebugPanel'
import Header from './component/Header'
import ProtectedRoute from './component/login/ProtectedRoute'
import UserProfile from './component/UserProfile'
import AdminPanel from './component/AdminPanel'
import { QuestionProvider } from './context/QuestionContext'
import { LoginProvider } from './context/LoginContext'

function App() {
  return (
    <LoginProvider>
      <QuestionProvider>
        <Router>
          <ProtectedRoute>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<QuestionUpload />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/questions/:topic/:_id" element={<QuestionInterview />} />
              <Route path="/questions/:topic" element={<QuestionCollection />} />
            </Routes>
            <DebugPanel />
          </ProtectedRoute>
        </Router>
      </QuestionProvider>
    </LoginProvider>
  )
}

export default App
