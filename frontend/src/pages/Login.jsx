import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f4f8' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '380px' }}>
        <h2 style={{ textAlign: 'center', color: '#1e3a5f', marginBottom: '8px' }}>🎓 EduVault</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>Sign in to your account</p>
        {error && <p style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleLogin} disabled={loading} style={buttonStyle}>{loading ? 'Signing in...' : 'Sign In'}</button>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#1e3a5f' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }