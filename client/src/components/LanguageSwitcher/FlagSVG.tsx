import React from 'react';

interface FlagSVGProps {
  countryCode: string;
  width?: number;
  height?: number;
  className?: string;
}

const FlagSVG: React.FC<FlagSVGProps> = ({ 
  countryCode, 
  width = 24, 
  height = 18, 
  className = '' 
}) => {
  const flags = {
    UA: (
      <svg width={width} height={height} viewBox="0 0 24 18" className={className}>
        <rect width="24" height="9" fill="#005BBB"/>
        <rect y="9" width="24" height="9" fill="#FFD500"/>
      </svg>
    ),
    US: (
      <svg width={width} height={height} viewBox="0 0 24 18" className={className}>
        <defs>
          <pattern id="stars" x="0" y="0" width="4.8" height="2.7" patternUnits="userSpaceOnUse">
            <rect width="4.8" height="2.7" fill="#002868"/>
            <circle cx="2.4" cy="1.35" r="0.3" fill="white"/>
          </pattern>
        </defs>
        <rect width="24" height="18" fill="#B22234"/>
        <rect y="1.38" width="24" height="1.38" fill="white"/>
        <rect y="4.15" width="24" height="1.38" fill="white"/>
        <rect y="6.92" width="24" height="1.38" fill="white"/>
        <rect y="9.69" width="24" height="1.38" fill="white"/>
        <rect y="12.46" width="24" height="1.38" fill="white"/>
        <rect y="15.23" width="24" height="1.38" fill="white"/>
        <rect width="9.6" height="9.69" fill="url(#stars)"/>
      </svg>
    ),
    RU: (
      <svg width={width} height={height} viewBox="0 0 24 18" className={className}>
        <rect width="24" height="6" fill="white"/>
        <rect y="6" width="24" height="6" fill="#0039A6"/>
        <rect y="12" width="24" height="6" fill="#D52B1E"/>
      </svg>
    )
  };

  const flagSVG = flags[countryCode as keyof typeof flags];
  
  if (!flagSVG) {
    // Fallback для неизвестного кода страны
    return (
      <div 
        style={{
          width: `${width}px`,
          height: `${height}px`,
          background: '#f0f0f0',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: '#666'
        }}
        className={className}
      >
        {countryCode}
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '3px',
        border: '1px solid rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'inline-block',
        lineHeight: 0
      }}
    >
      {flagSVG}
    </div>
  );
};

export default FlagSVG;