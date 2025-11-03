import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  Users, 
  Globe, 
  Building2, 
  Briefcase, 
  FileText, 
  BarChart, 
  Search, 
  Grid, 
  List, 
  ArrowUpDown, 
  BookOpen, 
  GraduationCap, 
  Stethoscope 
} from "lucide-react";

const DashboardCard = ({ icon: Icon, title, stats, linkTo, buttonText }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      <div className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-4 bg-[color:var(--theme-primary)]/10 rounded-full">
          <Icon className="w-10 h-10 text-[color:var(--theme-primary)]" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <div className="flex justify-center space-x-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
        <Link to={linkTo} className="w-full">
          <button className="w-full bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white py-2 rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-colors">
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("title-asc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const { theme, darkMode } = useSelector((state) => state.theme);

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
      title: "Sociétés",
      stats: [
        { value: 50, label: "Total Sociétés" },
        { value: 5, label: "Tunis" },
        { value: 3, label: "Sousse" }
      ],
      linkTo: "/societe",
      buttonText: "List Sociétés"
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
    },
    {
      icon: BookOpen,
      title: "Stories",
      stats: [
        { value: 50, label: "Total Stories" },
        { value: 5, label: "Finished" },
        { value: 3, label: "Not Started" }
      ],
      linkTo: "/stories",
      buttonText: "List Stories"
    },
    {
      icon: GraduationCap,
      title: "Formations",
      stats: [
        { value: 50, label: "Total Formations" },
        { value: 5, label: "Finished" },
        { value: 3, label: "Not Started" }
      ],
      linkTo: "/formations",
      buttonText: "List Formations"
    },
    {
      icon: GraduationCap,
      title: "Cabinets",
      stats: [
        { value: 50, label: "Total Cabinets" },
        { value: 5, label: "Finished" },
        { value: 3, label: "Not Started" }
      ],
      linkTo: "/cabinets",
      buttonText: "List Cabinets"
    },
     {
      icon: GraduationCap,
      title: "Programme",
      stats: [
        { value: 50, label: "Total Programmes" },
        { value: 5, label: "Finished" },
        { value: 3, label: "Not Started" }
      ],
      linkTo: "/programmes",
      buttonText: "List Programmes"
    },
     {
      icon: GraduationCap,
      title: "Sessions",
      stats: [
        { value: 50, label: "Total Sessions" },
        { value: 5, label: "Finished" },
        { value: 3, label: "Not Started" }
      ],
      linkTo: "/sessions",
      buttonText: "List sessions"
    }
  ];

  // Filter cards based on search query
  const filteredData = dashboardData.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort cards based on selected sort option
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortOption) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "total-asc":
        return a.stats[0].value - b.stats[0].value;
      case "total-desc":
        return b.stats[0].value - a.stats[0].value;
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

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  return (
    <div className="main-content right-chat-active" style={{ marginTop: '80px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-6`}>
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
          </div>

          {/* Search Bar and Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="relative w-full sm:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cards by title..."
                value={searchQuery}
                onChange={handleSearch}
                className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className={`border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                >
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="total-asc">Total (Low to High)</option>
                  <option value="total-desc">Total (High to Low)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? 'bg-[color:var(--theme-primary)] text-white' : 'bg-gray-200 text-gray-600'} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? 'bg-[color:var(--theme-primary)] text-white' : 'bg-gray-200 text-gray-600'} hover:bg-[color:var(--theme-secondary)] transition-colors`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedData.length > 0 ? (
                sortedData.map((card, index) => (
                  <DashboardCard key={index} {...card} />
                ))
              ) : (
                <div className="col-span-full text-center py-6">
                  <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>No cards found.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedData.length > 0 ? (
                  sortedData.map((card, index) => (
                    <div key={index} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="p-3 bg-[color:var(--theme-primary)]/10 rounded-full mr-4">
                        <card.icon className="w-8 h-8 text-[color:var(--theme-primary)]" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>{card.title}</h3>
                        <div className="flex space-x-4">
                          {card.stats.map((stat, statIndex) => (
                            <div key={statIndex}>
                              <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{stat.value}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Link to={card.linkTo}>
                        <button className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white px-4 py-2 rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-colors">
                          {card.buttonText}
                        </button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className={`text-gray-600 ${darkMode ? 'dark:text-gray-400' : ''}`}>No cards found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;