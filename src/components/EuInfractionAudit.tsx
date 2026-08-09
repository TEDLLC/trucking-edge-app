import React, { useState } from 'react';

interface Infraction {
  id: string;
  driver: string;
  violationType: string;
  severity: 'High' | 'Medium' | 'Low';
  date: string;
  status: 'Pending Review' | 'Resolved & Fined';
}

export function EuInfractionAudit() {
  const [infractions] = useState<Infraction[]>([
    { id: 'inf-1', driver: 'Janis Kask', violationType: 'Exceeded 4.5h Continuous Driving', severity: 'High', date: '2026-08-07', status: 'Pending Review' },
    { id: 'inf-2', driver: 'Marek Novak', violationType: 'Insufficient Daily Rest (7.5h)', severity: 'High', date: '2026-08-05', status: 'Resolved & Fined' }
  ]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Enterprise Infraction & Fine Audit Workflow</h3>
          <p className="text-xs text-slate-400">Review, flag, and resolve tachograph violations to mitigate carrier liability risk.</p>
        </div>
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
          2 Active Flags
        </span>
      </div>

      <div className="space-y-3">
        {infractions.map((inf) => (
          <div key={inf.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white">{inf.driver}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${inf.severity === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {inf.severity} Risk
                </span>
              </div>
              <p className="text-xs text-slate-300">{inf.violationType} — <span className="text-slate-500">{inf.date}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">{inf.status}</span>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded transition">
                Manage Audit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}