import { useState } from 'react';

interface EldProvider {
  id: string;
  name: string;
  tagline: string;
  pricing: string;
  pricingType: string;
  bestFor: string;
  features: string[];
  hardwareCost: string;
  rating: string;
}

const ELD_PROVIDERS: EldProvider[] = [
  {
    id: 'matrack',
    name: 'Matrack',
    tagline: 'Great for small fleets, low-cost',
    pricing: '$19.95 / month',
    pricingType: 'Monthly Subscription',
    bestFor: 'Small fleets & owner-operators',
    features: ['Low-cost plug-and-play', 'GPS tracking', 'Basic HOS logs', 'IFTA mileage tracking'],
    hardwareCost: '$49.99 (Hardware)',
    rating: '4.5 / 5'
  },
  {
    id: 'hos247',
    name: 'TruckingOffice / HOS247',
    tagline: 'Includes IFTA reporting',
    pricing: '$20.00 – $25.00 / month',
    pricingType: 'Monthly Subscription',
    bestFor: 'Mid-sized fleet compliance',
    features: ['HOS tracking', 'DVIR inspection reports', 'IFTA reporting options', 'Audit support'],
    hardwareCost: '$79.00 (Hardware)',
    rating: '4.6 / 5'
  },
  {
    id: 'samsara',
    name: 'Samsara / Motive',
    tagline: 'Advanced AI safety & dashcams',
    pricing: '$30.00 – $40.00 / month',
    pricingType: 'Monthly Subscription',
    bestFor: 'Enterprise fleet operations',
    features: ['Advanced AI safety tracking', 'Dashcam integration', 'Enterprise analytics', 'Fleet maintenance alerts'],
    hardwareCost: '$150.00 (Hardware)',
    rating: '4.8 / 5'
  },
  {
    id: 'garmin',
    name: 'Garmin eLog / Blue Ink Technology',
    tagline: 'No monthly subscription',
    pricing: '$250.00 – $295.00',
    pricingType: 'One-time hardware fee',
    bestFor: 'Budget-conscious carriers',
    features: ['No monthly subscription', 'Hardware-only purchase model', 'Offline data storage', 'Simple mobile app sync'],
    hardwareCost: 'Included in one-time fee',
    rating: '4.3 / 5'
  }
];

export default function EldComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['matrack', 'samsara']);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(item => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert('You can compare up to 3 providers at a time.');
      }
    }
  };

  const selectedProviders = ELD_PROVIDERS.filter(p => selectedIds.includes(p.id));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#ffffff', padding: '30px', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>ELD Price & Feature Comparison</h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Select 2 or more ELD providers below to compare their pricing, best use cases, and key features side-by-side.
        </p>
      </div>

      {/* Provider Selection Checkboxes */}
      <div style={{ marginBottom: '25px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', color: '#0f172a' }}>Select Providers to Compare (Choose up to 3):</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {ELD_PROVIDERS.map(provider => {
            const isChecked = selectedIds.includes(provider.id);
            return (
              <label key={provider.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: isChecked ? 'bold' : 'normal', color: isChecked ? '#1d4ed8' : '#334155' }}>
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => toggleSelect(provider.id)} 
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                {provider.name}
              </label>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      {selectedProviders.length > 0 ? (
        <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#fff' }}>
                <th style={{ padding: '12px', border: '1px solid #334155' }}>Feature / Metric</th>
                {selectedProviders.map(p => (
                  <th key={p.id} style={{ padding: '12px', border: '1px solid #334155' }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>Pricing Model</td>
                {selectedProviders.map(p => (
                  <td key={p.id} style={{ padding: '12px', border: '1px solid #cbd5e1', color: '#0284c7', fontWeight: 'bold' }}>{p.pricing}</td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>Best Suited For</td>
                {selectedProviders.map(p => (
                  <td key={p.id} style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{p.bestFor}</td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>Hardware Cost</td>
                {selectedProviders.map(p => (
                  <td key={p.id} style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{p.hardwareCost}</td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>User Rating</td>
                {selectedProviders.map(p => (
                  <td key={p.id} style={{ padding: '12px', border: '1px solid #cbd5e1', color: '#16a34a', fontWeight: 'bold' }}>{p.rating}</td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', background: '#f8fafc' }}>Key Features</td>
                {selectedProviders.map(p => (
                  <td key={p.id} style={{ padding: '12px', border: '1px solid #cbd5e1' }}>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {p.features.map((f, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{f}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Please select at least one provider to view the comparison.</p>
      )}

      {/* Full Overview Reference Table */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px', color: '#0f172a' }}>All Available Providers Reference</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#334155' }}>
              <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Provider</th>
              <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Pricing Model</th>
              <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Best Suited For</th>
              <th style={{ padding: '10px', border: '1px solid #cbd5e1' }}>Key Features Included</th>
            </tr>
          </thead>
          <tbody>
            {ELD_PROVIDERS.map(p => (
              <tr key={p.id}>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}><strong>{p.name}</strong><br/><span style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.tagline}</span></td>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1', color: '#0284c7' }}>{p.pricing}</td>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{p.bestFor}</td>
                <td style={{ padding: '10px', border: '1px solid #cbd5e1' }}>{p.features.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}