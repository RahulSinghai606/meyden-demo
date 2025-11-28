'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { SurveyQuestion } from '@/data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Shield, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Download,
  RotateCcw,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import jsPDF from 'jspdf';

interface AIReadinessPageProps {
  onNavigate: (page: string) => void;
}

interface Answer {
  questionId: string;
  answer: number; // 0-3 scale
}

export default function AIReadinessPage({ onNavigate }: AIReadinessPageProps) {
  const { t, isRTL } = useLanguage();
  const { tokens, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<'intro' | 'survey' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [results, setResults] = useState<{[key: string]: number} | null>(null);
  
  // API integration state
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [surveyId, setSurveyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load survey questions from API
  const loadSurveyQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all surveys using the API service
      const surveysResponse = await apiService.getSurveys({ limit: 10 });
      
      if (surveysResponse.error) {
        throw new Error(surveysResponse.error);
      }
      
      if (!surveysResponse.data?.surveys || surveysResponse.data.surveys.length === 0) {
        throw new Error('No surveys found');
      }

      // Get the first active survey (AI Readiness Assessment)
      const aiReadinessSurvey = surveysResponse.data.surveys.find(
        (survey: any) => survey.title === 'AI Readiness Assessment'
      ) || surveysResponse.data.surveys[0];

      if (!aiReadinessSurvey) {
        throw new Error('AI Readiness survey not found');
      }

      setSurveyId(aiReadinessSurvey.id);

      // Get survey with questions using the API service
      const surveyResponse = await apiService.getSurveyById(aiReadinessSurvey.id);
      
      if (surveyResponse.error) {
        throw new Error(surveyResponse.error);
      }
      
      if (!surveyResponse.data?.survey) {
        throw new Error('Survey not found');
      }

      // Transform backend questions to frontend format
      const transformedQuestions: SurveyQuestion[] = surveyResponse.data.survey.questions.map((question: any) => ({
        id: question.id,
        question: question.text,
        dimension: getQuestionDimension(question.order),
        options: question.options ? JSON.parse(question.options) : []
      }));

      setSurveyQuestions(transformedQuestions);
    } catch (error) {
      console.error('Error loading survey questions:', error);
      setError('Failed to load survey questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map question order to dimensions
  const getQuestionDimension = (order: number): 'Data' | 'Governance' | 'Adoption' => {
    if (order <= 3) return 'Data';
    if (order <= 6) return 'Governance';
    return 'Adoption';
  };

  // Load questions when starting survey
  useEffect(() => {
    if (currentStep === 'survey' && surveyQuestions.length === 0 && !loading) {
      loadSurveyQuestions();
    }
  }, [currentStep]);

  const dimensions = [
    { 
      key: 'Data', 
      name: t('readiness.data'), 
      icon: Database, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Data foundation, quality, and governance'
    },
    { 
      key: 'Governance', 
      name: t('readiness.governance'), 
      icon: Shield, 
      color: 'from-purple-500 to-pink-500',
      description: 'AI governance, ethics, and compliance'
    },
    { 
      key: 'Adoption', 
      name: t('readiness.adoption'), 
      icon: Users, 
      color: 'from-green-500 to-emerald-500',
      description: 'Organizational culture and change management'
    }
  ];

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { questionId, answer: answerIndex } : a);
      }
      return [...prev, { questionId, answer: answerIndex }];
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    const scores: {[key: string]: number} = {};
    
    dimensions.forEach(dim => {
      const dimQuestions = surveyQuestions.filter(q => q.dimension === dim.key);
      const dimAnswers = dimQuestions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        return answer ? answer.answer : 0;
      });
      
      // Convert to percentage (0-100)
      const avgScore = dimAnswers.reduce((sum, val) => sum + val, 0) / dimAnswers.length;
      scores[dim.key] = Math.round((avgScore / 3) * 100);
    });

    setResults(scores);
    setCurrentStep('results');

    // Submit survey response to backend
    try {
      await submitSurveyResponse(scores);
    } catch (error) {
      console.error('Error submitting survey response:', error);
      // Continue even if submission fails - don't block user experience
    }
  };

  // Submit survey response to backend
  const submitSurveyResponse = async (scores: {[key: string]: number}) => {
    if (!surveyId) return;

    // Only submit if user is authenticated and has a valid token
    if (!isAuthenticated || !tokens?.accessToken) {
      console.log('User not authenticated, skipping survey submission');
      return;
    }

    try {
      const responseData = {
        surveyId,
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer, // Send the numeric value directly
          timeSpent: 30 // Default time spent per question in seconds
        })),
        deviceInfo: 'Web Browser',
        feedback: `AI Readiness Assessment - Overall Score: ${Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / 3)}%`
      };

      const result = await apiService.submitSurveyResponse(responseData, tokens.accessToken);
      
      if (result.error) {
        console.error('API Error:', result.error);
        throw new Error(result.error);
      }
      
      console.log('Survey submitted successfully:', result.data);
    } catch (error) {
      console.error('Failed to submit survey response:', error);
      // Don't throw error to avoid blocking user experience
      // The assessment results are still displayed to the user
    }
  };

  const resetAssessment = () => {
    setCurrentStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResults(null);
    setSurveyQuestions([]);
    setError(null);
  };

  const downloadReport = () => {
    if (!results) return;

    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(20);
    doc.text('Meyden AI Readiness Assessment Report', 20, yPosition);
    yPosition += 20;

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    dimensions.forEach(dim => {
      const IconComponent = dim.icon;
      const score = results[dim.key];
      
      yPosition += 10;
      doc.setFontSize(16);
      doc.text(`${dim.name}: ${score}%`, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      const recommendations = getRecommendations(dim.key, score);
      recommendations.forEach(rec => {
        doc.text(`• ${rec}`, 25, yPosition);
        yPosition += 7;
      });
      
      yPosition += 10;
    });

    doc.save('meyden-ai-readiness-report.pdf');
  };

  const getRecommendations = (dimension: string, score: number) => {
    const recommendations = {
      Data: [
        score < 50 ? 'Establish comprehensive data collection procedures' : 'Maintain current data collection excellence',
        score < 70 ? 'Implement data quality monitoring processes' : 'Continue data quality optimization',
        'Develop data governance framework with clear ownership'
      ],
      Governance: [
        score < 60 ? 'Create AI governance policies and procedures' : 'Enhance existing governance frameworks',
        score < 80 ? 'Establish AI ethics review committee' : 'Maintain strong ethical oversight',
        'Implement regular AI compliance audits'
      ],
      Adoption: [
        score < 60 ? 'Develop AI change management strategy' : 'Continue successful adoption practices',
        score < 75 ? 'Implement organization-wide AI training programs' : 'Maintain training excellence',
        'Foster AI innovation culture across teams'
      ]
    };
    
    return recommendations[dimension as keyof typeof recommendations] || [];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Developing';
    return 'Needs Improvement';
  };

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('readiness.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              {t('readiness.subtitle')}
            </p>

            {/* Dimensions Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {dimensions.map((dim, index) => {
                const Icon = dim.icon;
                return (
                  <motion.div
                    key={dim.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${dim.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{dim.name}</h3>
                    <p className="text-gray-600 text-sm">{dim.description}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Assessment Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Assessment Overview</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">9</div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                  <div className="text-gray-600">{t('readiness.dimensions')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
                  <div className="text-gray-600">Minutes</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('survey')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-2xl font-semibold text-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {t('readiness.start')}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentStep === 'survey') {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading survey questions...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Survey</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadSurveyQuestions}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (surveyQuestions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Survey Available</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      );
    }

    const currentQuestion = surveyQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)?.answer;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {t('readiness.progress')
                  .replace('{current}', (currentQuestionIndex + 1).toString())
                  .replace('{total}', surveyQuestions.length.toString())}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${
                dimensions.find(d => d.key === currentQuestion.dimension)?.color || 'from-gray-400 to-gray-500'
              } rounded-xl flex items-center justify-center mr-4`}>
                {React.createElement(
                  dimensions.find(d => d.key === currentQuestion.dimension)?.icon || Brain,
                  { className: "w-6 h-6 text-white" }
                )}
              </div>
              <div>
                <div className="text-sm text-purple-600 font-medium uppercase tracking-wide">
                  {dimensions.find(d => d.key === currentQuestion.dimension)?.name}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion.id, index)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all duration-300 ${
                    currentAnswer === index
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      currentAnswer === index
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {currentAnswer === index && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{t('readiness.previous')}</span>
            </button>

            <button
              onClick={nextQuestion}
              disabled={currentAnswer === undefined}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {currentQuestionIndex === surveyQuestions.length - 1 
                  ? t('readiness.complete')
                  : t('readiness.next')}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Page
  if (currentStep === 'results' && results) {
    const overallScore = Math.round(Object.values(results).reduce((sum, score) => sum + score, 0) / 3);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Award className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('readiness.results')}
            </h1>
            <p className="text-xl text-gray-600">
              Your organization's AI readiness assessment results
            </p>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center"
          >
            <div className="mb-6">
              <div className="text-6xl font-bold mb-2">
                <span className={`bg-gradient-to-r ${getScoreColor(overallScore)} bg-clip-text text-transparent`}>
                  {overallScore}%
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-2">
                Overall AI Readiness
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                overallScore >= 80 ? 'bg-green-500' :
                overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {getScoreLabel(overallScore)}
              </div>
            </div>
          </motion.div>

          {/* Dimension Scores */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {dimensions.map((dim, index) => {
              const Icon = dim.icon;
              const score = results[dim.key];
              
              return (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${dim.color} rounded-xl flex items-center justify-center mr-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{dim.name}</h3>
                      <p className="text-sm text-gray-600">{dim.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-2xl font-bold text-gray-900">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className={`bg-gradient-to-r ${getScoreColor(score)} h-3 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>

                  <div className={`text-sm font-medium ${
                    score >= 80 ? 'text-green-600' :
                    score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getScoreLabel(score)}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={downloadReport}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              <span>{t('readiness.download')}</span>
            </button>
            
            <button
              onClick={resetAssessment}
              className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{t('readiness.retake')}</span>
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}