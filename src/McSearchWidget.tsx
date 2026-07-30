import React, { useState } from 'react';

export default function McSearchWidget() {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Opens the official FMCSA SAFER query page with the entered MC/DOT number
    const saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=querycarrier&query_string=${encodeURIComponent(
      query
    )}`;
    window.open(saferUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200 my-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Live SAFER / MC Number Verification</h3>
      <p className="text-sm text-gray-600 mb-6">
        Search any motor carrier's safety record, operating authority, and insurance status directly through the official FMCSA SAFER database.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter MC Number, USDOT Number, or Company Name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Search SAFER Database
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-2">
        * Opens secure official federal carrier safety records in a new tab.
      </p>
    </div>
  );
}