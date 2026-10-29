import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string | React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  children,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`tooltip-wrapper ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}
    >
      {children}
      {isVisible && (
        <div 
          className={`tooltip-bubble tooltip-${position}`}
          role="tooltip"
        >
          {title && <div className="tooltip-title">{title}</div>}
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

interface InfoTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  size?: number;
  icon?: 'info' | 'help';
  color?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  size = 14,
  icon = 'info',
  color = 'var(--text-muted)'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="info-tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
      aria-label={title || 'More Information'}
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', position: 'relative', marginLeft: '0.35rem' }}
    >
      {icon === 'help' ? (
        <HelpCircle size={size} color={color} className="info-icon" />
      ) : (
        <Info size={size} color={color} className="info-icon" />
      )}
      {isVisible && (
        <div 
          className="tooltip-bubble tooltip-top"
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          {title && <div className="tooltip-title">{title}</div>}
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </span>
  );
};
