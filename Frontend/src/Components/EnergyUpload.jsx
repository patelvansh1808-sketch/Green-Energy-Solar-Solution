import React, { useState } from 'react';

export default function EnergyUpload({ apiBase = '' }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem('token');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    setLoading(true);
    setResult(null);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch(`${apiBase}/api/energy/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="energy-upload">
      <h3>Upload Energy Excel/CSV</h3>
      <form onSubmit={onSubmit}>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
      </form>
      {result && (
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
