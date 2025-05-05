import { useState } from 'react';
import { usePublications } from '../../../services/publications';
import PublicationCard from './PublicationCard';
import Pagination from './Pagination';
import LoadingSpinner from './../LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const PublicationList = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('createDate');
  const [direction, setDirection] = useState('desc');

  const { data, isLoading, isError, error } = usePublications(page, size, sortBy, direction);

  // Debug logging
  console.log('PublicationList data:', data);
  console.log('PublicationList content:', data?.content);
  if (data?.content) {
    data.content.forEach((pub, index) => {
      console.log(`Publication ${index} user:`, pub.user);
      console.log(`Publication ${index} photoProfile:`, pub.user?.photoProfile);
    });
  }

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Recent Publications</h2>
        <div className="flex space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="createDate">Date</option>
            <option value="viewCount">Views</option>
          </select>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {data?.content?.length > 0 ? (
          data.content.map((publication) => (
            <PublicationCard
              key={publication.id}
              publication={publication}
              group={publication.group}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center">No publications available.</p>
        )}
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