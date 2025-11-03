import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateSondage } from '../../../services/hooks';
import { useCreateQuestion, useGenerateAIQuestions, useSaveGeneratedQuestions } from '../../../services/questions';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, BarChart2, Edit2, Trash2, Check, X } from 'lucide-react';

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

const CreateSondage = () => {
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const createSondage = useCreateSondage();
  const createQuestion = useCreateQuestion();
  const generateAIQuestions = useGenerateAIQuestions();
  const saveGeneratedQuestions = useSaveGeneratedQuestions();

  // Form state for sondage
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  // State for manual questions
  const [manualQuestions, setManualQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    type: 'TEXT',
    choices: ['', '', '', ''], // Default 4 choices for SINGLE_CHOICE/MULTIPLE_CHOICE
  });

  // State for AI questions
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // State for AI question editing
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editingChoiceIndex, setEditingChoiceIndex] = useState(null);
  const [editingChoiceText, setEditingChoiceText] = useState('');

  // State for active tab
  const [activeTab, setActiveTab] = useState('manual');

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = darkMode ? themeColors[theme]?.borderDark : themeColors[theme]?.borderLight;

  // Handle sondage form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle new question input changes
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle choice input changes for manual questions
  const handleChoiceChange = (index, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) => (i === index ? value : choice)),
    }));
  };

  // Add a manual question to the list
  const handleAddManualQuestion = () => {
    if (!newQuestion.content.trim()) {
      toast.error('Question content is required');
      return;
    }
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(newQuestion.type)) {
      const validChoices = newQuestion.choices.filter((choice) => choice.trim());
      if (validChoices.length < 2) {
        toast.error('At least 2 choices are required for SINGLE_CHOICE or MULTIPLE_CHOICE');
        return;
      }
    }
    setManualQuestions((prev) => [
      ...prev,
      {
        ...newQuestion,
        choices: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(newQuestion.type)
          ? newQuestion.choices.filter((choice) => choice.trim())
          : [],
      },
    ]);
    setNewQuestion({
      content: '',
      type: 'TEXT',
      choices: ['', '', '', ''],
    });
  };

  // Remove a manual question from the list
  const handleRemoveManualQuestion = (index) => {
    setManualQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle AI question generation
  const handleGenerateAIQuestions = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('Prompt is required');
      return;
    }
    if (aiQuestionCount < 1) {
      toast.error('Number of questions must be at least 1');
      return;
    }
    try {
      const questions = await generateAIQuestions.mutateAsync({
        prompt: aiPrompt,
        count: aiQuestionCount,
      });
      setGeneratedQuestions(questions);
      setSelectedQuestions(questions.map((_, index) => index)); // Select all by default
      toast.success(`Generated ${questions.length} questions successfully!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(`Failed to generate questions: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle question selection
  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Select or deselect all questions
  const handleSelectAllQuestions = (selectAll) => {
    if (selectAll) {
      setSelectedQuestions(generatedQuestions.map((_, index) => index));
    } else {
      setSelectedQuestions([]);
    }
  };

  // Start editing AI generated question
  const startEditingQuestion = (questionIndex) => {
    setEditingQuestionIndex(questionIndex);
    setEditingChoiceIndex(null);
  };

  // Cancel editing AI generated question
  const cancelEditingQuestion = () => {
    setEditingQuestionIndex(null);
    setEditingChoiceIndex(null);
    setEditingChoiceText('');
  };

  // Save edited AI generated question
  const saveEditedQuestion = (questionIndex, newContent) => {
    if (!newContent.trim()) {
      toast.error('Question content cannot be empty');
      return;
    }
    setGeneratedQuestions((prev) =>
      prev.map((q, idx) =>
        idx === questionIndex ? { ...q, content: newContent } : q
      )
    );
    setEditingQuestionIndex(null);
  };

  // Start editing choice for AI generated question
  const startEditingChoice = (questionIndex, choiceIndex, choiceText) => {
    setEditingQuestionIndex(questionIndex);
    setEditingChoiceIndex(choiceIndex);
    setEditingChoiceText(choiceText);
  };

  // Handle choice text change during editing
  const handleEditingChoiceChange = (e) => {
    setEditingChoiceText(e.target.value);
  };

  // Save edited choice
  const saveEditedChoice = (questionIndex, choiceIndex) => {
    if (!editingChoiceText.trim()) {
      toast.error('Choice cannot be empty');
      return;
    }
    setGeneratedQuestions((prev) =>
      prev.map((q, qIdx) =>
        qIdx === questionIndex
          ? {
              ...q,
              choices: q.choices.map((choice, cIdx) =>
                cIdx === choiceIndex ? editingChoiceText : choice
              ),
            }
          : q
      )
    );
    setEditingChoiceIndex(null);
    setEditingChoiceText('');
  };

  // Add a new choice to an AI generated question
  const addChoiceToQuestion = (questionIndex) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, qIdx) =>
        qIdx === questionIndex
          ? { ...q, choices: [...(q.choices || []), 'New Choice'] }
          : q
      )
    );
  };

  // Remove a choice from an AI generated question
  const removeChoiceFromQuestion = (questionIndex, choiceIndex) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, qIdx) =>
        qIdx === questionIndex
          ? {
              ...q,
              choices: q.choices.filter((_, cIdx) => cIdx !== choiceIndex),
            }
          : q
      )
    );
  };

  // Change question type
  const changeQuestionType = (questionIndex, newType) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, qIdx) =>
        qIdx === questionIndex
          ? {
              ...q,
              type: newType,
              choices: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(newType)
                ? (q.choices && q.choices.length >= 2
                    ? q.choices
                    : ['Choice 1', 'Choice 2'])
                : [],
            }
          : q
      )
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim() || !formData.description.trim() || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all sondage fields');
      return;
    }

    try {
      // Create sondage
      const newSondage = await createSondage.mutateAsync(formData);
      const sondageId = newSondage.id;
      console.log('Created sondage with ID:', sondageId);

      // Add manual questions
      const manualQuestionsPromises = manualQuestions.map((question) =>
        createQuestion.mutateAsync({
          sondageId,
          questionData: {
            content: question.content,
            type: question.type,
            choices: question.choices,
          },
        })
      );

      // Add selected AI generated questions
      const selectedAIQuestions = generatedQuestions.filter((_, index) =>
        selectedQuestions.includes(index)
      );

      let aiQuestionsPromise = Promise.resolve();
      if (selectedAIQuestions.length > 0) {
        console.log('Saving AI questions for sondageId:', sondageId, 'Questions:', selectedAIQuestions);
        aiQuestionsPromise = saveGeneratedQuestions.mutateAsync({
          sondageId,
          questions: selectedAIQuestions,
        });
      }

      // Wait for all questions to be created
      await Promise.all([...manualQuestionsPromises, aiQuestionsPromise]);

      toast.success('Sondage created successfully with all questions!');
      navigate(`/sondages/${sondageId}`);
    } catch (error) {
      console.error('Error creating sondage:', error);
      toast.error(`Failed to create sondage: ${error.message || 'Unknown error'}`);
    }
  };

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
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <BarChart2 className={`w-8 h-8 ${darkMode ? 'text-gray-200' : 'text-[color:var(--theme-primary)]'}`} />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                Create New Sondage
              </h1>
            </div>
            <button
              onClick={() => navigate('/sondages')}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to List</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div
              className={`shadow-lg rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-6 bg-[color:var(--theme-bg)] border-b border-[color:var(--theme-border)]`}>
                <h2 className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <BarChart2 className="w-5 h-5 text-[color:var(--theme-primary)]" />
                  <span>Sondage Details</span>
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Sondage Information Section */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Sondage Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Title
                        </label>
                        <input
                          type="text"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          name="titre"
                          value={formData.titre}
                          onChange={handleInputChange}
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
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
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
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          End Date
                        </label>
                        <input
                          type="date"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Add Questions</h3>
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="flex space-x-4" aria-label="Tabs">
                        <button
                          className={`px-4 py-2 text-sm font-medium border-b-2 ${
                            activeTab === 'manual'
                              ? 'border-[color:var(--theme-primary)] text-[color:var(--theme-primary)]'
                              : darkMode
                              ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('manual')}
                        >
                          Manual Questions
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium border-b-2 ${
                            activeTab === 'ai'
                              ? 'border-[color:var(--theme-primary)] text-[color:var(--theme-primary)]'
                              : darkMode
                              ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('ai')}
                        >
                          AI Generated Questions
                        </button>
                      </nav>
                    </div>
                    <div className="p-4">
                      {/* Manual Questions Tab */}
                      {activeTab === 'manual' && (
                        <div>
                          <div
                            className={`shadow-sm rounded-lg p-4 mb-4 ${
                              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="mb-4">
                              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Question Content
                              </label>
                              <input
                                type="text"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                name="content"
                                value={newQuestion.content}
                                onChange={handleQuestionChange}
                                placeholder="Enter question text"
                              />
                            </div>
                            <div className="mb-4">
                              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Question Type
                              </label>
                              <select
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                name="type"
                                value={newQuestion.type}
                                onChange={handleQuestionChange}
                              >
                                <option value="TEXT">Text</option>
                                <option value="SINGLE_CHOICE">Single Choice</option>
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="RATING">Rating (1-5)</option>
                                <option value="YES_NO">Yes/No</option>
                              </select>
                            </div>
                            {['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(newQuestion.type) && (
                              <div className="mb-4">
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                  Choices (at least 2 required)
                                </label>
                                {newQuestion.choices.map((choice, index) => (
                                  <input
                                    key={index}
                                    type="text"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all mb-2 ${
                                      darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                    placeholder={`Choice ${index + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                            <button
                              type="button"
                              className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                              onClick={handleAddManualQuestion}
                            >
                              <Plus className="w-5 h-5" />
                              <span>Add Question</span>
                            </button>
                          </div>
                          {manualQuestions.length > 0 && (
                            <div className="mt-4">
                              <h4 className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Added Manual Questions</h4>
                              <div className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                {manualQuestions.map((q, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center p-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                                  >
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {q.content}
                                      </p>
                                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{q.type}</p>
                                      {q.choices.length > 0 && (
                                        <ul className="text-xs list-disc pl-4 mt-1">
                                          {q.choices.map((choice, i) => (
                                            <li key={i} className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{choice}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                    <button
                                      className="text-red-500 hover:text-red-700 transition-colors"
                                      onClick={() => handleRemoveManualQuestion(index)}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {/* AI Questions Tab */}
                      {activeTab === 'ai' && (
                        <div>
                          <div
                            className={`shadow-sm rounded-lg p-4 mb-4 ${
                              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="mb-4">
                              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Topic/Context
                              </label>
                              <input
                                type="text"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="e.g., Customer satisfaction survey for a retail store"
                              />
                            </div>
                            <div className="mb-4">
                              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Number of Questions
                              </label>
                              <input
                                type="number"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all ${
                                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                                value={aiQuestionCount}
                                onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 1)}
                                min="1"
                                max="20"
                              />
                            </div>
                            <button
                              type="button"
                              className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                              onClick={handleGenerateAIQuestions}
                              disabled={generateAIQuestions.isPending}
                            >
                              {generateAIQuestions.isPending ? 'Generating...' : 'Generate Questions'}
                            </button>
                          </div>
                          {generatedQuestions.length > 0 && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className={`text-md font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                  AI Generated Questions
                                </h4>
                                <div className="space-x-2">
                                  <button
                                    type="button"
                                    className="text-sm bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                                    onClick={() => handleSelectAllQuestions(true)}
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    className="text-sm bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors"
                                    onClick={() => handleSelectAllQuestions(false)}
                                  >
                                    Deselect All
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {generatedQuestions.map((question, qIndex) => (
                                  <div
                                    key={qIndex}
                                    className={`shadow-sm rounded-lg overflow-hidden ${
                                      selectedQuestions.includes(qIndex)
                                        ? 'border-2 border-[color:var(--theme-primary)]'
                                        : darkMode
                                        ? 'bg-gray-700 border-gray-600'
                                        : 'bg-white border-gray-200'
                                    }`}
                                  >
                                    <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} flex justify-between items-center`}>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 text-[color:var(--theme-primary)] focus:ring-[color:var(--theme-primary)] border-gray-300 rounded"
                                          checked={selectedQuestions.includes(qIndex)}
                                          onChange={() => handleSelectQuestion(qIndex)}
                                          id={`question-${qIndex}`}
                                        />
                                        <label htmlFor={`question-${qIndex}`} className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                          Question {qIndex + 1}
                                        </label>
                                      </div>
                                      <select
                                        className={`text-sm px-2 py-1 border rounded focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        value={question.type}
                                        onChange={(e) => changeQuestionType(qIndex, e.target.value)}
                                      >
                                        <option value="TEXT">Text</option>
                                        <option value="SINGLE_CHOICE">Single Choice</option>
                                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                        <option value="RATING">Rating (1-5)</option>
                                        <option value="YES_NO">Yes/No</option>
                                      </select>
                                    </div>
                                    <div className="p-4">
                                      <div className="mb-3">
                                        <h5 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Question</h5>
                                        {editingQuestionIndex === qIndex && editingChoiceIndex === null ? (
                                          <div className="flex items-center space-x-2">
                                            <input
                                              type="text"
                                              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${
                                                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                              }`}
                                              value={question.content}
                                              onChange={(e) =>
                                                setGeneratedQuestions((prev) =>
                                                  prev.map((q, idx) =>
                                                    idx === qIndex ? { ...q, content: e.target.value } : q
                                                  )
                                                )
                                              }
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' && question.content.trim()) {
                                                  saveEditedQuestion(qIndex, question.content);
                                                } else if (e.key === 'Escape') {
                                                  cancelEditingQuestion();
                                                }
                                              }}
                                            />
                                            <button
                                              className="text-green-500 hover:text-green-700"
                                              onClick={() => saveEditedQuestion(qIndex, question.content)}
                                              disabled={!question.content.trim()}
                                            >
                                              <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                              className="text-red-500 hover:text-red-700"
                                              onClick={cancelEditingQuestion}
                                            >
                                              <X className="w-5 h-5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex justify-between items-center">
                                            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{question.content}</p>
                                            <button
                                              className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)]"
                                              onClick={() => startEditingQuestion(qIndex)}
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      {['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.type) && (
                                        <div>
                                          <div className="flex justify-between items-center mb-2">
                                            <h5 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Choices</h5>
                                            <button
                                              className="text-sm text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)]"
                                              onClick={() => addChoiceToQuestion(qIndex)}
                                              disabled={question.choices && question.choices.length >= 8}
                                            >
                                              + Add Choice
                                            </button>
                                          </div>
                                          <ul className="space-y-2">
                                            {question.choices &&
                                              question.choices.map((choice, cIndex) => (
                                                <li key={cIndex} className="flex items-center justify-between">
                                                  {editingQuestionIndex === qIndex && editingChoiceIndex === cIndex ? (
                                                    <div className="flex items-center space-x-2 w-full">
                                                      <input
                                                        type="text"
                                                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] ${
                                                          darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                                                        }`}
                                                        value={editingChoiceText}
                                                        onChange={handleEditingChoiceChange}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                          if (e.key === 'Enter' && editingChoiceText.trim()) {
                                                            saveEditedChoice(qIndex, cIndex);
                                                          } else if (e.key === 'Escape') {
                                                            cancelEditingQuestion();
                                                          }
                                                        }}
                                                      />
                                                      <button
                                                        className="text-green-500 hover:text-green-700"
                                                        onClick={() => saveEditedChoice(qIndex, cIndex)}
                                                        disabled={!editingChoiceText.trim()}
                                                      >
                                                        <Check className="w-5 h-5" />
                                                      </button>
                                                      <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={cancelEditingQuestion}
                                                      >
                                                        <X className="w-5 h-5" />
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <>
                                                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                        {cIndex + 1}. {choice}
                                                      </span>
                                                      <div className="space-x-2">
                                                        <button
                                                          className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)]"
                                                          onClick={() => startEditingChoice(qIndex, cIndex, choice)}
                                                        >
                                                          <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        {question.choices.length > 2 && (
                                                          <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => removeChoiceFromQuestion(qIndex, cIndex)}
                                                          >
                                                            <Trash2 className="w-4 h-4" />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </>
                                                  )}
                                                </li>
                                              ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-[color:var(--theme-primary)] text-white px-6 py-3 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50"
                      disabled={createSondage.isPending || createQuestion.isPending || saveGeneratedQuestions.isPending}
                    >
                      <Plus className="w-5 h-5" />
                      <span>{createSondage.isPending || createQuestion.isPending || saveGeneratedQuestions.isPending ? 'Creating...' : 'Create Sondage'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSondage;