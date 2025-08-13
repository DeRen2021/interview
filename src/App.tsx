import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './page/HomePage'
import QuestionCollection from './page/QuestionCollectionPage'
import QuestionInterview from './page/QuestionInterviewPage'
import QuestionUpload from './page/QuestionUploadPage'
import DebugPanel from './component/DebugPanel'
import Header from './component/Header'
import ProtectedRoute from './component/login/ProtectedRoute'
import UserProfile from './page/UserProfilePage'
import AdminPanel from './page/AdminPage'
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
              {/* 私有话题路由 */}
              <Route path="/questions/private/:topic/:_id" element={<QuestionInterview />} />
              <Route path="/questions/private/:topic" element={<QuestionCollection />} />
            </Routes>
            <DebugPanel />
          </ProtectedRoute>
        </Router>
      </QuestionProvider>
    </LoginProvider>
  )
}

export default App
