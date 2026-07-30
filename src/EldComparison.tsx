export default function EldComparison() {
  const eldProviders = [
    {
      name: 'Matrack',
      pricing: '~$19.95 / month',
      bestFor: 'Small fleets & owner-operators',
      features: 'Low-cost plug-and-play, GPS tracking, basic logs',
      highlight: 'Great for small fleets, low-cost'
    },
    {
      name: 'TruckingOffice / HOS247',
      pricing: '~$20.00 – $25.00 / month',
      bestFor: 'Mid-sized fleet compliance',
      features: 'HOS tracking, DVIR inspection reports, IFTA reporting options',
      highlight: 'Includes IFTA reporting'
    },
    {
      name: 'Samsara / Motive',
      pricing: '~$30.00 – $40.00 / month',
      bestFor: 'Enterprise fleet operations',
      features: 'Advanced AI safety tracking, dashcam integration, enterprise analytics',
      highlight: 'Advanced AI safety & dashcams'
    },
    {
      name: 'Garmin eLog / Blue Ink Technology',
      pricing: '~$250.00 – $295.00 (One-time fee)',
      bestFor: 'Budget-conscious carriers',
      features: 'No monthly subscription, hardware-only purchase model',
      highlight: 'No monthly subscription'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200 my-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">ELD Price Comparison Tab</h3>
      <p className="text-sm text-gray-600 mb-6">
        Compare popular Electronic Logging Device (ELD) providers to evaluate hardware costs, subscription plans, and key features at a glance.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Suited For</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Features Included</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eldProviders.map((provider, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {provider.name}
                  <span className="block text-xs font-normal text-indigo-600">{provider.highlight}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                  {provider.pricing}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {provider.bestFor}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {provider.features}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}