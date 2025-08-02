import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactElement;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-10 px-6 text-center border border-dashed border-gray-200 bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        {icon || (
          <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
            📦
          </div>
        )}
        <p className="font-bold text-lg">
          {title}
        </p>
        {description && (
          <p className="text-gray-600 max-w-md mx-auto">
            {description}
          </p>
        )}
        {actionText && onAction && (
          <button 
            className="btn btn-primary"
            onClick={onAction}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;