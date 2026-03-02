import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar({ session }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <span style={brandStyle}>EduVault</span>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/documents" style={linkStyle}>Documents</Link>
        <Link to="/run" style={linkStyle}>Run</Link>
      </div>
      <div style={rightStyle}>
        <span style={emailStyle}>{session?.user?.email}</span>
        <button onClick={handleLogout} style={buttonStyle}>Logout</button>
      </div>
    </nav>
  )
}

const navStyle = {
  backgroundColor: '#1e3a5f',
  color: 'white',
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const leftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px'
}

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}

const brandStyle = {
  fontWeight: 'bold',
  marginRight: '8px'
}

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '14px'
}

const emailStyle = {
  fontSize: '13px',
  opacity: 0.9
}

const buttonStyle = {
  border: '1px solid rgba(255,255,255,0.4)',
  backgroundColor: 'transparent',
  color: 'white',
  borderRadius: '6px',
  padding: '6px 10px',
  cursor: 'pointer'
}
