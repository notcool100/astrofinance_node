import React from 'react';

interface ErrorScreenProps {
  error: Error;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  return (
    <div className="my-8 mx-auto max-w-2xl p-6 bg-red-50 rounded-md text-center">
      <div 
        className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-4"
      >
        !
      </div>
      <h2 className="text-lg font-semibold mb-2">
        An error occurred
      </h2>
      <p className="mb-4">
        {error.message || 'Something went wrong. Please try again later.'}
      </p>
      {onRetry && (
        <button 
          className="btn btn-danger"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorScreen;