import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetails from './pages/CourseDetails'
import Learn from './pages/Learn'
import Dashboard from './pages/Dashboard'
import Certificates from './pages/Certificates'
import Verify from './pages/Verify'
import { Instructors, InstructorProfile } from './pages/Instructors'
import { Paths, PathDetails } from './pages/Paths'
import { ExamsList, TakeExam } from './pages/Exams'
import { Articles, Article } from './pages/Articles'
import About from './pages/About'
import Contact from './pages/Contact'
import { Login, Register } from './pages/Auth'
import Profile from './pages/Profile'
import InstructorDash from './pages/InstructorDash'
import AdminDash from './pages/AdminDash'
import { useApp } from './store/AppStore'

function NotFound() {
  const { state } = useApp()
  return (
    <div className="section container">
      <div className="empty">
        <h1>404</h1>
        <p>{state.lang === 'en' ? 'This page is not part of MEDAD.' : 'هذه الصفحة ليست ضمن منصة مِداد.'}</p>
      </div>
    </div>
  )
}

export default function App() {
  const { hydrated } = useApp()
  if (!hydrated) {
    return (
      <div className="section container">
        <div className="loading-block">
          <div className="spinner" />
          <div>مِداد | MEDAD</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/learn/:courseId/:lessonId" element={<Learn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/certificates/:code" element={<Certificates />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/instructors/:id" element={<InstructorProfile />} />
        <Route path="/paths" element={<Paths />} />
        <Route path="/paths/:slug" element={<PathDetails />} />
        <Route path="/exams" element={<ExamsList />} />
        <Route path="/exams/:courseId" element={<TakeExam />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<Article />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/instructor" element={<InstructorDash />} />
        <Route path="/admin" element={<AdminDash />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
