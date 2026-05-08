import React from 'react';
import { Link } from 'react-router-dom';

export default function CookCard({ cook }) {
  const { user, cuisines, location, pricePerDay, rating, _id } = cook;
  
  return (
    <div className="bg-white rounded-[1rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all flex flex-col h-full">
      <div className="aspect-[4/5] relative overflow-hidden bg-primary-container/20">
        <div className="w-full h-full flex items-center justify-center text-primary/40 group-hover:scale-105 transition-transform duration-500">
          <span className="text-6xl font-display-lg">{user?.name?.charAt(0)?.toUpperCase() || 'C'}</span>
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <span className="material-symbols-outlined text-orange-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="text-xs font-bold text-on-background">{rating ? rating.toFixed(1) : 'New'}</span>
        </div>
      </div>
      
      <div className="p-5 space-y-3 flex-grow flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-on-background">{user?.name || 'Cook Name'}</h4>
            <p className="text-caption text-on-surface-variant flex items-center gap-1 mt-1">
              📍 {location?.city || 'City'}, {location?.state || 'State'}
            </p>
          </div>
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 flex-grow">
          {cuisines?.slice(0, 3).map((cuisine, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
              {cuisine}
            </span>
          ))}
          {cuisines?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">
              +{cuisines.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="text-primary font-bold text-lg">
            ${pricePerDay}<span className="text-sm text-gray-500 font-normal">/day</span>
          </div>
          <Link 
            to={`/cook/${_id}`}
            className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary text-sm font-bold rounded-lg transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
