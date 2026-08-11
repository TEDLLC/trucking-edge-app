import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface ReportsViewProps {
  organizationId: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ organizationId }) => {
  const [metrics, setMetrics] = useState({
    totalLoads: 0,
    totalRevenue: 0,
    totalDistance: 0,
    totalIncidents: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);

        // 1. Fetch Loads for Revenue & Mileage
        const { data: loadsData } = await supabase
          .from('loads')
          .select('rate, total_distance, status')
          .eq('organization_id', organizationId);

        // 2. Fetch Safety Incidents
        const { count: incidentCount } = await supabase
          .from('safety_incidents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId);

        let revenue = 0;
        let distance = 0;
        if (loadsData) {
          loadsData.forEach((load) => {
            revenue += Number(load.rate || 0);
            distance += Number(load.total_distance || 0);
          });
        }

        setMetrics({
          totalLoads: loadsData?.length || 0,
          totalRevenue: revenue,
          totalDistance: distance,
          totalIncidents: incidentCount || 0,
        });
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (organizationId) {
      fetchReportData();
    }
  }, [organizationId]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Loads,${metrics.totalLoads}\n`
      + `Total Revenue,$${metrics.totalRevenue.toFixed(2)}\n`
      + `Total Distance,${metrics.totalDistance} miles\n`
      + `Safety Incidents,${metrics.totalIncidents}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trucking_edge_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-4 text-gray-600">Generating Reports...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Business Intelligence & Analytics</h2>
          <p className="text-sm text-gray-500">Real-time organizational performance metrics</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
        >
          Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Loads</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalLoads}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${metrics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Mileage</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{metrics.totalDistance.toLocaleString()} mi</p>
        </div>
        <div className="bg-gray-50 p-4 rounded border">
          <p className="text-xs font-medium text-gray-500 uppercase">Safety Incidents</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{metrics.totalIncidents}</p>
        </div>
      </div>
    </div>
  );
};