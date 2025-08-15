import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext';
import { type QuestionType } from '../type/question.type';

interface QuestionCardProps {
    question: QuestionType;
    index: number;
    isPrivateMode: boolean;
    onToggleLike: (questionId: string, event: React.MouseEvent) => Promise<void>;
    likingQuestions: Record<string, boolean>;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    index,
    isPrivateMode,
    onToggleLike,
    likingQuestions
}) => {
    const navigate = useNavigate();
    const { isQuestionLiked } = useLogin();

    const handleCardClick = () => {
        const basePath = isPrivateMode ? '/questions/private' : '/questions';
        navigate(`${basePath}/${question.topic}/${question._id}`);
    };

    return (
        <article className="question-card">
            <header className="question-header">
                <span className="question-number">#{index + 1}</span>
                <div className="question-badges">
                    <span className="question-type-badge">{question.topic}</span>
                    {question.faq && (
                        <span className="faq-badge">🔥 高频</span>
                    )}
                </div>
            </header>
            
            <div className="question-content" onClick={handleCardClick}>
                <h4 className="question-title">{question.question}</h4>
                
                {question.answer && (
                    <div className="question-answer">
                        <h5 className="answer-label">答案：</h5>
                        <div className="answer-text-container">
                            <p className="answer-text">{question.answer.answer}</p>
                        </div>
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
                        onClick={(e) => onToggleLike(question._id || '', e)}
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
    );
};

export default QuestionCard;
