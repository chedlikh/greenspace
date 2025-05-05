import { useState } from 'react';
import { useUserTimelinePublications } from '../../../services/publications';
import PublicationCard from './PublicationCard';
import LoadingSpinner from './../LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import Pagination from './Pagination';

const UserProfilePublications = ({ username }) => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);

  const { data, isLoading, isError, error } = useUserTimelinePublications(username, page, size);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">Publications</h3>

      {data?.content?.length === 0 ? (
        <p className="text-gray-500 text-center">No publications yet.</p>
      ) : (
        <>
          <div className="space-y-6">
            {data.content.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={data?.totalPages || 0}
            onPageChange={setPage}
            pageSize={size}
            onPageSizeChange={setSize}
          />
        </>
      )}
    </div>
  );
};

export default UserProfilePublications;