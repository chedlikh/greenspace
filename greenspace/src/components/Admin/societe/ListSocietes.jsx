import React from "react";
import { useSocietes } from "../../../services/hooks";
import { useNavigate } from "react-router-dom";
import { 
  Home as Building, 
  MapPin, 
  PlusCircle, 
  ChevronRight 
} from "react-feather";

const ListSocietes = () => {
  const { data: societes, isLoading, isError, error } = useSocietes();
  const navigate = useNavigate();

  const handleSocieteClick = (id) => {
    navigate(`/societe/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                Error: {error?.message || "Failed to load companies"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {societes?.length || 0} companies registered
            </p>
          </div>
          <button
            onClick={() => navigate("/create-societe")}
            className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200 flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Company
          </button>
        </div>

        {/* Companies List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="col-span-4 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                Company
              </div>
              <div className="col-span-5 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                Address
              </div>
              <div className="col-span-2 font-medium text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">
                Type
              </div>
              <div className="col-span-1"></div>
            </div>

            {societes?.map((societe) => (
              <div 
                key={societe.id} 
                onClick={() => handleSocieteClick(societe.id)}
                className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                <div className="col-span-4 flex items-center">
                  <Building className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">{societe.name}</span>
                </div>
                <div className="col-span-5 flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                  <span className="text-gray-600 dark:text-gray-300">{societe.adresse}</span>
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {societe.type}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {societes?.map((societe) => (
              <div 
                key={societe.id} 
                onClick={() => handleSocieteClick(societe.id)}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{societe.name}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      {societe.adresse}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {societe.type}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {societes?.length === 0 && (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No companies found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first company.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/create-societe")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                  New Company
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ListSocietes;