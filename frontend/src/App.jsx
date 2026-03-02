import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import RunQuestionnaire from './pages/RunQuestionnaire'
import Results from './pages/Results'
import Navbar from './components/Navbar'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>

  return (
    <>
      {session && <Navbar session={session} />}
      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />
        <Route path="/documents" element={session ? <Documents session={session} /> : <Navigate to="/login" />} />
        <Route path="/run" element={session ? <RunQuestionnaire session={session} /> : <Navigate to="/login" />} />
        <Route path="/results/:runId" element={session ? <Results session={session} /> : <Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App