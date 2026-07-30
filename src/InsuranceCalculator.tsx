import { useState } from 'react';
export default function InsuranceCalculator() {
  const [vehicleValue, setVehicleValue] = useState<number>(75000);
  const [radius, setRadius] = useState<string>('regional');
  const [experience, setExperience] = useState<string>('2-5');
  const [coverages, setCoverages] = useState({
    liability: true,
    physicalDamage: true,
    cargo: false,
  });

  // Simple estimation calculation logic
  const calculatePremium = () => {
    let base = vehicleValue * 0.015; // 1.5% base of vehicle value annually
    if (radius === 'otr') base *= 1.3;
    if (radius === 'local') base *= 0.8;

    if (experience === '0-1') base *= 1.4;
    if (experience === '5+') base *= 0.85;

    let multiplier = 0;
    if (coverages.liability) multiplier += 1.0;
    if (coverages.physicalDamage) multiplier += 0.6;
    if (coverages.cargo) multiplier += 0.3;

    const annualTotal = base * multiplier;
    const monthlyTotal = annualTotal / 12;

    return {
      monthly: Math.round(monthlyTotal),
      annual: Math.round(annualTotal),
    };
  };

  const estimate = calculatePremium();

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200 my-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Carrier Insurance Calculator</h3>
      <p className="text-sm text-gray-600 mb-6">
        Estimate your commercial insurance premiums based on vehicle specs and coverage options.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle & Trailer Value ($): {vehicleValue.toLocaleString()}
          </label>
          <input
            type="range"
            min="20000"
            max="200000"
            step="5000"
            value={vehicleValue}
            onChange={(e) => setVehicleValue(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driving Radius</label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="local">Local (&lt; 50 miles)</option>
              <option value="regional">Regional (50–500 miles)</option>
              <option value="otr">OTR / Long-Haul (&gt; 500 miles)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Experience</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="0-1">0–1 Years</option>
              <option value="2-5">2–5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Types</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={coverages.liability}
                onChange={(e) => setCoverages({ ...coverages, liability: e.target.checked })}
              />
              <span>Liability</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={coverages.physicalDamage}
                onChange={(e) => setCoverages({ ...coverages, physicalDamage: e.target.checked })}
              />
              <span>Physical Damage</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={coverages.cargo}
                onChange={(e) => setCoverages({ ...coverages, cargo: e.target.checked })}
              />
              <span>Cargo</span>
            </label>
          </div>
        </div>

        {/* Output Summary Card */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mt-6">
          <h4 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">Estimated Premium Breakdown</h4>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-500">Estimated Monthly</p>
              <p className="text-2xl font-bold text-indigo-600">${estimate.monthly.toLocaleString()} /mo</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Annual</p>
              <p className="text-2xl font-bold text-indigo-600">${estimate.annual.toLocaleString()} /yr</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}