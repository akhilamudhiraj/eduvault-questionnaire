import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

export default function RunQuestionnaire({ session }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const headers = { Authorization: `Bearer ${session.access_token}` }

  const handleRunText = async () => {
    if (!title || !content) return alert('Please fill in both title and questionnaire content')
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/questionnaire/run`, { title, content }, { headers })
      navigate(`/results/${res.data.run_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleRunFile = async () => {
    if (!file) return alert('Please choose a questionnaire file first')
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (title.trim()) formData.append('title', title.trim())
      const res = await axios.post(`${API}/questionnaire/run-file`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      })
      navigate(`/results/${res.data.run_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '32px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#1e3a5f', marginBottom: '8px' }}>Run Questionnaire</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          You can paste questions or upload a questionnaire file.
        </p>

        <div style={cardStyle}>
          {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

          <label style={labelStyle}>Questionnaire Title</label>
          <input
            placeholder="e.g. Vendor Security Assessment 2026"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Questionnaire Content (Paste)</label>
          <textarea
            placeholder={`1. Does EduVault support Single Sign-On (SSO)?\n2. How is student data encrypted at rest?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={14}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <button onClick={handleRunText} disabled={loading} style={buttonStyle}>
            {loading ? 'Processing...' : 'Generate Answers from Pasted Content'}
          </button>

          <div style={{ margin: '18px 0', borderTop: '1px solid #ececec' }} />

          <h4 style={{ color: '#1e3a5f', marginBottom: '10px' }}>Or Upload Questionnaire File</h4>
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
            Supported formats: .txt, .md, .docx, .pdf, .csv, .xlsx
          </p>
          <input
            type="file"
            accept=".txt,.md,.docx,.pdf,.csv,.xlsx"
            onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ marginBottom: '12px' }}
          />
          {file && <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Selected: {file.name}</p>}
          <button onClick={handleRunFile} disabled={loading} style={{ ...buttonStyle, backgroundColor: '#27ae60' }}>
            {loading ? 'Processing...' : 'Generate Answers from File'}
          </button>
        </div>

        <div style={{ ...cardStyle, marginTop: '24px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ color: '#1e3a5f', marginBottom: '12px' }}>Sample Questionnaire</h3>
          <button
            onClick={() => {
              setTitle('Vendor Security Assessment 2026')
              setContent(
                `1. Does EduVault support Single Sign-On (SSO)?\n` +
                `2. How is student data encrypted at rest and in transit?\n` +
                `3. Is EduVault FERPA compliant?\n` +
                `4. What is the guaranteed uptime SLA?\n` +
                `5. How does EduVault handle data backups?\n` +
                `6. What authentication methods are supported?\n` +
                `7. How long is data retained after contract termination?\n` +
                `8. Does EduVault support role-based access control?\n` +
                `9. What integrations does EduVault support?\n` +
                `10. How are security incidents reported to customers?`
              )
            }}
            style={{ ...buttonStyle, backgroundColor: '#1e3a5f' }}
          >
            Load Sample Questionnaire
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '14px',
  boxSizing: 'border-box'
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  color: '#1e3a5f',
  fontSize: '14px'
}

const buttonStyle = {
  backgroundColor: '#1e3a5f',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
}

const cardStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}
