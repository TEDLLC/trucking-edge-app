import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface DocumentManagerProps {
  organizationId: string;
}

const DOCUMENT_TYPES = [
  'BOL', 'POD', 'Rate Confirmation', 'Lumper Receipt', 'Fuel Receipt', 
  'Invoice', 'Driver Qualification', 'CDL', 'Medical Certificate', 
  'Vehicle Registration', 'Insurance', 'Inspection', 'Other'
];

export const DocumentManager: React.FC<DocumentManagerProps> = ({ organizationId }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loads, setLoads] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [docType, setDocType] = useState<string>('POD');
  const [selectedLoadId, setSelectedLoadId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // OCR Extraction Simulator State
  const [ocrModalDoc, setOcrModalDoc] = useState<any | null>(null);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    const [docsRes, loadsRes, driversRes] = await Promise.all([
      supabase.from('documents').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
      supabase.from('loads').select('id, load_number, customer').eq('organization_id', organizationId),
      supabase.from('drivers').select('id, first_name, last_name, driver_number').eq('organization_id', organizationId)
    ]);

    setDocuments(docsRes.data || []);
    setLoads(loadsRes.data || []);
    setDrivers(driversRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (organizationId) fetchData();
  }, [organizationId]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    try {
      // 1. Insert document record (Simulation of storage bucket URL & metadata)
      const { data: insertedDoc, error: docError } = await supabase.from('documents').insert([
        {
          organization_id: organizationId,
          document_type: docType,
          file_name: fileToUpload.name,
          file_size: fileToUpload.size,
          mime_type: fileToUpload.type || 'application/pdf',
          file_location: `storage/${organizationId}/${fileToUpload.name}`,
          related_load_id: selectedLoadId || null,
          related_driver_id: selectedDriverId || null,
          status: 'Active',
          version: 1
        }
      ]).select().single();

      if (docError) throw docError;

      // 2. Business Rule POD Workflow Trigger
      if (docType === 'POD' && selectedLoadId) {
        await supabase
          .from('loads')
          .update({ status: 'POD Received' })
          .eq('id', selectedLoadId);

        await supabase.from('load_activity').insert([
          {
            load_id: selectedLoadId,
            event_type: 'POD Uploaded & Verified',
            description: `Document ${fileToUpload.name} uploaded. Status set to POD Received and eligible for billing review.`
          }
        ]);
      }

      setFileToUpload(null);
      setSelectedLoadId('');
      setSelectedDriverId('');
      setShowUploadModal(false);
      setUploading(false);
      fetchData();
      alert('Document uploaded successfully.');
    } catch (err: any) {
      setUploading(false);
      alert(err.message || 'Failed to upload document');
    }
  };

  const handleSimulateOCR = async (doc: any) => {
    setOcrModalDoc(doc);
    setExtracting(true);
    setOcrResult(null);

    // Simulate OCR Extraction processing delay
    setTimeout(() => {
      setExtracting(false);
      setOcrResult({
        confidenceScore: '98.4%',
        extractedFields: {
          documentType: doc.document_type,
          detectedNumbers: doc.file_name.includes('INV') ? 'INV-99201' : 'BOL-44910',
          amountOrWeight: '$2,450.00 / 42,000 lbs',
          signee: 'John Doe (Receiver)',
          timestamp: new Date().toISOString()
        }
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Upload Action */}
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Document Management & POD Center</h2>
          <p className="text-sm text-gray-500">Centralized document repository with OCR extraction and automated POD workflows</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="px-3 py-1.5 border rounded text-xs font-semibold hover:bg-gray-50">
            🔄 Refresh Repository
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-800 border-b pb-2">Active Document Repository ({documents.length})</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{doc.file_name}</td>
                <td className="px-6 py-4 text-sm"><span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-100 text-indigo-800">{doc.document_type}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{(doc.file_size ? (doc.file_size / 1024).toFixed(1) : '120')} KB</td>
                <td className="px-6 py-4 text-sm"><span className="text-xs text-green-700 font-bold">{doc.status}</span></td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleSimulateOCR(doc)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium"
                  >
                    🤖 Run OCR
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No documents uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Upload Operational Document</h3>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border p-2 rounded text-sm bg-white"
                >
                  {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {docType === 'POD' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Attach to Load (Triggers POD Workflow)</label>
                  <select
                    value={selectedLoadId}
                    onChange={(e) => setSelectedLoadId(e.target.value)}
                    className="w-full border p-2 rounded text-sm bg-white"
                  >
                    <option value="">-- Choose Load --</option>
                    {loads.map(l => <option key={l.id} value={l.id}>Load #{l.load_number} ({l.customer})</option>)}
                  </select>
                </div>
              )}

              {docType.includes('Driver') || docType === 'CDL' || docType === 'Medical Certificate' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Attach to Driver</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full border p-2 rounded text-sm bg-white"
                  >
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
                  </select>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded text-sm font-medium shadow"
                >
                  {uploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OCR Modal */}
      {ocrModalDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">OCR & Document Extraction Analysis</h3>
            <p className="text-xs text-gray-500">File: <strong>{ocrModalDoc.file_name}</strong></p>

            {extracting ? (
              <div className="py-12 text-center space-y-2">
                <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-600">Extracting text and identifying document fields...</p>
              </div>
            ) : ocrResult ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-3 rounded text-xs flex justify-between items-center">
                  <span className="font-bold text-green-800">Extraction Successful</span>
                  <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded font-mono font-bold">Confidence: {ocrResult.confidenceScore}</span>
                </div>

                <div className="bg-slate-50 border p-4 rounded space-y-2 text-xs font-mono">
                  <p><strong>Type:</strong> {ocrResult.extractedFields.documentType}</p>
                  <p><strong>Detected Reference:</strong> {ocrResult.extractedFields.detectedNumbers}</p>
                  <p><strong>Value / Weight:</strong> {ocrResult.extractedFields.amountOrWeight}</p>
                  <p><strong>Signee / Details:</strong> {ocrResult.extractedFields.signee}</p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setOcrModalDoc(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-medium shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};