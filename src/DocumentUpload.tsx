import { useState } from 'react';
import { supabase } from './supabase';

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loadRef, setLoadRef] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !loadRef) {
      alert('Please enter a Load Reference and select a file.');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${loadRef}_${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage bucket named 'documents'
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading document:', uploadError);
      setMessage('Upload failed. Ensure a public storage bucket named "documents" exists in Supabase.');
    } else {
      setMessage('Bill of Lading uploaded successfully!');
      setFile(null);
      setLoadRef('');
    }
    setUploading(false);
  };

  return (
    <div className="p-8 text-slate-100 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Document Management (BOL / POD)</h2>

      <form onSubmit={handleUpload} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Load Reference / ID</label>
          <input 
            type="text" 
            value={loadRef} 
            onChange={(e) => setLoadRef(e.target.value)} 
            placeholder="Load #102" 
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white" 
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Select File (PDF, Image)</label>
          <input 
            type="file" 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" 
          />
        </div>
        <button 
          type="submit" 
          disabled={uploading} 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded text-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
        {message && <p className="text-xs text-indigo-400 mt-2">{message}</p>}
      </form>
    </div>
  );
}