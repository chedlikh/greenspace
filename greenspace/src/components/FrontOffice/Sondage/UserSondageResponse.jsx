import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSondageById } from '../../../services/hooks';
import { useQuestionsBySondageId } from '../../../services/questions';
import { useSubmitResponse, useUpdateResponse, useUserResponsesForSondage } from '../../../services/useResponseMutations';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Edit, AlertCircle, Save, Trash2, Loader2, Star } from 'lucide-react';

const UserSondageResponse = () => {
  const { id: sondageId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Fetch sondage details
  const { data: sondage, isLoading: sondageLoading, error: sondageError } = useSondageById(sondageId);

  // Fetch questions
  const { data: questions = [], isLoading: questionsLoading, error: questionsError } = useQuestionsBySondageId(sondageId);

  // Fetch existing responses
  const { data: responses = {}, isLoading: responsesLoading, refetch: refetchResponses } = useUserResponsesForSondage(sondageId, user?.id);

  // Response mutations
  const submitResponse = useSubmitResponse();
  const updateResponse = useUpdateResponse();

  // Local state for answers and editing
  const [answers, setAnswers] = useState({});
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Initialize answers from existing responses
  const initializeAnswers = useCallback(() => {
    if (responses && Object.keys(responses).length > 0 && questions.length > 0) {
      const initialAnswers = {};
      Object.entries(responses).forEach(([questionKey, response]) => {
        const questionId = response.questionId;
        const question = questions.find((q) => q.id === parseInt(questionId));
        if (question) {
          switch (question.type) {
            case 'TEXT':
              initialAnswers[questionId] = response.answerText || '';
              break;
            case 'RATING':
              initialAnswers[questionId] = response.ratingValue?.toString() || '';
              break;
            case 'YES_NO':
              initialAnswers[questionId] = response.yesNoAnswer ? 'Yes' : 'No';
              break;
            case 'SINGLE_CHOICE':
              initialAnswers[questionId] = response.selectedChoices || '';
              break;
            case 'MULTIPLE_CHOICE':
              initialAnswers[questionId] = response.selectedChoices ? response.selectedChoices.split(', ') : [];
              break;
          }
        }
      });
      setAnswers(initialAnswers);
      calculateCompletionPercentage(initialAnswers);
    }
  }, [responses, questions]);

  useEffect(() => {
    initializeAnswers();
  }, [initializeAnswers]);

  const calculateCompletionPercentage = (currentAnswers) => {
    if (!questions.length) return 0;
    const answeredQuestions = questions.filter(q => 
      currentAnswers[q.id] && 
      (typeof currentAnswers[q.id] === 'string' ? 
        currentAnswers[q.id].trim() !== '' : 
        currentAnswers[q.id].length > 0)
    ).length;
    setCompletionPercentage(Math.floor((answeredQuestions / questions.length) * 100));
  };

  const handleAnswerChange = useCallback((questionId, value, type) => {
    setAnswers((prev) => {
      let newAnswers;
      if (type === 'MULTIPLE_CHOICE') {
        const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        if (current.includes(value)) {
          newAnswers = { ...prev, [questionId]: current.filter((item) => item !== value) };
        } else {
          newAnswers = { ...prev, [questionId]: [...current, value] };
        }
      } else {
        const trimmedValue = value && typeof value === 'string' ? value : '';
        newAnswers = { ...prev, [questionId]: trimmedValue };
      }
      calculateCompletionPercentage(newAnswers);
      return newAnswers;
    });
  }, []);

  const validateAnswer = useCallback((question, answer) => {
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      return `Please provide an answer for: ${question.content}`;
    }
    if (question.type === 'TEXT' && (!answer || answer.trim() === '')) {
      return `Please provide a text answer for: ${question.content}`;
    }
    if (question.type === 'RATING' && !['1', '2', '3', '4', '5'].includes(answer)) {
      return `Please select a rating from 1 to 5 for: ${question.content}`;
    }
    if (question.type === 'YES_NO' && !['Yes', 'No'].includes(answer)) {
      return `Please select Yes or No for: ${question.content}`;
    }
    if (question.type === 'SINGLE_CHOICE' && (!answer || !question.choices.includes(answer))) {
      return `Please select a valid option for: ${question.content}`;
    }
    if (question.type === 'MULTIPLE_CHOICE' && (!Array.isArray(answer) || answer.some((choice) => !question.choices.includes(choice)))) {
      return `Please select valid options for: ${question.content}`;
    }
    return null;
  }, []);

  const handleSubmitAll = async () => {
    if (!questions.length) {
      toast.error('No questions available to submit.', { position: 'top-right' });
      return;
    }

    const errors = [];
    questions.forEach((question) => {
      const answer = answers[question.id];
      const error = validateAnswer(question, answer);
      if (error) errors.push(error);
    });

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error, { position: 'top-right' }));
      return;
    }

    setIsSubmitting(true);
    try {
      for (const question of questions) {
        const questionId = question.id;
        const answer = answers[questionId];
        const submission = { 
          questionId: parseInt(questionId),
          sondageId: parseInt(sondageId),
          userId: user?.id
        };

        switch (question.type) {
          case 'TEXT':
            submission.answerText = answer;
            break;
          case 'RATING':
            submission.ratingValue = parseInt(answer);
            break;
          case 'YES_NO':
            submission.yesNoAnswer = answer === 'Yes';
            break;
          case 'SINGLE_CHOICE':
            submission.selectedChoices = answer;
            break;
          case 'MULTIPLE_CHOICE':
            submission.selectedChoices = answer.join(', ');
            break;
        }

        const existingResponse = Object.entries(responses).find(
          ([_, res]) => parseInt(res.questionId) === parseInt(questionId)
        )?.[1];

        if (existingResponse) {
          await updateResponse.mutateAsync({
            responseId: existingResponse.id,
            submission,
          });
        } else {
          await submitResponse.mutateAsync(submission);
        }
      }
      toast.success('All responses submitted successfully!', { position: 'top-right' });
      await refetchResponses();
    } catch (error) {
      toast.error(`Submission error: ${error.message}`, { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAnswer = async (question) => {
    const questionId = question.id;
    const answer = answers[questionId];
    const error = validateAnswer(question, answer);
    if (error) {
      toast.error(error, { position: 'top-right' });
      return;
    }

    try {
      const existingResponse = Object.entries(responses).find(
        ([_, res]) => parseInt(res.questionId) === parseInt(questionId)
      )?.[1];

      if (!existingResponse) {
        toast.error('No existing response to update.', { position: 'top-right' });
        return;
      }

      const submission = { 
        questionId: parseInt(questionId),
        sondageId: parseInt(sondageId),
        userId: user?.id
      };
      switch (question.type) {
        case 'TEXT':
          submission.answerText = answer;
          break;
        case 'RATING':
          submission.ratingValue = parseInt(answer);
          break;
        case 'YES_NO':
          submission.yesNoAnswer = answer === 'Yes';
          break;
        case 'SINGLE_CHOICE':
          submission.selectedChoices = answer;
          break;
        case 'MULTIPLE_CHOICE':
          submission.selectedChoices = answer.join(', ');
          break;
      }

      await updateResponse.mutateAsync({
        responseId: existingResponse.id,
        submission,
      });
      toast.success('Response updated successfully!', { position: 'top-right' });
      setEditingQuestionId(null);
      await refetchResponses();
    } catch (error) {
      toast.error(`Update error: ${error.message}`, { position: 'top-right' });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all answers?')) {
      setAnswers({});
      setEditingQuestionId(null);
      setCompletionPercentage(0);
      toast.info('All answers cleared', { position: 'top-right' });
    }
  };

  const navigateToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setActiveQuestionIndex(index);
    }
  };

  const renderStarRating = (questionId, currentRating) => {
    return (
      <div className="flex items-center space-x-4" >
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAnswerChange(questionId, value.toString(), 'RATING')}
            className={`flex flex-col items-center focus:outline-none ${parseInt(currentRating) >= value ? 'text-yellow-500' : 'text-gray-300'}`}
            aria-label={`Rate ${value} stars`}
          >
            <Star size={32} fill={parseInt(currentRating) >= value ? "currentColor" : "none"} />
            <span className="text-xs mt-1">{value}</span>
          </motion.button>
        ))}
      </div>
    );
  };

  // Check sondage status and user eligibility
  if (!sondageLoading && sondage) {
    // Check sondage status
    if (sondage.status === 'FINISHED') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Survey Finished</h2>
            <p className="text-gray-600 mb-6">This survey has finished.</p>
            <button 
              onClick={() => navigate('/home')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    if (sondage.status === 'WILL_START_SOON') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Survey Not Started</h2>
            <p className="text-gray-600 mb-6">This survey has not started yet.</p>
            <button 
              onClick={() => navigate('/home')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    // Check user eligibility (assuming sondage.services and user.serviceId exist)
    if (sondage.services && user?.serviceId && !sondage.services.includes(user.serviceId)) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You are not allowed to participate in this survey.</p>
            <button 
              onClick={() => navigate('/home')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    // Placeholder for eligibility API call (if sondage.services is not available)
    /*
    const checkEligibility = async () => {
      try {
        const response = await fetch(`http://localhost:8089/api/sondages/${sondageId}/eligibility/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error('Not eligible');
        return true;
      } catch {
        return false;
      }
    };
    if (!sondageLoading && !checkEligibility()) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You are not allowed to participate in this survey.</p>
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }
    */
  }

  if (sondageLoading || questionsLoading || responsesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <h2 className="text-xl font-medium text-blue-800">Loading your survey...</h2>
        </div>
      </div>
    );
  }

  if (sondageError || questionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-700">
            {sondageError?.message || questionsError?.message || 'Unable to load sondage or questions'}
          </p>
          <button 
            onClick={() => navigate('/home')}
            className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-6">No questions are available for this survey.</p>
          <button 
            onClick={() => navigate('/home')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={18} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion = questions[activeQuestionIndex];
  const questionId = activeQuestion.id;
  const answer = answers[questionId];
  const hasResponse = !!Object.entries(responses).find(
    ([_, res]) => parseInt(res.questionId) === parseInt(questionId)
  );
  const isEditing = editingQuestionId === questionId;

  return (
    <div className="main-content bg-gray-50 min-h-screen">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto"style={{ paddingTop: "100px",}}>
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <button
                  onClick={() => navigate('/home')}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Back to notifications"
                >
                  <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <motion.h2
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-600"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {sondage?.titre || `Survey #${sondageId}`}
                </motion.h2>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 font-medium">{completionPercentage}% Complete</span>
                  <div className="flex-1 md:w-32 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Question Navigation */}
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-2">
                Question {activeQuestionIndex + 1} of {questions.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, index) => {
                  const q = questions[index];
                  const isAnswered = answers[q.id] && 
                    (typeof answers[q.id] === 'string' ? 
                      answers[q.id].trim() !== '' : 
                      answers[q.id].length > 0);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${activeQuestionIndex === index ? 
                          'bg-blue-600 text-white shadow-md scale-110' : 
                          isAnswered ? 
                            'bg-green-100 text-green-800 border-2 border-green-500' : 
                            'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      aria-label={`Go to question ${index + 1}`}
                    >
                      {isAnswered ? <CheckCircle size={16} /> : index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                  {activeQuestion.type.replace(/_/g, ' ')}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeQuestion.content}
                </h3>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              </div>

              {(isEditing || !hasResponse) ? (
                <>
                  {activeQuestion.type === 'TEXT' && (
                    <div className="mb-4">
                      <textarea
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                        value={answer || ''}
                        onChange={(e) => handleAnswerChange(questionId, e.target.value, activeQuestion.type)}
                        placeholder="Type your answer here..."
                        rows={6}
                        aria-label={`Answer for ${activeQuestion.content}`}
                      />
                    </div>
                  )}

                  {activeQuestion.type === 'RATING' && (
                    <div className="mb-4">
                      {renderStarRating(questionId, answer)}
                    </div>
                  )}

                  {activeQuestion.type === 'YES_NO' && (
                    <div className="flex space-x-4 mb-4">
                      {['Yes', 'No'].map((option) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswerChange(questionId, option, activeQuestion.type)}
                          className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                            answer === option 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {activeQuestion.type === 'MULTIPLE_CHOICE' && activeQuestion.choices && Array.isArray(activeQuestion.choices) && (
                    <div className="space-y-3 mb-4">
                      {activeQuestion.choices.map((choice, idx) => (
                        <motion.label
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                            Array.isArray(answer) && answer.includes(choice)
                              ? 'bg-blue-50 border-2 border-blue-500' 
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={choice}
                            checked={Array.isArray(answer) && answer.includes(choice)}
                            onChange={(e) => handleAnswerChange(questionId, e.target.value, activeQuestion.type)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <span className={`ml-3 ${
                            Array.isArray(answer) && answer.includes(choice) 
                              ? 'font-medium text-blue-800' 
                              : 'text-gray-700'
                          }`}>
                            {choice}
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  )}

                  {activeQuestion.type === 'SINGLE_CHOICE' && activeQuestion.choices && Array.isArray(activeQuestion.choices) && (
                    <div className="space-y-3 mb-4">
                      {activeQuestion.choices.map((choice, idx) => (
                        <motion.label
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                            answer === choice
                              ? 'bg-blue-50 border-2 border-blue-500' 
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionId}`}
                            value={choice}
                            checked={answer === choice}
                            onChange={(e) => handleAnswerChange(questionId, e.target.value, activeQuestion.type)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`ml-3 ${
                            answer === choice 
                              ? 'font-medium text-blue-800' 
                              : 'text-gray-700'
                          }`}>
                            {choice}
                          </span>
                        </motion.label>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <h4 className="font-semibold text-blue-800">Your Response</h4>
                  </div>
                  
                  {activeQuestion.type === 'TEXT' && (
                    <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{answer}</p>
                  )}
                  
                  {activeQuestion.type === 'RATING' && (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <Star 
                          key={val} 
                          size={20} 
                          className="text-yellow-500"
                          fill={parseInt(answer) >= val ? "currentColor" : "none"}
                        />
                      ))}
                      <span className="ml-2 text-gray-700">({answer}/5)</span>
                    </div>
                  )}
                  
                  {activeQuestion.type === 'YES_NO' && (
                    <span className={`inline-block px-4 py-2 rounded-lg font-medium ${
                      answer === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {answer}
                    </span>
                  )}
                  
                  {activeQuestion.type === 'SINGLE_CHOICE' && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-800">{answer}</span>
                    </div>
                  )}
                  
                  {activeQuestion.type === 'MULTIPLE_CHOICE' && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <ul className="space-y-1">
                        {Array.isArray(answer) && answer.map((choice, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-gray-700">{choice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {hasResponse && !isEditing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditingQuestionId(questionId)}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Edit size={18} />
                  <span>Edit Response</span>
                </motion.button>
              )}

              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleUpdateAnswer(activeQuestion)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={updateResponse.isLoading}
                >
                  {updateResponse.isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Update Response</span>
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation and Submit Controls */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToQuestion(activeQuestionIndex - 1)}
                disabled={activeQuestionIndex === 0}
                className={`px-5 py-3 rounded-xl flex items-center space-x-2 ${
                  activeQuestionIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <ArrowLeft size={18} />
                <span>Previous</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateToQuestion(activeQuestionIndex + 1)}
                disabled={activeQuestionIndex === questions.length - 1}
                className={`px-5 py-3 rounded-xl flex items-center space-x-2 ${
                  activeQuestionIndex === questions.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <span>Next</span>
                <ArrowLeft size={18} className="rotate-180" />
              </motion.button>
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClearAll}
                className="px-5 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 shadow-md flex items-center space-x-2"
                aria-label="Clear all answers"
              >
                <Trash2 size={18} />
                <span>Clear All</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitAll}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 transition-all flex items-center space-x-2"
                disabled={isSubmitting}
                aria-label="Submit all responses"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Submit All Responses</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSondageResponse;