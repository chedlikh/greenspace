
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useServices } from '../../services/hooks';
import { useGroups, fetchImageWithToken, useAuthToken } from '../../services/group';
import { Search, Users } from 'lucide-react';
import CreatePublicationForm from './Publication/CreatePublicationForm';
import PublicationList from './Publication/PublicationList';
import StoriesSection from './StoriesSection';
import { useQueries } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

// Fetch sondages function (adapted from provided useSondagesByServiceId)
const fetchSondagesByServiceId = async (serviceId, token) => {
  if (!token) throw new Error("No token provided");
  const response = await fetch(`${API_BASE_URL}/api/sondages/service/${serviceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch sondages for service");
  }
  return response.json();
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-xl text-center max-w-4xl mx-auto">
          <h3 className="text-red-600 font-semibold">Something went wrong</h3>
          <p className="text-red-500 text-sm mt-2">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const HomePage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupImageUrls, setGroupImageUrls] = useState({});
  const navigate = useNavigate();
  const token = useAuthToken();
  const reduxToken = useSelector((state) => state.auth.token); // For useQueries

  console.log('Auth Token:', token);

  // Fetch users
  const { userQuery, usersQuery } = useUsers();
  const { data: currentUser, isLoading: isUserLoading, error: userError } = userQuery;
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = usersQuery;

  // Fetch all groups
  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useGroups(0, 5, 'createDate', 'desc');

  // Fetch user-created groups
  const { data: myGroupsData, isLoading: myGroupsLoading, error: myGroupsError } = useGroups(0, 5, 'createDate', 'desc', currentUser?.id);

  // Fetch user's services
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices({ userId: currentUser?.id });

  // Fetch sondages for all services using useQueries
  const sondageQueries = useQueries({
    queries: services.map((service) => ({
      queryKey: ['sondages', 'service', service.id],
      queryFn: () => fetchSondagesByServiceId(service.id, reduxToken),
      enabled: !!service.id && !!reduxToken,
      onError: (error) => console.error('Sondages by service fetch error:', error),
    })),
  });

  // Aggregate sondages, loading, and error states
  const isSondagesLoading = sondageQueries.some((query) => query.isLoading);
  const sondagesError = sondageQueries.find((query) => query.error)?.error;
  const mySondages = sondageQueries.flatMap((query) => query.data || []);

  // Remove duplicate sondages
  const uniqueSondages = mySondages.filter(
    (sondage, index, self) => index === self.findIndex((s) => s.id === sondage.id)
  );

  const handlePublicationCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCardClick = (username) => {
    navigate(`/u/${username}`);
  };

  // Fetch group images
  useEffect(() => {
    if (!groupsData?.content || !myGroupsData?.content || !token) return;

    const loadImages = async () => {
      const newImageUrls = {};
      const allGroups = [...(groupsData.content || []), ...(myGroupsData.content || [])];
      for (const group of allGroups) {
        try {
          if (group.coverPhotoUrl) {
            newImageUrls[`cover_${group.id}`] = await fetchImageWithToken(group.coverPhotoUrl, token);
          }
          if (group.profilePhotoUrl) {
            newImageUrls[`profile_${group.id}`] = await fetchImageWithToken(group.profilePhotoUrl, token);
          }
        } catch (error) {
          console.error(`Failed to fetch image for group ${group.id}:`, error);
        }
      }
      setGroupImageUrls(newImageUrls);
    };

    loadImages();

    return () => {
      Object.values(groupImageUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [groupsData, myGroupsData, token]);

  const filteredUsers = users
    .filter((user) => user.isConnect)
    .filter((user) =>
      `${user.firstname} ${user.lastName} ${user.username} ${user.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'WILL_START_SOON':
        return 'bg-warning';
      case 'STARTED':
        return 'bg-success';
      case 'FINISHED':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  };

  return (
    <ErrorBoundary>
      <div className="main-content bg-gray-50 min-h-screen">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-8 col-lg-8 col-md-12" style={{ marginTop: '80px' }}>
              <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <StoriesSection />
                <CreatePublicationForm onSuccess={handlePublicationCreated} />
                <PublicationList key={refreshKey} />
              </div>
            </div>
            <div className="col-xl-4 col-xxl-3 col-lg-4 ps-lg-0" style={{ marginTop: '110px' }}>
              {/* Connected Users */}
              <div className="card w-100 shadow-xss rounded-xxl border-0 mb-3 bg-white">
                <div className="card-body d-flex align-items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center space-x-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h4 className="fw-700 mb-0 font-xss text-grey-900">Connected Users</h4>
                  </div>
                  <a href="/members" className="fw-600 ms-auto font-xssss text-primary hover:text-blue-700 transition-colors">
                    See all
                  </a>
                </div>
                <div className="card-body p-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search connected users..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 shadow-sm"
                    />
                  </div>
                  {(isUsersLoading || isUserLoading) && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 font-xss">Loading users...</p>
                    </div>
                  )}
                  {(usersError || userError) && (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-xss">{usersError?.message || userError?.message}</p>
                    </div>
                  )}
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleCardClick(user.username)}
                        className="group cursor-pointer mb-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
                      >
                        <div className="d-flex align-items-center">
                          <figure className="avatar me-3 relative">
                            <img
                              src={user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : '/assets/images/default-user.png'}
                              alt="user"
                              className="shadow-sm rounded-circle w-12 h-12 object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500 transform translate-x-1 translate-y-1"></span>
                          </figure>
                          <div>
                            <h4 className="fw-700 text-grey-900 font-xss mb-0">
                              {user.firstname} {user.lastName}
                            </h4>
                            <span className="d-block font-xssss fw-500 text-grey-500">@{user.username}</span>
                            {currentUser?.username === user.username && (
                              <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isUsersLoading && (
                      <div className="text-center py-4">
                        <p className="text-gray-600 font-xss">No connected users found.</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* List of Groups */}
              <div className="card w-100 shadow-xss rounded-xxl border-0 mb-3 bg-white">
                <div className="card-body d-flex align-items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                  <h4 className="fw-700 mb-0 font-xss text-grey-900">Explore Groups</h4>
                  <a href="/groups" className="fw-600 ms-auto font-xssss text-primary hover:text-blue-700 transition-colors">
                    See all
                  </a>
                </div>
                <div className="card-body p-4">
                  {groupsLoading && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 font-xss">Loading groups...</p>
                    </div>
                  )}
                  {groupsError && (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-xss">{groupsError.message || 'Failed to load groups'}</p>
                    </div>
                  )}
                  {groupsData?.content?.length > 0 ? (
                    groupsData.content.map((group) => (
                      <div
                        key={group.id}
                        className="group cursor-pointer mb-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        <div className="d-flex align-items-center">
                          <figure className="avatar me-3">
                            <img
                              src={groupImageUrls[`profile_${group.id}`] || '/default-group.png'}
                              alt={`${group.name} profile`}
                              className="shadow-sm rounded-circle w-12 h-12 object-cover"
                            />
                          </figure>
                          <div>
                            <h4 className="fw-700 text-grey-900 font-xss mb-0">{group.name}</h4>
                            <span className="d-block font-xssss fw-500 text-grey-500 capitalize">
                              {group.privacyLevel.toLowerCase().replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    !groupsLoading && (
                      <div className="text-center py-4">
                        <p className="text-gray-600 font-xss">No groups available.</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* My Groups */}
              <div className="card w-100 shadow-xss rounded-xxl border-0 mb-3 bg-white">
                <div className="card-body d-flex align-items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                  <h4 className="fw-700 mb-0 font-xss text-grey-900">My Groups</h4>
                  <a href="/groups" className="fw-600 ms-auto font-xssss text-primary hover:text-blue-700 transition-colors">
                    See all
                  </a>
                </div>
                <div className="card-body p-4">
                  {myGroupsLoading && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 font-xss">Loading my groups...</p>
                    </div>
                  )}
                  {myGroupsError && (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-xss">{myGroupsError.message || 'Failed to load my groups'}</p>
                    </div>
                  )}
                  {myGroupsData?.content?.length > 0 ? (
                    myGroupsData.content
                      .filter((group) => group.createdBy === currentUser?.id)
                      .map((group) => (
                        <div
                          key={group.id}
                          className="group cursor-pointer mb-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          <div className="d-flex align-items-center">
                            <figure className="avatar me-3">
                              <img
                                src={groupImageUrls[`profile_${group.id}`] || '/default-group.png'}
                                alt={`${group.name} profile`}
                                className="shadow-sm rounded-circle w-12 h-12 object-cover"
                              />
                            </figure>
                            <div>
                              <h4 className="fw-700 text-grey-900 font-xss mb-0">{group.name}</h4>
                              <span className="d-block font-xssss fw-500 text-grey-500 capitalize">
                                {group.privacyLevel.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    !myGroupsLoading && (
                      <div className="text-center py-4">
                        <p className="text-gray-600 font-xss">You haven't created any groups yet.</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Sondages for My Services */}
              <div className="card w-100 shadow-xss rounded-xxl border-0 mb-3 bg-white">
                <div className="card-body d-flex align-items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                  <h4 className="fw-700 mb-0 font-xss text-grey-900">Sondages for My Services</h4>
                  <a href="/sondages" className="fw-600 ms-auto font-xssss text-primary hover:text-blue-700 transition-colors">
                    See all
                  </a>
                </div>
                <div className="card-body p-4">
                  {(isSondagesLoading || servicesLoading) && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 font-xss">Loading sondages...</p>
                    </div>
                  )}
                  {(sondagesError || servicesError) && (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-xss">{sondagesError?.message || servicesError?.message || 'Failed to load sondages'}</p>
                    </div>
                  )}
                  {uniqueSondages.length > 0 ? (
                    uniqueSondages.map((sondage) => (
                      <div
                        key={sondage.id}
                        className="group cursor-pointer mb-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:shadow-sm"
                        onClick={() => navigate(`/sondage/${sondage.id}`)}
                      >
                        <div className="d-flex align-items-center justify-between">
                          <div>
                            <h4 className="fw-700 text-grey-900 font-xss mb-0">{sondage.titre}</h4>
                            <span className="d-block font-xssss fw-500 text-grey-500">
                              {new Date(sondage.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`badge ${getStatusBadgeClass(sondage.status)} font-xssss px-2 py-1`}>
                            {sondage.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isSondagesLoading && !servicesLoading && (
                      <div className="text-center py-4">
                        <p className="text-gray-600 font-xss">No sondages assigned to your services.</p>
                        <button
                          onClick={() => navigate('/sondages/create')}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Create a Sondage
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
