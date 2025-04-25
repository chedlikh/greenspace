
import { useState } from 'react';
import { usePublications } from '../../../services/publications';
import PublicationCard from './PublicationCard';
import Pagination from './Pagination';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { toast } from 'react-toastify';

const PublicationList = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createDate');
  const [direction, setDirection] = useState('desc');

  const { data, isLoading, isError, error } = usePublications(page, size, sortBy, direction);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recent Publications</h2>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="createDate">Date</option>
            <option value="viewCount">Views</option>
          </select>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {data?.content?.map((publication) => (
          <PublicationCard key={publication.id} publication={publication} />
        )) || <p className="text-gray-500">No publications available.</p>}
      </div>

      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 0}
        onPageChange={setPage}
        pageSize={size}
        onPageSizeChange={setSize}
      />
    </div>
  );
};

export default PublicationList;