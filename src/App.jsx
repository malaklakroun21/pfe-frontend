import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './component/Landing/Header/Header.jsx'
import Hero from './component/Landing/Hero/Hero.jsx'
import Blooms from './component/Landing/Blooms/Blooms.jsx'
import SkillScape from './component/Landing/SkillScape/SkillScape.jsx'
import Feedback from './component/Landing/Feedback/Feedback.jsx'
import Leaders from './component/Landing/Leaders/Leaders.jsx'
import Comunity from './component/Landing/Comunity/Comunity.jsx'
import Footer from './component/Landing/Footer/Footer.jsx'
import Footertwo from './component/Landing/Footertwo/Footertwo.jsx'
import Login from './component/Landing/Login/Login.jsx'
import Sign from './component/Landing/Sign/Sign.jsx'
import DashboardLayout from './component/Dashboard/Layout/DashboardLayout.jsx'
import SharedHeaderLayout from './component/Dashboard/Layout/SharedHeaderLayout.jsx'
import DashboardHome from './component/Dashboard/DashboardHome/DashboardHome.jsx'
import MyProfile from './component/Dashboard/MySkills/MySkills.jsx'
import Explore from './component/Dashboard/Explore/Explore.jsx'
import Sessions from './component/Dashboard/Sessions/Sessions.jsx'
import Messages from './component/Dashboard/Messages/Messages.jsx'
import Credits from './component/Dashboard/Credits/Credits.jsx'
import Validation from './component/Dashboard/Validation/Validation.jsx'
import Notifications from './component/Dashboard/Notifications/Notifications.jsx'
import Settings from './component/Dashboard/Settings/Settings.jsx'
import { getPreviewUser, hasPreviewSession, setPreviewSession } from './previewSession.js'

function LandingPage() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Blooms />
      <SkillScape />
      <Feedback />
      <Leaders />
      <Comunity />
      <Footer />
      <Footertwo />
    </div>
  )
}

function LoginPreviewPage() {
  const navigate = useNavigate()

  const handleSubmitCapture = (event) => {
    event.preventDefault()
    const previewUser = getPreviewUser()
    setPreviewSession({
      fullName: previewUser.fullName,
      isNewUser: false,
    })
    navigate('/app', { replace: true })
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <Login />
    </div>
  )
}

function SignupPreviewPage() {
  const navigate = useNavigate()

  const handleSubmitCapture = (event) => {
    event.preventDefault()
    const submittedName = event.target.elements.namedItem('full-name')?.value

    setPreviewSession({
      fullName: submittedName,
      isNewUser: true,
    })
    navigate('/app', { replace: true })
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <Sign />
    </div>
  )
}

function PreviewAppRoute() {
  if (!hasPreviewSession()) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPreviewPage />} />
      <Route path="/signup" element={<SignupPreviewPage />} />
      <Route path="/app" element={<PreviewAppRoute />}>
        <Route index element={<DashboardHome />} />
        <Route element={<SharedHeaderLayout />}>
          <Route path="skills" element={<MyProfile />} />
          <Route path="credits" element={<Credits />} />
          <Route path="validation" element={<Validation />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="explore" element={<Explore />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App
