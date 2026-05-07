import { useEffect, useState } from 'react'
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
import { authApi, userApi } from './api/client.js'
import {
  clearAuthSession,
  hasAuthSession,
  setAuthSession,
  updateAuthUser,
  useAuthSession,
} from './authSession.js'

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

function splitFullName(fullName = "") {
  const normalizedName = fullName.trim().replace(/\s+/g, " ");
  const [firstName = "", ...rest] = normalizedName.split(" ");

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

function LoginPage() {
  const navigate = useNavigate()
  const { accessToken } = useAuthSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (accessToken) {
    return <Navigate to="/app" replace />
  }

  const handleSubmitCapture = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    const email = event.target.elements.namedItem("email")?.value?.trim()
    const password = event.target.elements.namedItem("password")?.value || ""

    if (!email || !password) {
      setErrorMessage("Veuillez saisir votre email et votre mot de passe.")
      return
    }

    setIsSubmitting(true)

    try {
      const session = await authApi.login({
        email,
        password,
      })

      setAuthSession(session)
      navigate('/app', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <Login isSubmitting={isSubmitting} errorMessage={errorMessage} />
    </div>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const { accessToken } = useAuthSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedRole, setSelectedRole] = useState("LEARNER")

  if (accessToken) {
    return <Navigate to="/app" replace />
  }

  const handleSubmitCapture = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    const fullName = event.target.elements.namedItem("full-name")?.value?.trim() || ""
    const email = event.target.elements.namedItem("email")?.value?.trim()
    const password = event.target.elements.namedItem("password")?.value || ""
    const confirmPassword = event.target.elements.namedItem("confirm-password")?.value || ""
    const role =
      event.target.querySelector('input[name="role"]:checked')?.value || selectedRole || "LEARNER"

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs du formulaire.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      return
    }

    const { firstName, lastName } = splitFullName(fullName)

    setIsSubmitting(true)

    try {
      const session = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        role,
      })

      setAuthSession(session)
      navigate('/app', { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <Sign
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />
    </div>
  )
}

function ProtectedAppRoute() {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

const App = () => {
  const { accessToken } = useAuthSession()

  useEffect(() => {
    let isActive = true

    async function refreshCurrentUser() {
      if (!accessToken) {
        return
      }

      try {
        const currentUser = await userApi.getCurrentUser()

        if (!isActive) {
          return
        }

        updateAuthUser(currentUser)
      } catch {
        if (!isActive) {
          return
        }

        clearAuthSession()
      }
    }

    refreshCurrentUser()

    return () => {
      isActive = false
    }
  }, [accessToken])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/app" element={<ProtectedAppRoute />}>
        <Route index element={<DashboardHome />} />
        <Route element={<SharedHeaderLayout />}>
          <Route path="skills" element={<MyProfile />} />
          <Route path="profile/:userId" element={<MyProfile />} />
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
