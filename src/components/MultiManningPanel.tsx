import React, { useState } from 'react';

interface CrewDriver {
  id: string;
  name: string;
  role: 'Driver 1 (Active)' | 'Driver 2 (Co-Driver)' | 'Resting';
  accumulatedDrivingHours: number;
  restWindowRemainingHours: number;
}

export const MultiManningPanel: React.FC = () => {
  const [isMultiManningActive, setIsMultiManningActive] = useState<boolean>(true);
  const [drivers, setDrivers] = useState<CrewDriver[]>([
    { id: 'd1', name: 'John Doe', role: 'Driver 1 (Active)', accumulatedDrivingHours: 4.5, restWindowRemainingHours: 24.0 },
    { id: 'd2', name: 'Hans Gruber', role: 'Driver 2 (Co-Driver)', accumulatedDrivingHours: 0.0, restWindowRemainingHours: 28.5 },
  ]);

  const toggleCrewRoles = () => {
    setDrivers((prev) =>
      prev.map((d) => ({
        ...d,
        role: d.role.includes('Active') ? 'Driver 2 (Co-Driver)' : 'Driver 1 (Active)',
      }))
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 mt-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>👥 EU Multi-Manning Crew Hub</span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-medium">
              Reg 561/2006 Art. 8.5
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tracking double-manning shifts, alternating driving status, and the 30-hour rolling rest window.
          </p>
        </div>
        <button
          onClick={() => setIsMultiManningActive(!isMultiManningActive)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isMultiManningActive
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {isMultiManningActive ? 'Multi-Manning Active' : 'Single Driver Mode'}
        </button>
      </div>

      {isMultiManningActive && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{driver.name}</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                      driver.role.includes('Active')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {driver.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Shift Driving:</span>
                    <span className="font-semibold text-white">{driver.accumulatedDrivingHours} hrs / 10h max</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all"
                      style={{ width: `${(driver.accumulatedDrivingHours / 10) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">30-Hour Rest Window Left:</span>
                    <span className="font-semibold text-cyan-400">{driver.restWindowRemainingHours} hrs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={toggleCrewRoles}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              🔄 Swap Active Driver / Co-Driver Seat
            </button>
            <span className="text-xs text-slate-400">
              * Required 9h daily rest must be completed within 30 hours of the last rest period.
            </span>
          </div>
        </>
      )}
    </div>
  );
};