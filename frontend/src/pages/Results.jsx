import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

export default function Results({ session }) {
  const { runId } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [run, setRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [exporting, setExporting] = useState('')
  const [deletingRun, setDeletingRun] = useState(false)

  const headers = { Authorization: `Bearer ${session.access_token}` }

  useEffect(() => { fetchResults() }, [])

  const fetchResults = async () => {
    try {
      const [questionsRes, runsRes] = await Promise.all([
        axios.get(`${API}/questionnaire/${runId}/questions`, { headers }),
        axios.get(`${API}/questionnaire/runs`, { headers })
      ])
      setQuestions(questionsRes.data.questions)
      const currentRun = runsRes.data.runs.find(r => r.id === runId)
      setRun(currentRun)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleEdit = (q) => {
    setEditingId(q.id)
    setEditText(q.answer || '')
  }

  const handleSave = async (questionId) => {
    try {
      await axios.patch(`${API}/questionnaire/${questionId}/edit`, { answer: editText }, { headers })
      setQuestions(questions.map(q => q.id === questionId ? { ...q, answer: editText, is_edited: true } : q))
      setEditingId(null)
    } catch (err) {
      alert('Error saving answer')
    }
  }

  const handleExport = async (format) => {
    setExporting(format)
    try {
      const endpoint = format === 'pdf' ? `${API}/export/${runId}/pdf` : `${API}/export/${runId}`
      const res = await axios.get(endpoint, { headers, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `eduvault_results.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Error exporting ${format.toUpperCase()}`)
    }
    setExporting('')
  }

  const handleDeleteRun = async () => {
    if (!confirm('Delete this questionnaire run?')) return
    setDeletingRun(true)
    try {
      await axios.delete(`${API}/questionnaire/${runId}`, { headers })
      navigate('/dashboard')
    } catch (err) {
      alert('Error deleting run')
      setDeletingRun(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#27ae60'
    if (confidence >= 0.4) return '#f39c12'
    return '#e74c3c'
  }

  if (loading) return <div style={{ padding: '32px' }}>Loading results...</div>

  return (
    <div style={{ padding: '32px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#1e3a5f' }}>Results</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleExport('docx')}
              disabled={!!exporting || deletingRun}
              style={{ ...buttonStyle, backgroundColor: '#27ae60' }}
            >
              {exporting === 'docx' ? 'Exporting...' : 'Export DOCX'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={!!exporting || deletingRun}
              style={{ ...buttonStyle, backgroundColor: '#34495e' }}
            >
              {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={handleDeleteRun}
              disabled={deletingRun || !!exporting}
              style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}
            >
              {deletingRun ? 'Deleting...' : 'Delete Run'}
            </button>
          </div>
        </div>

        {run && (
          <div style={{ ...cardStyle, backgroundColor: '#1e3a5f', color: 'white', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Coverage Summary: {run.title}</h2>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={statStyle}><span style={{ fontSize: '32px', fontWeight: 'bold' }}>{run.coverage_total}</span><span style={{ fontSize: '13px', opacity: 0.8 }}>Total Questions</span></div>
              <div style={statStyle}><span style={{ fontSize: '32px', fontWeight: 'bold', color: '#2ecc71' }}>{run.coverage_answered}</span><span style={{ fontSize: '13px', opacity: 0.8 }}>Answered</span></div>
              <div style={statStyle}><span style={{ fontSize: '32px', fontWeight: 'bold', color: '#e74c3c' }}>{run.coverage_not_found}</span><span style={{ fontSize: '13px', opacity: 0.8 }}>Not Found</span></div>
              <div style={statStyle}><span style={{ fontSize: '32px', fontWeight: 'bold', color: '#f1c40f' }}>{run.coverage_total > 0 ? Math.round((run.coverage_answered / run.coverage_total) * 100) : 0}%</span><span style={{ fontSize: '13px', opacity: 0.8 }}>Coverage Rate</span></div>
            </div>
          </div>
        )}

        {questions.map(q => (
          <div key={q.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ color: '#1e3a5f', margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>{q.question_text}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {q.is_edited && <span style={{ fontSize: '11px', backgroundColor: '#f39c12', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>Edited</span>}
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', backgroundColor: getConfidenceColor(q.confidence), color: 'white', fontWeight: 'bold' }}>
                  {Math.round((q.confidence || 0) * 100)}% confidence
                </span>
              </div>
            </div>
            {editingId === q.id ? (
              <div>
                <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={() => handleSave(q.id)} style={{ ...buttonStyle, backgroundColor: '#27ae60' }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ ...buttonStyle, backgroundColor: '#95a5a6' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '12px' }}>{q.answer}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>{q.citations && q.citations.length > 0 && q.citations[0] && <p style={{ fontSize: '13px', color: '#666' }}><strong>Citations:</strong> {q.citations.join(', ')}</p>}</div>
                  <button onClick={() => handleEdit(q)} style={buttonStyle}>Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const buttonStyle = { backgroundColor: '#1e3a5f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
const statStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }
