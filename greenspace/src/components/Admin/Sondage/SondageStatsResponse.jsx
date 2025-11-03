import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSondageResponseStatistics, useResponsesBySondageId } from "../../../services/response";
import { useQuestionsBySondageId } from "../../../services/questions";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Theme colors (reused from SondageDetail.jsx)
const themeColors = {
  red: {
    primary: '#ff3b30',
    secondary: '#ff2d55',
    bgLight: '#fef2f2',
    bgDark: '#3f0a0a',
    textLight: '#1f2937',
    textDark: '#f3f4f6',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  green: {
    primary: '#4cd964',
    secondary: '#34c759',
    bgLight: '#f0fdf4',
    bgDark: '#052e16',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  blue: {
    primary: '#132977',
    secondary: '#007aff',
    bgLight: '#eff6ff',
    bgDark: '#1e3a8a',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  pink: {
    primary: '#ff2d55',
    secondary: '#ff69b4',
    bgLight: '#fff1f2',
    bgDark: '#3f0713',
    textLight: '#1f2937',
    textDark: '#f3f4f6',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  yellow: {
    primary: '#ffcc00',
    secondary: '#ff9500',
    bgLight: '#fefce8',
    bgDark: '#3f2c00',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  orange: {
    primary: '#ff9500',
    secondary: '#ff7f50',
    bgLight: '#fff7ed',
    bgDark: '#3f2d0f',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  gray: {
    primary: '#8e8e93',
    secondary: '#a9a9a9',
    bgLight: '#f9fafb',
    bgDark: '#374151',
    textLight: '#1f2937',
    textDark: '#d1d5db',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  brown: {
    primary: '#D2691E',
    secondary: '#8B4513',
    bgLight: '#fef7ed',
    bgDark: '#2f1c0a',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  darkgreen: {
    primary: '#228B22',
    secondary: '#006400',
    bgLight: '#f0fdf4',
    bgDark: '#092709',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  deeppink: {
    primary: '#FFC0CB',
    secondary: '#FF69B4',
    bgLight: '#fff1f2',
    bgDark: '#3f0b1e',
    textLight: '#1f2937',
    textDark: '#f3f4f6',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  cadetblue: {
    primary: '#5f9ea0',
    secondary: '#4682b4',
    bgLight: '#f0f9ff',
    bgDark: '#1c2f3a',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
  darkorchid: {
    primary: '#9932cc',
    secondary: '#9400d3',
    bgLight: '#f5f3ff',
    bgDark: '#2e1a3f',
    textLight: '#1f2937',
    textDark: '#e5e7eb',
    borderLight: '#d1d5db',
    borderDark: '#4b5563',
  },
};

const SondageStatsResponse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sondageId = parseInt(id);
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Hooks
  const {
    data: statistics,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorMessage,
  } = useSondageResponseStatistics(sondageId);
  const {
    data: responses,
    isLoading: responsesLoading,
    isError: responsesError,
    error: responsesErrorMessage,
  } = useResponsesBySondageId(sondageId);
  const {
    data: questions,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErrorMessage,
  } = useQuestionsBySondageId(sondageId);

  // Theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  // State for tab navigation
  const [activeTab, setActiveTab] = useState("statistics");

  // Prepare data for charts
  const prepareChartData = (question, responses) => {
    if (!statistics || !statistics.questionStatistics || !statistics.questionStatistics[question.id]) {
      return [];
    }

    const questionStats = statistics.questionStatistics[question.id];
    const responseData = [];

    if (question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") {
      // Use choices from question or derive from choiceCounts
      const choices = question.choices?.length
        ? question.choices
        : Object.keys(questionStats.choiceCounts || {});
      choices.forEach((choice) => {
        responseData.push({
          name: choice,
          count: questionStats.choiceCounts?.[choice] || 0,
        });
      });
    } else if (question.type === "RATING") {
      // Map ratings 1 to 5
      for (let i = 1; i <= 5; i++) {
        responseData.push({
          name: `${i}`,
          count: questionStats.ratingDistribution?.[i.toString()] || 0,
        });
      }
    } else if (question.type === "YES_NO") {
      responseData.push(
        { name: "Yes", count: questionStats.yesCount || 0 },
        { name: "No", count: questionStats.noCount || 0 }
      );
    } else if (question.type === "TEXT") {
      // Aggregate text responses from responses data
      const textResponses = responses
        .filter((r) => r.questionId === question.id && r.answerText)
        .reduce((acc, r) => {
          const text = r.answerText.trim();
          acc[text] = (acc[text] || 0) + 1;
          return acc;
        }, {});
      Object.keys(textResponses)
        .slice(0, 5)
        .forEach((text) => {
          responseData.push({
            name: text.length > 20 ? `${text.slice(0, 17)}...` : text,
            count: textResponses[text],
          });
        });
    }

    return responseData;
  };

  // Format response answer for display
  const formatResponseAnswer = (response) => {
    if (response.answerText) return response.answerText.trim();
    if (response.selectedChoices)
      return Array.isArray(response.selectedChoices)
        ? response.selectedChoices.join(", ")
        : response.selectedChoices;
    if (response.ratingValue !== null) return `Rating: ${response.ratingValue}`;
    if (response.yesNoAnswer !== null) return response.yesNoAnswer ? "Yes" : "No";
    return "No answer provided";
  };

  // Loading state
  if (statsLoading || responsesLoading || questionsLoading) {
    return (
      <div
        className={`min-h-screen p-6 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700'
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}
        style={{ marginTop: '80px', marginLeft: '250px' }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-16 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || responsesError || questionsError) {
    return (
      <div
        className={`min-h-screen p-6 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700'
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}
        style={{ marginTop: '80px', marginLeft: '250px' }}
      >
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
            Error: {statsErrorMessage?.message || responsesErrorMessage?.message || questionsErrorMessage?.message || "Failed to load data"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}
      style={{ marginTop: '80px', marginLeft: '250px' }}
    >
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
            --theme-bg: ${bgColor};
            --theme-text: ${textColor};
            --theme-border: ${borderColor};
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center space-x-3">
              <BarChart2 className={`w-8 h-8 ${darkMode ? 'text-gray-200' : 'text-[color:var(--theme-primary)]'}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Sondage Statistics & Responses
              </h1>
            </div>
            <div className="group relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/sondages")}
                className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                aria-label="Back to List"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
              >
                Back to List
              </motion.div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-4" aria-label="Tabs">
              {["statistics", "responses"].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-[color:var(--theme-primary)] text-[color:var(--theme-primary)]'
                      : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "statistics" ? "Statistics" : "Responses"}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
          >
            <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
              <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <BarChart2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                <span>{activeTab === "statistics" ? "Sondage Statistics" : "Sondage Responses"}</span>
              </h2>
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "statistics" && (
                  <motion.div
                    key="statistics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {questions && questions.length > 0 ? (
                      <div className="space-y-6">
                        {questions.map((question) => (
                          <div key={question.id} className="mb-6">
                            <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                              {statistics?.questionStatistics?.[question.id]?.questionContent || question.content || `Question ${question.id}`}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                              Type: {question.type}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
                              Total Responses: {statistics?.questionStatistics?.[question.id]?.responseCount || 0}
                              {question.type === "RATING" && statistics?.questionStatistics?.[question.id]?.averageRating
                                ? ` | Average Rating: ${statistics.questionStatistics[question.id].averageRating.toFixed(1)}`
                                : ""}
                            </p>
                            {prepareChartData(question, responses).length > 0 ? (
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                  data={prepareChartData(question, responses)}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#d1d5db'} />
                                  <XAxis
                                    dataKey="name"
                                    stroke={textColor}
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                  />
                                  <YAxis stroke={textColor} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: darkMode ? '#1f2937' : '#fff',
                                      borderColor: borderColor,
                                      color: textColor,
                                    }}
                                  />
                                  <Legend />
                                  <Bar dataKey="count" fill={primaryColor} />
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-center`}>
                                No response data available for this question
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        No questions available for statistics
                      </p>
                    )}
                  </motion.div>
                )}

                {activeTab === "responses" && (
                  <motion.div
                    key="responses"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {responses && responses.length > 0 ? (
                      <div className="space-y-4">
                        {responses.map((response) => (
                          <motion.div
                            key={response.id}
                            className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-700 border-gray-800' : 'bg-gray-50 border-gray-200'} hover:${darkMode ? 'bg-gray-600' : 'bg-gray-100'} transition-colors`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              Question: {statistics?.questionStatistics?.[response.questionId]?.questionContent ||
                                questions?.find((q) => q.id === response.questionId)?.content ||
                                `Unknown (ID: ${response.questionId})`}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              Answer: {formatResponseAnswer(response)}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              Submitted: {new Date(response.submissionTime).toLocaleString()}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              User ID: {response.userId}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        No responses available
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SondageStatsResponse;