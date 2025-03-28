import React from "react";
import { Link } from "react-router-dom";
import { Users, Globe, Building2, Briefcase, FileText, BarChart } from "lucide-react";

const DashboardCard = ({ icon: Icon, title, stats, linkTo, buttonText }) => {
  return (
    
    
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      <div className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-4 bg-blue-50 rounded-full">
          <Icon className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <div className="flex justify-center space-x-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-semibold text-gray-700">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <Link to={linkTo} className="w-full">
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors">
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const dashboardData = [
    {
      icon: Users,
      title: "Users",
      stats: [
        { value: 500, label: "Online" },
        { value: 100, label: "Offline" },
        { value: 10, label: "Not Active" }
      ],
      linkTo: "/users",
      buttonText: "List Users"
    },
    {
      icon: Globe,
      title: "Sites",
      stats: [
        { value: 50, label: "Total Sites" },
        { value: 5, label: "Tunis" },
        { value: 3, label: "Sousse" }
      ],
      linkTo: "/sites",
      buttonText: "List Sites"
    },
    {
      icon: Building2,
      title: "Societés",
      stats: [
        { value: 50, label: "Total Societés" },
        { value: 5, label: "Tunis" },
        { value: 3, label: "Sousse" }
      ],
      linkTo: "/societe",
      buttonText: "List Societés"
    },
    {
      icon: Briefcase,
      title: "Services",
      stats: [
        { value: 50, label: "Total Services" },
        { value: 5, label: "Tunis" },
        { value: 3, label: "Sousse" }
      ],
      linkTo: "/services",
      buttonText: "List Services"
    },
    {
      icon: FileText,
      title: "Postes",
      stats: [
        { value: 50, label: "Total Postes" },
        { value: 5, label: "RH" },
        { value: 3, label: "Dev" }
      ],
      linkTo: "/postes",
      buttonText: "List Postes"
    },
    {
      icon: BarChart,
      title: "Sondages",
      stats: [
        { value: 50, label: "Total Sondages" },
        { value: 5, label: "Finished" },
        { value: 3, label: "Not Started" }
      ],
      linkTo: "/sondages",
      buttonText: "List Sondages"
    }
  ];

  return (
    <div className="main-content right-chat-active">
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search here..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg 
                className="absolute left-3 top-3 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              <svg 
                className="h-6 w-6 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardData.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
    </div>
    
    
  );

};

export default AdminDashboard;