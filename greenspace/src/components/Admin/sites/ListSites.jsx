import React from "react";
import { useSites } from "../../../services/hooks";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, AlertTriangle } from "lucide-react";

const ListSites = () => {
  const { data: sites, isLoading, isError, error } = useSites();
  const navigate = useNavigate();

  const handleSiteClick = (id) => {
    navigate(`/site/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-red-50">
        <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
        <p className="text-red-600 text-lg font-semibold text-center">
          Error fetching sites: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="text-white w-8 h-8" />
            <h2 className="text-xl font-bold text-white">List of Sites</h2>
          </div>
          <button 
            onClick={() => navigate("/create-site")}
            className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create New Site</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {['Name', 'Address', 'Type'].map((header) => (
                  <th 
                    key={header} 
                    className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr 
                  key={site.id} 
                  onClick={() => handleSiteClick(site.id)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                >
                  {[
                    site.nom, 
                    site.adresse, 
                    site.type
                  ].map((value, index) => (
                    <td 
                      key={index} 
                      className="p-4 text-sm text-gray-700"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sites.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            <p>No sites found. Create your first site!</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ListSites;