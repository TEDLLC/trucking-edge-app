import { useState } from 'react';

export default function IftaAndDocuments() {
  const [miles, setMiles] = useState<string>('5000');
  const [gallons, setGallons] = useState<string>('800');
  const [taxRate] = useState<number>(0.15); // Average fuel tax per gallon estimate (~$0.15)

  // Simple IFTA tax calculation
  const totalMiles = Number(miles) || 0;
  const totalGallons = Number(gallons) || 0;
  const mpg = totalGallons > 0 ? (totalMiles / totalGallons).toFixed(2) : '0.00';
  const estimatedTaxDue = (totalGallons * taxRate).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200 my-8 space-y-8">
      
      {/* IFTA Calculator Module */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">IFTA Tax Calculator Module</h3>
        <p className="text-sm text-gray-600 mb-6">
          Compute your net fuel tax liability or estimated refund based on total state miles and taxable gallons purchased.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Miles Traveled</label>
            <input
              type="number"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxable Gallons Purchased</label>
            <input
              type="number"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Average MPG</p>
            <p className="text-xl font-bold text-gray-800">{mpg}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Est. Tax Rate</p>
            <p className="text-xl font-bold text-gray-800">${taxRate.toFixed(2)} /gal</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Net Fuel Tax Due</p>
            <p className="text-xl font-bold text-indigo-600">${estimatedTaxDue}</p>
          </div>
        </div>
      </div>

      {/* Document Center */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Driver & Carrier Document Center</h3>
        <p className="text-sm text-gray-600 mb-4">
          Download standard templates and compliance files in PDF or CSV formats.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
            <div>
              <p className="font-medium text-sm text-gray-900">IFTA Quarterly Tax Return Form Template</p>
              <p className="text-xs text-gray-500">Standard reporting layout (.PDF)</p>
            </div>
            <button onClick={() => alert('Downloading IFTA Template...')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700">
              Download PDF
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
            <div>
              <p className="font-medium text-sm text-gray-900">Driver Trip Sheet & Mileage Log</p>
              <p className="text-xs text-gray-500">State-by-state distance tracking sheet (.CSV)</p>
            </div>
            <button onClick={() => alert('Downloading Trip Sheet...')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700">
              Download CSV
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
            <div>
              <p className="font-medium text-sm text-gray-900">Driver Qualification (DQ) File Checklist</p>
              <p className="text-xs text-gray-500">DOT compliance onboarding checklist (.PDF)</p>
            </div>
            <button onClick={() => alert('Downloading DQ Checklist...')} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700">
              Download PDF
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}