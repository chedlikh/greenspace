import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useSondageById,
  useServicesBySondageId,
  useUpdateSondage,
  useDeleteSondage,
  useAssignServiceToSondage,
  useUnassignServiceFromSondage,
  useGservices,
} from "../../../services/hooks";
import {
  useQuestionsBySondageId,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useGenerateAIQuestions,
  useSaveGeneratedQuestions,
} from "../../../services/questions";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Check,
  X,
  ChevronDown,
  BarChart2,
} from "lucide-react";

// Theme color mapping with dark mode support
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

const SondageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sondageId = parseInt(id);
  const { theme, darkMode } = useSelector((state) => state.theme);

  // Hooks
  const {
    data: sondage,
    isLoading: sondageLoading,
    isError: sondageError,
    error: sondageErrorMessage,
  } = useSondageById(sondageId);
  const {
    data: assignedServices,
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesErrorMessage,
  } = useServicesBySondageId(sondageId);
  const { data: allServices, isLoading: allServicesLoading } = useGservices();
  const {
    data: questions,
    isLoading: questionsLoading,
    isError: questionsError,
    error: questionsErrorMessage,
  } = useQuestionsBySondageId(sondageId);

  const updateSondage = useUpdateSondage();
  const deleteSondage = useDeleteSondage();
  const assignService = useAssignServiceToSondage(sondageId);
  const unassignService = useUnassignServiceFromSondage(sondageId);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const generateAIQuestions = useGenerateAIQuestions();
  const saveGeneratedQuestions = useSaveGeneratedQuestions();

  // States
  const [editingSondage, setEditingSondage] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [activeTab, setActiveTab] = useState("view");
  const [newQuestion, setNewQuestion] = useState({
    content: "",
    type: "TEXT",
    choices: ["", "", "", ""],
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestionData, setEditingQuestionData] = useState({
    content: "",
    type: "TEXT",
    choices: [],
  });
  const [expandedService, setExpandedService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  // Initialize Form Data
  useEffect(() => {
    if (sondage) {
      setFormData({
        titre: sondage.titre,
        description: sondage.description,
        startDate: sondage.startDate.split("T")[0],
        endDate: sondage.endDate.split("T")[0],
      });
    }
  }, [sondage]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = (e) => {
    e.preventDefault();
    if (isNaN(sondageId)) {
        toast.error("Invalid sondage ID", { position: "top-right" });
        return;
    }
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
        toast.error("End date cannot be before start date", { position: "top-right" });
        return;
    }
    const formattedData = {
        titre: formData.titre,
        description: formData.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    };
    console.log("Updating sondage with data:", { id: sondageId, sondageData: formattedData });
    updateSondage.mutate(
        { id: sondageId, sondageData: formattedData },
        {
            onSuccess: () => {
                setEditingSondage(false);
                toast.success("Sondage updated!", { position: "top-right" });
            },
            onError: (error) => {
                console.error("Update error:", error);
                toast.error(`Error: ${error.message}`, { position: "top-right" });
            },
        }
    );
};

  const handleDelete = () => {
    setDeleteTarget({ type: "sondage", id: null });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget.type === "sondage") {
      deleteSondage.mutate(null, {
        onSuccess: () => {
          toast.success("Sondage deleted!", { position: "top-right" });
          navigate("/sondages");
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`, { position: "top-right" });
        },
      });
    } else if (deleteTarget.type === "question") {
      deleteQuestion.mutate(
        { questionId: deleteTarget.id, sondageId },
        {
          onSuccess: () => {
            toast.success("Question deleted!", { position: "top-right" });
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`, { position: "top-right" });
          },
        }
      );
    } else if (deleteTarget.type === "service") {
      unassignService.mutate(
        { serviceId: deleteTarget.id },
        {
          onSuccess: () => {
            toast.success("Service unassigned!", { position: "top-right" });
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`, { position: "top-right" });
          },
        }
      );
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleAssignService = () => {
    if (selectedServiceId) {
      assignService.mutate(
        { serviceId: parseInt(selectedServiceId) },
        {
          onSuccess: () => {
            setSelectedServiceId("");
            toast.success("Service assigned!", { position: "top-right" });
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`, { position: "top-right" });
          },
        }
      );
    }
  };

  const handleUnassignService = (serviceId) => {
    setDeleteTarget({ type: "service", id: serviceId });
    setShowDeleteModal(true);
  };

  // Question Handlers
  const handleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleChoiceChange = (index, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) => (i === index ? value : choice)),
    }));
  };

  const addChoice = () => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: [...prev.choices, ""],
    }));
  };

  const removeChoice = (index) => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
    }));
  };

  const handleAddManualQuestion = () => {
    if (!newQuestion.content.trim()) {
      toast.error("Question content required", { position: "top-right" });
      return;
    }
    if (["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(newQuestion.type)) {
      const validChoices = newQuestion.choices.filter((choice) => choice.trim());
      if (validChoices.length < 2) {
        toast.error("At least 2 choices required", { position: "top-right" });
        return;
      }
    }
    createQuestion.mutate(
      {
        sondageId,
        questionData: {
          content: newQuestion.content,
          type: newQuestion.type,
          choices: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(newQuestion.type)
            ? newQuestion.choices.filter((choice) => choice.trim())
            : [],
        },
      },
      {
        onSuccess: () => {
          setNewQuestion({ content: "", type: "TEXT", choices: ["", "", "", ""] });
          setActiveTab("view");
          toast.success("Question added!", { position: "top-right" });
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`, { position: "top-right" });
        },
      }
    );
  };

  const handleGenerateAIQuestions = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error("Prompt required", { position: "top-right" });
      return;
    }
    if (aiQuestionCount < 1) {
      toast.error("At least 1 question required", { position: "top-right" });
      return;
    }
    try {
      const questions = await generateAIQuestions.mutateAsync({
        prompt: aiPrompt,
        count: aiQuestionCount,
      });
      setGeneratedQuestions(questions);
      setSelectedQuestions(questions.map((_, index) => index));
      toast.success(`Generated ${questions.length} questions!`, { position: "top-right" });
    } catch (error) {
      toast.error(`Error: ${error.message || "Unknown error"}`, { position: "top-right" });
    }
  };

  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllQuestions = (selectAll) => {
    setSelectedQuestions(selectAll ? generatedQuestions.map((_, index) => index) : []);
  };

  const handleSaveAIQuestions = () => {
    const selectedAIQuestions = generatedQuestions.filter((_, index) =>
      selectedQuestions.includes(index)
    );
    if (selectedAIQuestions.length === 0) {
      toast.error("No questions selected", { position: "top-right" });
      return;
    }
    saveGeneratedQuestions.mutate(
      { sondageId, questions: selectedAIQuestions },
      {
        onSuccess: () => {
          setGeneratedQuestions([]);
          setSelectedQuestions([]);
          setAiPrompt("");
          setAiQuestionCount(5);
          setActiveTab("view");
          toast.success("AI questions saved!", { position: "top-right" });
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`, { position: "top-right" });
        },
      }
    );
  };

  const startEditingQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditingQuestionData({
      content: question.content,
      type: question.type,
      choices: question.choices || [],
    });
  };

  const handleEditingQuestionChange = (e) => {
    const { name, value } = e.target;
    setEditingQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditingChoiceChange = (index, value) => {
    setEditingQuestionData((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) => (i === index ? value : choice)),
    }));
  };

  const addChoiceToEditingQuestion = () => {
    setEditingQuestionData((prev) => ({
      ...prev,
      choices: [...prev.choices, "New Choice"],
    }));
  };

  const removeChoiceFromEditingQuestion = (index) => {
    setEditingQuestionData((prev) => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
    }));
  };

  const saveEditedQuestion = () => {
    if (!editingQuestionData.content.trim()) {
      toast.error("Question content required", { position: "top-right" });
      return;
    }
    if (["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(editingQuestionData.type)) {
      const validChoices = editingQuestionData.choices.filter((choice) => choice.trim());
      if (validChoices.length < 2) {
        toast.error("At least 2 choices required", { position: "top-right" });
        return;
      }
    }
    updateQuestion.mutate(
      {
        questionId: editingQuestionId,
        questionData: {
          content: editingQuestionData.content,
          type: editingQuestionData.type,
          choices: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(editingQuestionData.type)
            ? editingQuestionData.choices.filter((choice) => choice.trim())
            : [],
        },
        sondageId,
      },
      {
        onSuccess: () => {
          setEditingQuestionId(null);
          setEditingQuestionData({ content: "", type: "TEXT", choices: [] });
          toast.success("Question updated!", { position: "top-right" });
        },
        onError: (error) => {
          toast.error(`Error: ${error.message}`, { position: "top-right" });
        },
      }
    );
  };

  const cancelEditingQuestion = () => {
    setEditingQuestionId(null);
    setEditingQuestionData({ content: "", type: "TEXT", choices: [] });
  };

  const handleDeleteQuestion = (questionId) => {
    setDeleteTarget({ type: "question", id: questionId });
    setShowDeleteModal(true);
  };

  // Utility Functions
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "WILL_START_SOON":
        return darkMode ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-800";
      case "STARTED":
        return darkMode ? "bg-emerald-900 text-emerald-200" : "bg-emerald-100 text-emerald-800";
      case "FINISHED":
        return darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";
      default:
        return darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800";
    }
  };

  const availableServices = allServices
    ? allServices.filter(
        (service) =>
          !assignedServices ||
          !assignedServices.some((assignedService) => assignedService.id === service.id)
      )
    : [];

  // Loading and Error States
  if (sondageLoading || servicesLoading || allServicesLoading || questionsLoading) {
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

  if (sondageError || servicesError || questionsError) {
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
            Error: {sondageErrorMessage?.message || servicesErrorMessage?.message || questionsErrorMessage?.message}
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
                {editingSondage ? "Edit Sondage" : sondage?.titre}
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

          {/* Main Content */}
          <div className="space-y-6">
            {/* Sondage Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <BarChart2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                  <span>Sondage Details</span>
                </h2>
              </div>
              <div className="p-6">
                {editingSondage ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Title
                        </label>
                        <input
                          type="text"
                          name="titre"
                          value={formData.titre}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required
                          placeholder="Enter sondage title"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Description
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required
                          placeholder="Enter sondage description"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex space-x-2">
                      <div className="group relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                          disabled={updateSondage.isPending}
                          aria-label="Save Changes"
                        >
                          <Check className="w-5 h-5" />
                        </motion.button>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                        >
                          Save Changes
                        </motion.div>
                      </div>
                      <div className="group relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setEditingSondage(false)}
                          className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                          disabled={updateSondage.isPending}
                          aria-label="Cancel Editing"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                        >
                          Cancel Editing
                        </motion.div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title</p>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{sondage?.titre}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</p>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{sondage?.description}</p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created Date</p>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(sondage?.createDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(sondage?.status)}`}
                      >
                        {sondage?.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Start Date</p>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(sondage?.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>End Date</p>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(sondage?.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {!editingSondage && (
                  <div className="mt-6 flex space-x-2">
                    <div className="group relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingSondage(true)}
                        className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                        aria-label="Edit Sondage"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                      >
                        Edit Sondage
                      </motion.div>
                    </div>
                    <div className="group relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDelete}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                        aria-label="Delete Sondage"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                      >
                        Delete Sondage
                      </motion.div>
                    </div>
                     <div className="group relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/sondages/${sondageId}/stats`)}
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                        aria-label="View Stats"
                      >
                        <BarChart2 className="w-5 h-5" />
                      </motion.button>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                      >
                        View Stats
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Questions Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <BarChart2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                  <span>Questions</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex space-x-4" aria-label="Tabs">
                    {["view", "manual", "ai"].map((tab) => (
                      <motion.button
                        key={tab}
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${
                          activeTab === tab
                            ? 'border-[color:var(--theme-primary)] text-[color:var(--theme-primary)]'
                            : darkMode
                            ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "view"
                          ? "View Questions"
                          : tab === "manual"
                          ? "Add Manual Question"
                          : "Generate AI Questions"}
                      </motion.button>
                    ))}
                  </nav>
                </div>
                <AnimatePresence mode="wait">
                  {activeTab === "view" && (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {questions && questions.length > 0 ? (
                        <div className="space-y-4">
                          {questions.map((question) => (
                            <motion.div
                              key={question.id}
                              className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:${darkMode ? 'bg-gray-600' : 'bg-gray-100'} transition`}
                              whileHover={{ scale: 1.02 }}
                            >
                              {editingQuestionId === question.id ? (
                                <div className="space-y-4">
                                  <div>
                                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                      Question Content
                                    </label>
                                    <input
                                      type="text"
                                      name="content"
                                      value={editingQuestionData.content}
                                      onChange={handleEditingQuestionChange}
                                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                      autoFocus
                                      placeholder="Enter question text"
                                    />
                                  </div>
                                  <div>
                                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                      Type
                                    </label>
                                    <select
                                      name="type"
                                      value={editingQuestionData.type}
                                      onChange={handleEditingQuestionChange}
                                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                      }`}
                                    >
                                      <option value="TEXT">Text</option>
                                      <option value="SINGLE_CHOICE">Single Choice</option>
                                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                      <option value="RATING">Rating (1-5)</option>
                                      <option value="YES_NO">Yes/No</option>
                                    </select>
                                  </div>
                                  {["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(editingQuestionData.type) && (
                                    <div>
                                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        Choices
                                      </label>
                                      {editingQuestionData.choices.map((choice, cIndex) => (
                                        <div key={cIndex} className="flex items-center space-x-2 mb-2">
                                          <input
                                            type="text"
                                            value={choice}
                                            onChange={(e) => handleEditingChoiceChange(cIndex, e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            placeholder={`Choice ${cIndex + 1}`}
                                          />
                                          <div className="group relative">
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => removeChoiceFromEditingQuestion(cIndex)}
                                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                              aria-label="Remove Choice"
                                            >
                                              <X className="w-5 h-5" />
                                            </motion.button>
                                            <motion.div
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 0, y: 10 }}
                                              whileHover={{ opacity: 1, y: 0 }}
                                              className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                            >
                                              Remove Choice
                                            </motion.div>
                                          </div>
                                        </div>
                                      ))}
                                      <div className="group relative">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={addChoiceToEditingQuestion}
                                          className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)] text-sm"
                                          disabled={editingQuestionData.choices.length >= 8}
                                          aria-label="Add Choice"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </motion.button>
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 0, y: 10 }}
                                          whileHover={{ opacity: 1, y: 0 }}
                                          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                        >
                                          Add Choice
                                        </motion.div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex space-x-2">
                                    <div className="group relative">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={saveEditedQuestion}
                                        className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                                        disabled={
                                          !editingQuestionData.content.trim() ||
                                          (["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(editingQuestionData.type) &&
                                            editingQuestionData.choices.filter((c) => c.trim()).length < 2)
                                        }
                                        aria-label="Save Question"
                                      >
                                        <Check className="w-5 h-5" />
                                      </motion.button>
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 0, y: 10 }}
                                        whileHover={{ opacity: 1, y: 0 }}
                                        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                      >
                                        Save Question
                                      </motion.div>
                                    </div>
                                    <div className="group relative">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={cancelEditingQuestion}
                                        className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                                        aria-label="Cancel Editing"
                                      >
                                        <X className="w-5 h-5" />
                                      </motion.button>
                                      <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 0, y: 10 }}
                                        whileHover={{ opacity: 1, y: 0 }}
                                        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                      >
                                        Cancel Editing
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between items-center">
                                    <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{question.content}</p>
                                    <div className="space-x-2">
                                      <div className="group relative">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => startEditingQuestion(question)}
                                          className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                                          aria-label="Edit Question"
                                        >
                                          <Edit2 className="w-5 h-5" />
                                        </motion.button>
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 0, y: 10 }}
                                          whileHover={{ opacity: 1, y: 0 }}
                                          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                        >
                                          Edit Question
                                        </motion.div>
                                      </div>
                                      <div className="group relative">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleDeleteQuestion(question.id)}
                                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                          aria-label="Delete Question"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </motion.button>
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 0, y: 10 }}
                                          whileHover={{ opacity: 1, y: 0 }}
                                          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                        >
                                          Delete Question
                                        </motion.div>
                                      </div>
                                    </div>
                                  </div>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Type: {question.type}</p>
                                  {["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(question.type) && (
                                    <ul className={`mt-2 list-disc pl-5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {question.choices.map((choice, cIndex) => (
                                        <li key={cIndex}>{choice}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No questions available</p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "manual" && (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Question Content
                          </label>
                          <input
                            type="text"
                            name="content"
                            value={newQuestion.content}
                            onChange={handleQuestionInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder="Enter question text"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Question Type
                          </label>
                          <select
                            name="type"
                            value={newQuestion.type}
                            onChange={handleQuestionInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="TEXT">Text</option>
                            <option value="SINGLE_CHOICE">Single Choice</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="RATING">Rating (1-5)</option>
                            <option value="YES_NO">Yes/No</option>
                          </select>
                        </div>
                        {["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(newQuestion.type) && (
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              Choices (at least 2 required)
                            </label>
                            {newQuestion.choices.map((choice, index) => (
                              <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                  type="text"
                                  value={choice}
                                  onChange={(e) => handleChoiceChange(index, e.target.value)}
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                  placeholder={`Choice ${index + 1}`}
                                />
                                <div className="group relative">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeChoice(index)}
                                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                                    aria-label="Remove Choice"
                                  >
                                    <X className="w-5 h-5" />
                                  </motion.button>
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 0, y: 10 }}
                                    whileHover={{ opacity: 1, y: 0 }}
                                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                  >
                                    Remove Choice
                                  </motion.div>
                                </div>
                              </div>
                            ))}
                            <div className="group relative">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addChoice}
                                className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)] text-sm"
                                disabled={newQuestion.choices.length >= 8}
                                aria-label="Add Choice"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                              >
                                Add Choice
                              </motion.div>
                            </div>
                          </div>
                        )}
                        <div className="group relative">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAddManualQuestion}
                            className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                            disabled={createQuestion.isPending}
                            aria-label="Add Question"
                          >
                            <Plus className="w-5 h-5" />
                          </motion.button>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                          >
                            Add Question
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "ai" && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Topic/Context
                          </label>
                          <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            placeholder="e.g., Customer satisfaction survey for a retail store"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Number of Questions
                          </label>
                          <input
                            type="number"
                            value={aiQuestionCount}
                            onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 1)}
                            min="1"
                            max="20"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div className="group relative">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerateAIQuestions}
                            className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                            disabled={generateAIQuestions.isPending}
                            aria-label="Generate Questions"
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.button>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                          >
                            Generate Questions
                          </motion.div>
                        </div>
                      </div>
                      {generatedQuestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-6"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              AI Generated Questions
                            </h3>
                            <div className="space-x-2">
                              <div className="group relative">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSelectAllQuestions(true)}
                                  className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                                  aria-label="Select All"
                                >
                                  <Check className="w-5 h-5" />
                                </motion.button>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 0, y: 10 }}
                                  whileHover={{ opacity: 1, y: 0 }}
                                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                >
                                  Select All
                                </motion.div>
                              </div>
                              <div className="group relative">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSelectAllQuestions(false)}
                                  className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                                  aria-label="Deselect All"
                                >
                                  <X className="w-5 h-5" />
                                </motion.button>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 0, y: 10 }}
                                  whileHover={{ opacity: 1, y: 0 }}
                                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                >
                                  Deselect All
                                </motion.div>
                              </div>
                              <div className="group relative">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleSaveAIQuestions}
                                  className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                                  disabled={saveGeneratedQuestions.isPending}
                                  aria-label="Save Selected"
                                >
                                  <Check className="w-5 h-5" />
                                </motion.button>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 0, y: 10 }}
                                  whileHover={{ opacity: 1, y: 0 }}
                                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                                >
                                  Save Selected
                                </motion.div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedQuestions.map((question, qIndex) => (
                              <motion.div
                                key={qIndex}
                                className={`border rounded-lg p-4 ${
                                  selectedQuestions.includes(qIndex)
                                    ? 'border-[color:var(--theme-primary)] bg-[color:var(--theme-bg)]'
                                    : darkMode
                                    ? 'bg-gray-700 border-gray-600'
                                    : 'bg-white border-gray-200'
                                }`}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedQuestions.includes(qIndex)}
                                    onChange={() => handleSelectQuestion(qIndex)}
                                    className="h-4 w-4 text-[color:var(--theme-primary)] focus:ring-[color:var(--theme-primary)] border-gray-300 rounded"
                                  />
                                  <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Question {qIndex + 1}
                                  </p>
                                </div>
                                <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>{question.content}</p>
                                <select
                                  value={question.type}
                                  onChange={(e) =>
                                    setGeneratedQuestions((prev) =>
                                      prev.map((q, idx) =>
                                        idx === qIndex
                                          ? {
                                              ...q,
                                              type: e.target.value,
                                              choices: ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(e.target.value)
                                                ? q.choices && q.choices.length >= 2
                                                  ? q.choices
                                                  : ["Choice 1", "Choice 2"]
                                                : [],
                                            }
                                          : q
                                      )
                                    )
                                  }
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                >
                                  <option value="TEXT">Text</option>
                                  <option value="SINGLE_CHOICE">Single Choice</option>
                                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                  <option value="RATING">Rating (1-5)</option>
                                  <option value="YES_NO">Yes/No</option>
                                </select>
                                {["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(question.type) && (
                                  <ul className={`mt-2 list-disc pl-5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {question.choices.map((choice, cIndex) => (
                                      <li key={cIndex}>{choice}</li>
                                    ))}
                                  </ul>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Services Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <BarChart2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                  <span>Assigned Services</span>
                </h2>
              </div>
              <div className="p-6">
                {assignedServices && assignedServices.length > 0 ? (
                  <div className="space-y-2">
                    {assignedServices.map((service) => (
                      <motion.div
                        key={service.id}
                        className={`border rounded-lg ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer"
                          onClick={() =>
                            setExpandedService(expandedService === service.id ? null : service.id)
                          }
                        >
                          <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{service.name}</p>
                          <div className="flex items-center space-x-2">
                            <div className="group relative">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnassignService(service.id);
                                }}
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                disabled={unassignService.isPending}
                                aria-label="Unassign Service"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                              >
                                Unassign Service
                              </motion.div>
                            </div>
                            <div className="group relative">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'} hover:${darkMode ? 'bg-gray-600' : 'bg-gray-200'} transition-colors`}
                                aria-label={expandedService === service.id ? "Collapse Details" : "Expand Details"}
                              >
                                <ChevronDown
                                  className={`h-6 w-6 transition-transform ${expandedService === service.id ? "rotate-180" : ""}`}
                                />
                              </motion.button>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                              >
                                {expandedService === service.id ? "Collapse Details" : "Expand Details"}
                              </motion.div>
                            </div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedService === service.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4`}
                            >
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{service.description}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No services assigned</p>
                )}

                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mt-6 mb-4`}>Assign New Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select a service</option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="group relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAssignService}
                      className="bg-[color:var(--theme-primary)] text-white p-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50 w-full h-full"
                      disabled={!selectedServiceId || assignService.isPending}
                      aria-label="Assign Service"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                    >
                      Assign Service
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                Confirm Deletion
              </h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Are you sure you want to delete this {deleteTarget?.type}?
              </p>
              <div className="flex justify-end space-x-2">
                <div className="group relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                    aria-label="Cancel Deletion"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                  >
                    Cancel Deletion
                  </motion.div>
                </div>
                <div className="group relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmDelete}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    aria-label="Confirm Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 hidden group-hover:block bg-[color:var(--theme-primary)] text-white text-xs rounded py-1 px-2 z-10`}
                  >
                    Confirm Delete
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SondageDetail;