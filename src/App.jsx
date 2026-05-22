import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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
import ForgotPassword from './component/Landing/PasswordRecovery/ForgotPassword.jsx'
import ResetPassword from './component/Landing/PasswordRecovery/ResetPassword.jsx'
import DashboardLayout from './component/Dashboard/Layout/DashboardLayout.jsx'
import SharedHeaderLayout from './component/Dashboard/Layout/SharedHeaderLayout.jsx'
import DashboardHome from './component/Dashboard/DashboardHome/DashboardHome.jsx'
import MyProfile from './component/Dashboard/MySkills/MySkills.jsx'
import Explore from './component/Dashboard/Explore/Explore.jsx'
import Sessions from './component/Dashboard/Sessions/Sessions.jsx'
import Projects from './component/Dashboard/Projects/Projects.jsx'
import Messages from './component/Dashboard/Messages/Messages.jsx'
import Credits from './component/Dashboard/Credits/Credits.jsx'
import Validation from './component/Dashboard/Validation/Validation.jsx'
import Notifications from './component/Dashboard/Notifications/Notifications.jsx'
import Settings from './component/Dashboard/Settings/Settings.jsx'
import { authApi, userApi } from './api/client.js'
import {
  clearAuthSession,
  getAuthUser,
  hasAuthSession,
  setAuthSession,
  updateAuthUser,
  useAuthSession,
} from './authSession.js'
import RegisterAdmin from './component/Landing/RegisterAdmin/RegisterAdmin.jsx'
import AdminLayout from './component/Admin/AdminLayout.jsx'
import AdminDashboard from './component/Admin/AdminDashboard/AdminDashboard.jsx'
import AdminUsers from './component/Admin/Users/AdminUsers.jsx'
import AdminReports from './component/Admin/Reports/AdminReports.jsx'
import AdminAudit from './component/Admin/Audit/AdminAudit.jsx'
import AdminSettings from './component/Admin/Settings/AdminSettings.jsx'
import AdminSkills from './component/Admin/Skills/AdminSkills.jsx'
import AdminMentorApplications from './component/Admin/MentorApplications/AdminMentorApplications.jsx'
import AdminMentoringRequests from './component/Admin/MentoringRequests/AdminMentoringRequests.jsx'

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

function isAdminUser(user) {
  return String(user?.role || "").toLowerCase() === "admin";
}

function getDefaultAuthenticatedRoute(user) {
  return isAdminUser(user) ? "/admin" : "/app";
}

function LoginPage() {
  const navigate = useNavigate()
  const { accessToken, user } = useAuthSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (accessToken) {
    return <Navigate to={getDefaultAuthenticatedRoute(user)} replace />
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
      navigate(getDefaultAuthenticatedRoute(session?.user), { replace: true })
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
  const { accessToken, user } = useAuthSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedRole, setSelectedRole] = useState("LEARNER")

  if (accessToken) {
    return <Navigate to={getDefaultAuthenticatedRoute(user)} replace />
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
      navigate(getDefaultAuthenticatedRoute(session?.user), { replace: true })
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

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [debugCode, setDebugCode] = useState("")

  const handleSubmitCapture = async (event) => {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setDebugCode("")

    const email = event.target.elements.namedItem("email")?.value?.trim()

    if (!email) {
      setErrorMessage("Veuillez saisir votre adresse email.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authApi.forgotPassword({ email })
      setSuccessMessage(
        response?.message || "If that email exists, a verification code has been sent."
      )
      if (response?.debugCode) {
        setDebugCode(response.debugCode)
      }
      event.target.reset()
      // Navigate to reset page with email so the user doesn't have to retype it
      navigate("/reset-password", { state: { email } })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <ForgotPassword
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        debugCode={debugCode}
      />
    </div>
  )
}

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const email = location.state?.email || ""

  const handleSubmitCapture = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    const code = event.target.elements.namedItem("code")?.value?.trim() || ""
    const password = event.target.elements.namedItem("password")?.value || ""
    const confirmPassword = event.target.elements.namedItem("confirm-password")?.value || ""

    if (!code) {
      setErrorMessage("Veuillez saisir le code de vérification.")
      return
    }

    if (!/^\d{6}$/.test(code)) {
      setErrorMessage("Le code doit contenir exactement 6 chiffres.")
      return
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Veuillez remplir les deux champs du mot de passe.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.")
      return
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage("Password must contain at least one uppercase letter.")
      return
    }

    if (!/[0-9]/.test(password)) {
      setErrorMessage("Password must contain at least one number.")
      return
    }

    setIsSubmitting(true)

    try {
      const session = await authApi.resetPassword({ email, code, password })
      setAuthSession(session)
      navigate(getDefaultAuthenticatedRoute(session?.user), { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <ResetPassword
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </div>
  )
}

function AdminRegisterPage() {
  const navigate = useNavigate()
  const { accessToken, user } = useAuthSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  if (accessToken) {
    return <Navigate to={getDefaultAuthenticatedRoute(user)} replace />
  }

  const handleSubmitCapture = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    const fullName = event.target.elements.namedItem("full-name")?.value?.trim() || ""
    const email = event.target.elements.namedItem("email")?.value?.trim()
    const password = event.target.elements.namedItem("password")?.value || ""
    const confirmPassword = event.target.elements.namedItem("confirm-password")?.value || ""
    const bootstrapSecret = event.target.elements.namedItem("bootstrap-secret")?.value || ""

    if (!fullName || !email || !password || !confirmPassword || !bootstrapSecret) {
      setErrorMessage("Veuillez remplir tous les champs.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.")
      return
    }

    const { firstName, lastName } = splitFullName(fullName)

    setIsSubmitting(true)

    try {
      const session = await authApi.registerAdmin({ firstName, lastName, email, password }, bootstrapSecret)
      setAuthSession(session)
      navigate("/admin", { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div onSubmitCapture={handleSubmitCapture}>
      <RegisterAdmin isSubmitting={isSubmitting} errorMessage={errorMessage} />
    </div>
  )
}

function ProtectedAppRoute() {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}

function ProtectedAdminRoute() {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />
  }

  const user = getAuthUser()
  const role = String(user?.role || "").toLowerCase()

  if (role !== "admin") {
    return <Navigate to="/app" replace />
  }

  return <AdminLayout />
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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register-admin" element={<AdminRegisterPage />} />
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
        <Route path="sessions/:categoryKey" element={<Sessions />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<Projects />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="mentor-applications" element={<AdminMentorApplications />} />
        <Route path="mentoring-requests" element={<AdminMentoringRequests />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App
