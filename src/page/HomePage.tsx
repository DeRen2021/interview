import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestion } from '../context/QuestionContext';
import TypeCard from '../component/TopicCard';
import '../styles/component/HomePage.css';

type ViewMode = 'public' | 'private';

const HomePage: React.FC = () => {
    const { 
        publicTopics: questionTypes, 
        topicsLoading: typesLoading, 
        typesError,
        privateTopics,
        privateTopicsLoading,
        privateTopicsError,
        loadPrivateTopics
    } = useQuestion();
    
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('public');

    // 当切换到私有模式时，懒加载私有话题
    useEffect(() => {
        if (viewMode === 'private') {
            loadPrivateTopics();
        }
    }, [viewMode, loadPrivateTopics]);

    const handleTopicCardClick = (type: string) => {
        // 根据当前视图模式导航到相应的路由
        if (viewMode === 'private') {
            navigate(`/questions/private/${type}`);
        } else {
            navigate(`/questions/${type}`);
        }
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    // 获取当前视图的话题数据
    const getCurrentTopics = () => {
        return viewMode === 'private' ? privateTopics : questionTypes;
    };

    // 获取当前视图的加载状态
    const getCurrentLoading = () => {
        return viewMode === 'private' ? privateTopicsLoading : typesLoading;
    };

    // 获取当前视图的错误状态
    const getCurrentError = () => {
        return viewMode === 'private' ? privateTopicsError : typesError;
    };
    // console.log(questionTypes);

    const currentLoading = getCurrentLoading();
    const currentError = getCurrentError();
    const currentTopics = getCurrentTopics();

    if (currentLoading) {
        return (
            <div className="homepage">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">
                        {viewMode === 'private' ? '加载私有话题中...' : '加载问题类型中...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="homepage">
            <header className="homepage-header">
                <h1 className="homepage-title">面试题库</h1>
                <p className="homepage-subtitle">
                    {viewMode === 'private' ? '选择一个私有技术栈开始练习' : '选择一个技术栈开始练习'}
                </p>
                
                {/* 视图模式切换器 */}
                <div className="view-mode-selector">
                    <button 
                        className={`mode-button ${viewMode === 'public' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('public')}
                    >
                        公共话题
                    </button>
                    <button 
                        className={`mode-button ${viewMode === 'private' ? 'active' : ''}`}
                        onClick={() => handleViewModeChange('private')}
                    >
                        私有话题
                    </button>
                </div>

                {currentError && (
                    <div className="error-notice">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{currentError}</span>
                    </div>
                )}
            </header>

            <main className="homepage-main">
                <div className="types-grid">
                    {currentTopics.length > 0 ? (
                        currentTopics.map((questionType, index) => (
                            <TypeCard
                                key={`${viewMode}-${questionType._id || questionType.topic || index}`}
                                type={questionType.topic}
                                topicId={questionType._id || questionType.topic}
                                onClick={() => handleTopicCardClick(questionType.topic)}
                            />
                        ))
                    ) : (
                        <div className="no-topics-message">
                            <p>
                                {viewMode === 'private' 
                                    ? '暂无私有话题，请联系管理员添加。' 
                                    : '暂无公共话题可用。'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="homepage-footer">
                <p className="footer-text">
                    {viewMode === 'private' 
                        ? '探索私有话题，获取专属面试资源！' 
                        : '选择感兴趣的技术栈，开始你的面试准备之旅！'
                    }
                </p>
            </footer>
        </div>
    );
};

export default HomePage; 