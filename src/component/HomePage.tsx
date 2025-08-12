import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestion } from '../context/QuestionContext';
import TypeCard from './TopicCard';
import '../styles/component/HomePage.css';

const HomePage: React.FC = () => {
    const { questionTypes, topicsLoading: typesLoading, typesError } = useQuestion();
    const navigate = useNavigate();

    const handleTypeClick = (type: string) => {
        navigate(`/questions/${type}`);
    };
    // console.log(questionTypes);

    if (typesLoading) {
        return (
            <div className="homepage">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">加载问题类型中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="homepage">
            <header className="homepage-header">
                <h1 className="homepage-title">面试题库</h1>
                <p className="homepage-subtitle">选择一个技术栈开始练习</p>
                {typesError && (
                    <div className="error-notice">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">{typesError}</span>
                    </div>
                )}
            </header>

            <main className="homepage-main">
                
                <div className="types-grid">
                    {questionTypes.map((questionType) => (
                        <TypeCard
                            key={questionType._id || questionType.topic}
                            type={questionType.topic}
                            topicId={questionType._id || questionType.topic} // 使用_id或type作为topicId
                            onClick={() => handleTypeClick(questionType.topic)}
                        />
                    ))}
                </div>
            </main>

            <footer className="homepage-footer">
                <p className="footer-text">
                    选择感兴趣的技术栈，开始你的面试准备之旅！
                </p>
            </footer>
        </div>
    );
};

export default HomePage; 