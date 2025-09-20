import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxPageButtons = 5
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Calculate the range of page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${
            currentPage === 1
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <ChevronLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
          Previous
        </button>
      </div>
      
      {showPageNumbers && (
        <div className="hidden md:-mt-px md:flex">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
                >
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page as number)}
                className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                  currentPage === page
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
      
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${
            currentPage === totalPages
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Next
          <ChevronRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;