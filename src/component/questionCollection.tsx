import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuestion } from '../context/QuestionContext';
import { useLogin } from '../context/LoginContext';
import '../styles/component/QuestionCollection.css';

const QuestionCollection: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const {
        questionTypes,
        loadQuestionsByType,
        getQuestionsForType,
        isTypeLoading,
        getTypeError,
        clearTypeError
    } = useQuestion();
    const { updateLikedQuestions, isQuestionLiked } = useLogin();
    
    // 处理喜欢问题的加载状态
    const [likingQuestions, setLikingQuestions] = useState<Record<string, boolean>>({});

    const questionType = type || 'react';
    const questions = getQuestionsForType(questionType);
    const loading = isTypeLoading(questionType);
    const error = getTypeError(questionType);

    useEffect(() => {
        if (questionType) {
            loadQuestionsByType(questionType);
        }
    }, [questionType, loadQuestionsByType]);

    const handleQuestionTypeChange = (newType: string) => {
        navigate(`/questions/${newType}`);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleRetry = () => {
        clearTypeError(questionType);
        loadQuestionsByType(questionType);
    };

    // 处理喜欢问题
    const handleToggleLike = async (questionId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止事件冒泡，避免触发问题跳转
        
        setLikingQuestions(prev => ({ ...prev, [questionId]: true }));
        try {
            const add = !isQuestionLiked(questionId);
            await updateLikedQuestions(add, questionId);
        } catch (error) {
            console.error('更新喜欢状态失败:', error);
        } finally {
            setLikingQuestions(prev => ({ ...prev, [questionId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="question-collection">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">加载问题中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="question-collection">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3 className="error-title">出错了</h3>
                    <p className="error-message">{error}</p>
                    <button 
                        className="retry-button"
                        onClick={handleRetry}
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="question-collection">
            <header className="collection-header">
                <button className="back-button" onClick={handleBackToHome}>
                    ← 返回主页
                </button>
                <h1 className="collection-title">
                    {questionType.toUpperCase()} 面试问题集合
                </h1>
                <div className="collection-stats">
                    <span className="question-count">{questions.length} 个问题</span>
                    <span className="collection-type">{questionType}</span>
                </div>
            </header>

            {/* <nav className="type-selector">
                <h3 className="selector-title">选择问题类型：</h3>
                <div className="type-buttons">
                    {questionTypes.map((questionTypeItem) => (
                        <button
                            key={questionTypeItem._id}
                            className={`type-button ${questionType === questionTypeItem.type ? 'active' : ''}`}
                            onClick={() => handleQuestionTypeChange(questionTypeItem.type)}
                        >
                            {questionTypeItem.type.toUpperCase()}
                        </button>
                    ))}
                </div>
            </nav> */}

            <main className="questions-container">
                {questions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3 className="empty-title">暂无问题</h3>
                        <p className="empty-message">该类型下还没有问题，请选择其他类型</p>
                    </div>
                ) : (
                    <div className="questions-grid">
                        {questions.map((question, index) => (
                            <article key={question._id} className="question-card">
                                <header className="question-header">
                                    <span className="question-number">#{index + 1}</span>
                                    <span className="question-type-badge">{question.type}</span>
                                </header>
                                
                                <div className="question-content" onClick={() => navigate(`/questions/${question.type}/${question._id}`)}>
                                    <h4 className="question-title">{question.question}</h4>
                                    
                                    {question.answer && (
                                        <div className="question-answer">
                                            <h5 className="answer-label">答案：</h5>
                                            <p className="answer-text">{question.answer.answer}</p>
                                        </div>
                                    )}
                                    
                                    {question.recording_path && (
                                        <div className="question-recording">
                                            <span className="recording-icon">🎵</span>
                                            <span className="recording-text">包含录音</span>
                                        </div>
                                    )}
                                </div>
                                
                                <footer className="question-footer">
                                    <span className="question-id">ID: {question._id}</span>
                                    <div className="question-actions">
                                        <button 
                                            className={`action-button like ${isQuestionLiked(question._id || '') ? 'liked' : ''}`}
                                            onClick={(e) => handleToggleLike(question._id || '', e)}
                                            disabled={likingQuestions[question._id || '']}
                                            title={isQuestionLiked(question._id || '') ? '取消喜欢' : '喜欢此问题'}
                                        >
                                            {likingQuestions[question._id || ''] ? (
                                                '⏳ 处理中...'
                                            ) : (
                                                <>
                                                    {isQuestionLiked(question._id || '') ? '❤️' : '🤍'} 
                                                    {isQuestionLiked(question._id || '') ? '已喜欢' : '喜欢'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </footer>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <footer className="collection-footer">
                <div className="footer-info">
                    <p className="footer-text">
                        共 {questions.length} 道 {questionType.toUpperCase()} 面试题
                        {questions.length > 0 && (
                            <span className="cached-indicator"> (已缓存)</span>
                        )}
                    </p>
                    <p className="footer-subtitle">
                        持续更新中，助你面试成功！
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default QuestionCollection;