import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, isAlert = false }) => {
  return (
    <div 
      className="rounded-lg shadow-lg p-6 transition-all duration-200 transform hover:scale-105"
      style={{ 
        backgroundColor: isAlert ? '#FFD56B' : '#F7E9A0',
        border: isAlert ? '2px solid #FF6B6B' : '2px solid #E9C46A'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-70" style={{ color: '#3E3E3E' }}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-2" style={{ color: '#3E3E3E' }}>
            {value}
          </p>
          <p className="text-xs opacity-60 mt-1" style={{ color: '#3E3E3E' }}>
            {subtitle}
          </p>
        </div>
        <div className="text-3xl opacity-60">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;