import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'

export default function Documents({ session }) {
  const [documents, setDocuments] = useState([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState('')

  const headers = { Authorization: `Bearer ${session.access_token}` }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API}/documents/list`, { headers })
      setDocuments(res.data.documents)
    } catch (err) {
      console.error(err)
    }
    setFetching(false)
  }

  const handleTextUpload = async () => {
    if (!name || !content) return alert('Please fill in both name and content')
    setLoading(true)
    try {
      await axios.post(`${API}/documents/upload`, { name, content }, { headers })
      setSuccess('Document uploaded successfully!')
      setName('')
      setContent('')
      fetchDocuments()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert('Error uploading document')
    }
    setLoading(false)
  }

  const handleFileUpload = async () => {
    if (!file) return alert('Please choose a file first')

    const formData = new FormData()
    formData.append('file', file)
    if (name.trim()) formData.append('name', name.trim())

    setLoading(true)
    try {
      await axios.post(`${API}/documents/upload-file`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('File uploaded and parsed successfully!')
      setFile(null)
      setName('')
      setContent('')
      fetchDocuments()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error uploading file')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    await axios.delete(`${API}/documents/${id}`, { headers })
    fetchDocuments()
  }

  return (
    <div style={{ padding: '32px', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Reference Documents</h1>

        <div style={cardStyle}>
          <h3 style={{ color: '#1e3a5f', marginBottom: '16px' }}>Add New Document</h3>
          {success && <p style={{ color: 'green', marginBottom: '12px' }}>{success}</p>}
          <input
            placeholder="Document name (e.g. Security Policy)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Paste document content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          <button onClick={handleTextUpload} disabled={loading} style={buttonStyle}>
            {loading ? 'Uploading...' : 'Upload Text Document'}
          </button>

          <div style={{ margin: '18px 0', borderTop: '1px solid #ececec' }} />

          <h4 style={{ color: '#1e3a5f', marginBottom: '10px' }}>Or Upload File</h4>
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>
            Supported formats: .txt, .md, .pdf, .docx
          </p>
          <input
            type="file"
            accept=".txt,.md,.pdf,.docx"
            onChange={e => setFile(e.target.files?.[0] || null)}
            style={{ marginBottom: '12px' }}
          />
          {file && <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Selected: {file.name}</p>}
          <button onClick={handleFileUpload} disabled={loading} style={{ ...buttonStyle, backgroundColor: '#27ae60' }}>
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        <h2 style={{ color: '#1e3a5f', marginTop: '32px', marginBottom: '16px' }}>
          Uploaded Documents ({documents.length})
        </h2>

        {fetching && <p>Loading...</p>}

        {!fetching && documents.length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', color: '#999' }}>
            No documents uploaded yet. Add your first reference document above.
          </div>
        )}

        {documents.map(doc => (
          <div key={doc.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#1e3a5f', margin: 0 }}>{doc.name}</h3>
              <button
                onClick={() => handleDelete(doc.id)}
                style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
            <p style={{ color: '#666', fontSize: '14px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
              {doc.content.substring(0, 300)}{doc.content.length > 300 ? '...' : ''}
            </p>
            <p style={{ fontSize: '12px', color: '#999' }}>{new Date(doc.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px',
  marginBottom: '16px', borderRadius: '8px',
  border: '1px solid #ddd', fontSize: '14px',
  boxSizing: 'border-box'
}

const buttonStyle = {
  backgroundColor: '#1e3a5f', color: 'white',
  border: 'none', padding: '12px 24px',
  borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
}

const cardStyle = {
  backgroundColor: 'white', padding: '24px',
  borderRadius: '12px', marginBottom: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}
