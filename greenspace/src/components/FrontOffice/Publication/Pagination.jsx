import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg ${currentPage === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'}`}
        >
          «
        </button>
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg ${currentPage === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'}`}
        >
          ‹
        </button>

        {startPage > 0 && (
          <span className="px-4 py-2 text-gray-600">...</span>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-4 py-2 rounded-lg ${currentPage === number ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'}`}
          >
            {number + 1}
          </button>
        ))}

        {endPage < totalPages - 1 && (
          <span className="px-4 py-2 text-gray-600">...</span>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-lg ${currentPage === totalPages - 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'}`}
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-lg ${currentPage === totalPages - 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors'}`}
        >
          »
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">Items per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;