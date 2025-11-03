import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuestionsBySondageId } from '../../../services/questions';
import { useSubmitResponse, useUpdateResponse, useDeleteResponse, useUserResponsesForSondage } from '../../../services/useResponseMutations';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import './sondage-response.css';

const SondageResponseForm = () => {
  const { id: sondageId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  
  // Fetch questions
  const { data: questions, isLoading, error } = useQuestionsBySondageId(sondageId);
  
  // Fetch existing responses
  const { data: responses, isLoading: responsesLoading } = useUserResponsesForSondage(sondageId, user?.id);
  
  // Response mutations
  const submitResponse = useSubmitResponse();
  const updateResponse = useUpdateResponse();
  const deleteResponse = useDeleteResponse();
  
  // Local state for answers
  const [answers, setAnswers] = useState({});
  
  // Initialize answers from existing responses
  React.useEffect(() => {
    if (responses) {
      const initialAnswers = {};
      Object.entries(responses).forEach(([questionId, response]) => {
        initialAnswers[questionId] = response.answer;
      });
      setAnswers(initialAnswers);
    }
  }, [responses]);
  
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  
  const handleSubmit = async (questionId) => {
    if (!answers[questionId]) {
      toast.error('Please provide an answer');
      return;
    }
    
    const submission = {
      questionId: parseInt(questionId),
      answer: answers[questionId],
      sondageId: parseInt(sondageId),
    };
    
    try {
      const existingResponse = responses && Object.entries(responses).find(
        ([qId]) => parseInt(qId) === parseInt(questionId)
      )?.[1];
      
      if (existingResponse) {
        // Update existing response
        await updateResponse.mutateAsync({
          responseId: existingResponse.id,
          submission,
        });
      } else {
        // Submit new response
        await submitResponse.mutateAsync(submission);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };
  
  const handleDelete = async (responseId) => {
    try {
      await deleteResponse.mutateAsync({ responseId });
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        const questionId = Object.keys(responses).find(
          (qId) => responses[qId].id === responseId
        );
        if (questionId) delete newAnswers[questionId];
        return newAnswers;
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };
  
  if (isLoading || responsesLoading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }
  
  if (!questions || questions.length === 0) {
    return <div className="no-questions">No questions available for this sondage.</div>;
  }
  
  return (
    <div className="sondage-response-container"style={{ marginRight: "50px", marginLeft: "50px"}}>
      <motion.h2
        className="sondage-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Sondage #{sondageId}
      </motion.h2>
      
      {questions.map((question) => {
        const questionId = question.id;
        const existingResponse = responses && Object.entries(responses).find(
          ([qId]) => parseInt(qId) === questionId
        )?.[1];
        
        return (
          <motion.div
            key={questionId}
            className="question-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="question-text">{question.text}</h3>
            
            {question.type === 'MULTIPLE_CHOICE' ? (
              <div className="options">
                {question.options.map((option, index) => (
                  <label key={index} className="option-label">
                    <input
                      type="radio"
                      name={`question-${questionId}`}
                      value={option}
                      checked={answers[questionId] === option}
                      onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                      disabled={submitResponse.isLoading || updateResponse.isLoading}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="text-answer"
                value={answers[questionId] || ''}
                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                placeholder="Type your answer here..."
                disabled={submitResponse.isLoading || updateResponse.isLoading}
              />
            )}
            
            <div className="action-buttons">
              <button
                className="submit-btn"
                onClick={() => handleSubmit(questionId)}
                disabled={submitResponse.isLoading || updateResponse.isLoading}
              >
                {existingResponse ? 'Update Answer' : 'Submit Answer'}
              </button>
              {existingResponse && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(existingResponse.id)}
                  disabled={deleteResponse.isLoading}
                >
                  Delete Answer
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SondageResponseForm;