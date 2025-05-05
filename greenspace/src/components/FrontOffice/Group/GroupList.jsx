import { useState,useEffect } from 'react';
import { useGroups,fetchImageWithToken,useAuthToken } from '../../../services/group';
import { Link } from 'react-router-dom';
import Pagination from './../Publication/Pagination';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';
import ErrorMessage from './../ErrorMessage';
import { toast } from 'react-toastify';

const GroupList = () => {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState('createDate');
    const [direction, setDirection] = useState('desc');
    const [imageUrls, setImageUrls] = useState({});
  
    const token = useAuthToken();
    const { data, isLoading, isError, error } = useGroups(page, size, sortBy, direction);
  
    // Fetch images when data changes
    useEffect(() => {
      if (!data?.content || !token) return;
  
      const loadImages = async () => {
        const newImageUrls = {};
        for (const group of data.content) {
          if (group.coverPhotoUrl) {
            newImageUrls[`cover_${group.id}`] = await fetchImageWithToken(group.coverPhotoUrl, token);
          }
          if (group.profilePhotoUrl) {
            newImageUrls[`profile_${group.id}`] = await fetchImageWithToken(group.profilePhotoUrl, token);
          }
        }
        setImageUrls(newImageUrls);
      };
  
      loadImages();
  
      // Cleanup Blob URLs on unmount
      return () => {
        Object.values(imageUrls).forEach((url) => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }, [data, token]);
  
    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorMessage message={error.message} />;
  
    return (
        <div className="main-content bg-gray-50 min-h-screen">

      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Explore Groups</h2>
          <div className="flex space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="createDate">Date</option>
              <option value="name">Name</option>
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
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.content?.length > 0 ? (
            data.content.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-40">
                  <img
                    src={imageUrls[`cover_${group.id}`] || '/default-cover.png'}
                    alt={`${group.name} cover`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2">
                    <img
                      src={imageUrls[`profile_${group.id}`] || '/default-group.png'}
                      alt={`${group.name} profile`}
                      className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    <Link to={`/groups/${group.id}`} className="hover:text-indigo-600 transition-colors">
                      {group.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{group.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {group.privacyLevel.toLowerCase().replace('_', ' ')}
                    </span>
                    <Link
                      to={`/groups/${group.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      View Group
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No groups available.</p>
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
      </div>
    );
  };
  
  export default GroupList;