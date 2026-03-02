import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

export default function Dashboard({ session }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const navigate = useNavigate()

  const headers = { Authorization: `Bearer ${session.access_token}` }

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const res = await axios.get(`${API}/questionnaire/runs`, { headers })
      setRuns(res.data.runs)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    if (status === 'completed') return '#27ae60'
    if (status === 'processing') return '#f39c12'
    return '#95a5a6'
  }

  const handleDeleteRun = async (e, runId) => {
    e.stopPropagation()
    if (!confirm('Delete this questionnaire run?')) return

    setDeletingId(runId)
    try {
      await axios.delete(`${API}/questionnaire/${runId}`, { headers })
      setRuns(runs.filter(r => r.id !== runId))
    } catch (err) {
      alert('Error deleting run')
    }
    setDeletingId('')
  }

  return (
    <div style={{ padding: '32px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#1e3a5f' }}>My Questionnaire Runs</h1>
          <button onClick={() => navigate('/run')} style={buttonStyle}>
            + New Run
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && runs.length === 0 && (
          <div style={emptyStyle}>
            <p style={{ fontSize: '18px', color: '#666' }}>No runs yet.</p>
            <p style={{ color: '#999' }}>Upload reference documents and run your first questionnaire.</p>
            <button onClick={() => navigate('/documents')} style={{ ...buttonStyle, marginTop: '16px' }}>
              Upload Documents
            </button>
          </div>
        )}

        {runs.map(run => (
          <div key={run.id} style={cardStyle} onClick={() => navigate(`/results/${run.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#1e3a5f', margin: 0 }}>{run.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: getStatusColor(run.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}
                >
                  {run.status}
                </span>
                <button
                  onClick={(e) => handleDeleteRun(e, run.id)}
                  style={{ ...deleteButtonStyle, opacity: deletingId === run.id ? 0.7 : 1 }}
                  disabled={deletingId === run.id}
                >
                  {deletingId === run.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '14px', color: '#666' }}>
              <span>Total: {run.coverage_total}</span>
              <span>Answered: {run.coverage_answered}</span>
              <span>Not Found: {run.coverage_not_found}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              {new Date(run.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const buttonStyle = {
  backgroundColor: '#1e3a5f',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
}

const deleteButtonStyle = {
  backgroundColor: '#e74c3c',
  color: 'white',
  border: 'none',
  padding: '6px 10px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px'
}

const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  cursor: 'pointer'
}

const emptyStyle = {
  backgroundColor: 'white',
  padding: '48px',
  borderRadius: '12px',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}
