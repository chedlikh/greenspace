import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUsers } from "../../services/hooks";
import { Search, UserPlus, Users, Grid, List, ArrowUpDown } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Theme color mapping based on Navbar's theme settings
const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55' },
  green: { primary: '#4cd964', secondary: '#34c759' },
  blue: { primary: '#132977', secondary: '#007aff' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500' },
  orange: { primary: '#ff9500', secondary: '#ff7f50' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9' },
  brown: { primary: '#D2691E', secondary: '#8B4513' },
  darkgreen: { primary: '#228B22', secondary: '#006400' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3' },
};

const ListUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);

  // Get user details and all users
  const { userQuery, usersQuery } = useUsers();
  const { data: currentUser, isLoading: isUserLoading, error: userError } = userQuery;
  const { data: users = [], isLoading, error } = usersQuery;

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    `${user.firstname} ${user.lastName} ${user.username} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Sort users based on selected sort option
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return `${a.firstname} ${a.lastName}`.localeCompare(`${b.firstname} ${b.lastName}`);
      case "name-desc":
        return `${b.firstname} ${b.lastName}`.localeCompare(`${a.firstname} ${a.lastName}`);
      case "date-asc":
        return new Date(a.createDate) - new Date(b.createDate);
      case "date-desc":
        return new Date(b.createDate) - new Date(a.createDate);
      case "role-asc":
        return (a.authorities[0]?.authority || "").localeCompare(b.authorities[0]?.authority || "");
      case "role-desc":
        return (b.authorities[0]?.authority || "").localeCompare(a.authorities[0]?.authority || "");
      default:
        return 0;
    }
  });

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleCardClick = (username) => {
    navigate(`/u/${username}`);
  };

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active" style={{ marginTop: '80px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header and Create User Button */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-[color:var(--theme-primary)]" />
                <h1 className="text-2xl font-bold text-gray-800">Users List</h1>
              </div>
              <button
                onClick={() => navigate("/create-user")}
                className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create New User</span>
              </button>
            </div>

            {/* Search Bar and Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="relative w-full sm:w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-600" />
                  <select
                    value={sortOption}
                    onChange={handleSortChange}
                    className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="date-asc">Join Date (Oldest)</option>
                    <option value="date-desc">Join Date (Newest)</option>
                    <option value="role-asc">Role (A-Z)</option>
                    <option value="role-desc">Role (Z-A)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewModeChange("grid")}
                    className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[color:var(--theme-primary)] text-white" : "bg-gray-200 text-gray-600"} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange("list")}
                    className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[color:var(--theme-primary)] text-white" : "bg-gray-200 text-gray-600"} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading & Error Handling */}
            {(isLoading || isUserLoading) && (
              <div className="text-center py-6">
                <p className="text-gray-600">Loading users...</p>
              </div>
            )}
            {(error || userError) && (
              <div className="text-center py-6">
                <p className="text-red-600">{error?.message || userError?.message}</p>
              </div>
            )}

            {/* Users Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedUsers.length > 0 ? (
                  sortedUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleCardClick(user.username)}
                      className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
                    >
                      <div className="p-6 text-center">
                        {/* Profile Picture */}
                        <div className="relative inline-block mb-4">
                          <img
                            src={user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : "images/default-user.png"}
                            alt="user"
                            className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                              user.isConnect ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                        </div>

                        {/* User Info */}
                        <h5 className="text-lg font-bold text-gray-800 mb-1">
                          {user.firstname} {user.lastName}
                        </h5>
                        <p className="text-sm text-gray-500 mb-1">@{user.username}</p>
                        <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                        <div className="text-xs text-gray-600 mb-2">
                          {user.authorities.map((auth) => auth.authority).join(", ")}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Joined: {new Date(user.createDate).toLocaleDateString()}
                        </div>
                        {currentUser?.username === user.username && (
                          <span className="inline-block bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)] text-xs px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  !isLoading && (
                    <div className="col-span-full text-center py-6">
                      <p className="text-gray-600">No users found.</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleCardClick(user.username)}
                        className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.photoProfile ? `${API_BASE_URL}/images/${user.photoProfile}` : "images/default-user.png"}
                            alt="user"
                            className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              user.isConnect ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></span>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-md font-bold text-gray-800">
                              {user.firstname} {user.lastName}
                            </h5>
                            {currentUser?.username === user.username && (
                              <span className="inline-block bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)] text-xs px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-600">{user.authorities.map((auth) => auth.authority).join(", ")}</p>
                          <p className="text-xs text-gray-500">Joined: {new Date(user.createDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    !isLoading && (
                      <div className="text-center py-6">
                        <p className="text-gray-600">No users found.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListUsers;