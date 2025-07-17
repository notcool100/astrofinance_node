import React, { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  children?: ReactNode;
  className?: string;
  // Add these props to support existing usage
  color?: string;
  text?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'primary', 
  children, 
  className = '',
  color,
  text
}) => {
  const baseClasses = 'badge';
  const variantClasses = `badge-${variant}`;
  
  // Map color prop to variant if provided
  let variantClass = variantClasses;
  if (color) {
    switch(color) {
      case 'green': variantClass = 'badge-success'; break;
      case 'red': variantClass = 'badge-danger'; break;
      case 'blue': variantClass = 'badge-primary'; break;
      case 'yellow': variantClass = 'badge-warning'; break;
      case 'gray': variantClass = 'badge-secondary'; break;
      default: variantClass = `badge-${variant}`;
    }
  }

  return (
    <span className={`${baseClasses} ${variantClass} ${className}`}>
      {text || children}
    </span>
  );
};

export default Badge;