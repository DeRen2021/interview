import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuestion } from '../context/QuestionContext';
import { useLogin } from '../context/LoginContext';
import '../styles/component/QuestionCollection.css';

// 筛选选项类型
type FilterOption = 'all' | 'liked' | 'faq';

const QuestionCollection: React.FC = () => {
    const { topic } = useParams<{ topic: string }>();
    const navigate = useNavigate();
    const {
        loadQuestionsByTopic,
        getQuestionsForTopic,
        isTypeLoading,
        getTypeError,
        clearTypeError
    } = useQuestion();
    const { updateLikedQuestions, isQuestionLiked } = useLogin();
    
    // 处理喜欢问题的加载状态
    const [likingQuestions, setLikingQuestions] = useState<Record<string, boolean>>({});
    // 添加筛选状态
    const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
    // 添加搜索状态
    const [searchQuery, setSearchQuery] = useState<string>('');

    const topicName = topic;

    // not found page
    if (!topicName) {
        navigate('/');
        return;
    }

    const allQuestions = getQuestionsForTopic(topicName);
    const loading = isTypeLoading(topicName);
    const error = getTypeError(topicName);

    // 根据筛选条件和搜索查询过滤问题
    const filteredQuestions = allQuestions.filter(question => {
        // 首先根据筛选条件过滤
        let matchesFilter = true;
        switch (currentFilter) {
            case 'liked':
                matchesFilter = isQuestionLiked(question._id || '');
                break;
            case 'faq':
                matchesFilter = question.faq === true;
                break;
            default:
                matchesFilter = true;
        }
        
        // 然后根据搜索查询过滤
        const matchesSearch = searchQuery.trim() === '' || 
            question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (question.answer?.answer && question.answer.answer.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesFilter && matchesSearch;
    });

    // 计算统计信息
    const likedCount = allQuestions.filter(q => isQuestionLiked(q._id || '')).length;
    const faqCount = allQuestions.filter(q => q.faq === true).length;

    useEffect(() => {
        if (topicName) {
            loadQuestionsByTopic(topicName);
        }
    }, [topicName]);

    // const handleQuestionTypeChange = (newType: string) => {
    //     navigate(`/questions/${newType}`);
    // };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleRetry = () => {
        clearTypeError(topicName);
        loadQuestionsByTopic(topicName);
    };

    // 处理筛选变化
    const handleFilterChange = (filter: FilterOption) => {
        setCurrentFilter(filter);
    };

    // 处理搜索输入变化
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // 清空搜索
    const handleClearSearch = () => {
        setSearchQuery('');
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
                    {topicName.toUpperCase()} 面试问题集合
                </h1>
                <div className="collection-stats">
                    <span className="question-count">{filteredQuestions.length} 个问题</span>
                    <span className="collection-type">{topicName}</span>
                </div>
            </header>

            {/* 搜索栏 */}
            <div className="search-section">
                <h3 className="search-title">搜索问题：</h3>
                <div className="search-bar">
                    <div className="search-input-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="搜索问题内容、主题或答案..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button
                                className="clear-search-button"
                                onClick={handleClearSearch}
                                title="清空搜索"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <div className="search-results-info">
                            找到 {filteredQuestions.length} 个匹配的问题
                        </div>
                    )}
                </div>
            </div>

            {/* 筛选器 */}
            <div className="filter-section">
                <h3 className="filter-title">筛选问题：</h3>
                <div className="filter-buttons">
                    <button
                        className={`filter-button ${currentFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        <span className="filter-icon">📋</span>
                        <span className="filter-text">全部题目</span>
                        <span className="filter-count">({allQuestions.length})</span>
                    </button>
                    <button
                        className={`filter-button ${currentFilter === 'liked' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('liked')}
                    >
                        <span className="filter-icon">❤️</span>
                        <span className="filter-text">喜欢的题目</span>
                        <span className="filter-count">({likedCount})</span>
                    </button>
                    <button
                        className={`filter-button ${currentFilter === 'faq' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('faq')}
                    >
                        <span className="filter-icon">🔥</span>
                        <span className="filter-text">高频题目</span>
                        <span className="filter-count">({faqCount})</span>
                    </button>
                </div>
            </div>



            <main className="questions-container">
                {filteredQuestions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            {searchQuery ? '🔍' : '📋'}
                        </div>
                        <h3 className="empty-title">
                            {searchQuery ? '没有找到匹配的问题' : 
                             currentFilter === 'all' ? '暂无问题' : 
                             currentFilter === 'liked' ? '暂无喜欢的问题' : 
                             '暂无高频问题'}
                        </h3>
                        <p className="empty-message">
                            {searchQuery ? `没有找到包含 "${searchQuery}" 的问题，请尝试其他关键词` :
                             currentFilter === 'all' ? '该类型下还没有问题，请选择其他类型' : 
                             currentFilter === 'liked' ? '还没有喜欢的问题，先去喜欢一些问题吧' : 
                             '还没有标记为高频的问题'}
                        </p>
                        {searchQuery && (
                            <button
                                className="clear-search-button-empty"
                                onClick={handleClearSearch}
                            >
                                清空搜索
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="questions-grid">
                        {filteredQuestions.map((question, index) => (
                            console.log('question', question.topic),
                            <article key={question._id} className="question-card">
                                <header className="question-header">
                                    <span className="question-number">#{index + 1}</span>
                                    <div className="question-badges">
                                        <span className="question-type-badge">{question.topic}</span>
                                        {question.faq && (
                                            <span className="faq-badge">🔥 高频</span>
                                        )}
                                    </div>
                                </header>
                                
                                <div className="question-content" onClick={() => navigate(`/questions/${question.topic}/${question._id}`)}>
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
                        {searchQuery ? (
                            <>
                                搜索 "{searchQuery}" 找到 {filteredQuestions.length} 道题目
                                {currentFilter !== 'all' && (
                                    <span className="filter-indicator">
                                        {' '}({currentFilter === 'liked' ? '仅显示喜欢的' : '仅显示高频'}题目)
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                {currentFilter === 'all' ? `共 ${allQuestions.length} 道` : 
                                 currentFilter === 'liked' ? `共 ${likedCount} 道喜欢的` : 
                                 `共 ${faqCount} 道高频`} {topicName.toUpperCase()} 面试题
                                {filteredQuestions.length > 0 && (
                                    <span className="cached-indicator"> (已缓存)</span>
                                )}
                            </>
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