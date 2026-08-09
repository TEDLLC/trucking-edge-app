import React from 'react';
import { useRegionStore } from '../services/useRegion';

interface RouteMapProps {
  pickup: string;
  delivery: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({ pickup, delivery }) => {
  const { region } = useRegionStore();
  const isEU = region === 'EU';

  // Format clean query string for OpenStreetMap embeds
  const routeQuery = encodeURIComponent(`${pickup} to ${delivery}`);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          🗺️ Live Route Preview: <span className="text-sky-400">{pickup} ➔ {delivery}</span>
        </h4>
        <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
          {isEU ? 'EU Corridor' : 'US Interstate'}
        </span>
      </div>

      <div className="w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center">
        <iframe
          title="Route Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://maps.google.com/maps?q=${routeQuery}&t=&z=6&ie=UTF8&iwloc=&output=embed`}
          className="opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
};