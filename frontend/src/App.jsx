import React, { useState } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function App() {
  const [file, setFile] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [job, setJob] = useState(null)
  const [voice, setVoice] = useState('Rachel')
  const [lang, setLang] = useState('fra')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('voice', voice)
    form.append('lang', lang)
    try {
      const res = await fetch(`${API}/api/jobs`, { method: 'POST', body: form })
      const data = await res.json()
      setJobId(data.job_id)
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    if (!jobId) return
    const res = await fetch(`${API}/api/jobs/${jobId}`)
    const data = await res.json()
    setJob(data)
  }

  return (
    <div style={{maxWidth: 720, margin: '40px auto', fontFamily: 'inter, system-ui, sans-serif'}}>
      <h1>Audiobook MVP</h1>
      <form onSubmit={submit}>
        <input type="file" accept=".pdf,.doc,.docx,.epub" onChange={e => setFile(e.target.files[0])} />
        <div style={{marginTop: 8, display: 'flex', gap: 12}}>
          <label>Voice: <input value={voice} onChange={e => setVoice(e.target.value)} /></label>
          <label>Lang: <input value={lang} onChange={e => setLang(e.target.value)} /></label>
        </div>
        <button style={{marginTop: 12}} type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Job'}</button>
      </form>

      {jobId && (
        <div style={{marginTop: 20}}>
          <div>Job ID: {jobId}</div>
          <button onClick={refresh}>Refresh</button>
        </div>
      )}

      {job && (
        <div style={{marginTop: 20, padding: 12, border: '1px solid #ddd', borderRadius: 8}}>
          <div>Status: <b>{job.status}</b></div>
          {job.error && <pre style={{color: 'crimson', whiteSpace: 'pre-wrap'}}>{job.error}</pre>}
          {job.output_mp3_url && (
            <div style={{marginTop: 8}}>
              <audio controls src={job.output_mp3_url.startsWith('/') ? `${API}${job.output_mp3_url}` : job.output_mp3_url} />
              <div><a href={job.output_mp3_url} target="_blank">Download MP3</a></div>
            </div>
          )}
          {job.output_m4b_url && (
            <div style={{marginTop: 8}}>
              <div><a href={job.output_m4b_url} target="_blank">Download M4B</a></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
