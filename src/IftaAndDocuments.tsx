import React, { useState } from 'react';

export default function IftaAndDocuments() {
  const [reportRange, setReportRange] = useState<string>('Quarterly');

  const handleGenerateReport = () => {
    console.log(`Generating ${reportRange} report...`);
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-white p-8">
      {/* Header Section with Report Frequency Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Admin Tax Estimation & IFTA Calculator</h1>
          <p className="text-gray-400 text-sm mt-1">
            Overview of fleet fuel consumption and estimated tax liability across active state corridors.
          </p>
        </div>

        {/* Report Range Selector & Generate Action */}
        <div className="flex flex-wrap items-center gap-3 bg-[#111827] px-4 py-2.5 rounded-xl border border-gray-800 shadow-lg">
          <span className="text-sm text-gray-300 font-medium">Report Range:</span>
          <select 
            value={reportRange} 
            onChange={(e) => setReportRange(e.target.value)}
            className="bg-[#1f2937] text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly (IFTA)</option>
            <option value="Bi-Annually">Bi-Annually</option>
            <option value="Yearly">Yearly</option>
          </select>
          <button 
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards Panel */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-200">IFTA & Tax Summary</h2>
          <p className="text-xs text-gray-400">Showing summary metrics for the selected <span className="text-blue-400 font-medium">{reportRange.toLowerCase()}</span> period.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1f2937] border border-gray-700/60 p-6 rounded-xl text-center shadow-inner">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Total Gallons Burned</p>
            <h3 className="text-3xl font-extrabold text-white">205 gal</h3>
          </div>
          <div className="bg-[#1f2937] border border-gray-700/60 p-6 rounded-xl text-center shadow-inner">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Total Fuel Expenditures</p>
            <h3 className="text-3xl font-extrabold text-white">$760</h3>
          </div>
        </div>
      </div>
    </div>
  );
}