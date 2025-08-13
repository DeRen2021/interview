import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type QuestionType } from '../type/question.type';
import { baseUrl,updateQuestionFaqEndpoint, mainApi} from '../config/config';
import { useQuestion } from '../context/QuestionContext';
import { useLogin } from '../context/LoginContext';
import '../styles/component/QuestionInterview.css';
import AudioRecorder from '../component/interview/recordButton';
import { handleApiError } from '../config/apiInstance';
import '../styles/component/Button.css';
import CheckAnswerButton from '../component/interview/checkAnswerButton';


const QuestionInterview: React.FC = () => {
    const { topic, _id } = useParams<{ topic: string, _id: string }>();
    const navigate = useNavigate();
    
    // 检测是否为私有模式
    const isPrivateMode = window.location.pathname.includes('/questions/private/');
    
    const { 
        getQuestionById, 
        loadQuestionsByTopic: loadQuestionsByType, 
        isTypeLoading, 
        getQuestionsForTopic: getQuestionsForType,
        // 私有模式方法
        getPrivateQuestionById,
        loadPrivateQuestionsByTopic,
        isPrivateTypeLoading,
        getPrivateQuestionsForTopic
    } = useQuestion();
    const { updateLikedQuestions, isQuestionLiked } = useLogin();
    const [transcript, setTranscript] = useState<string>('');
    const [passed, setPassed] = useState<boolean|null>(null);
    const [feedback, setFeedback] = useState<string>('');

    // 状态管理
    const [isPracticeMode, setIsPracticeMode] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        answer: false,
        explanation: false
    });
    const [isUpdatingLike, setIsUpdatingLike] = useState(false);

    // 类型检查：确保 type 和 _id 都存在
    const question = topic && _id ? (
        isPrivateMode ? getPrivateQuestionById(topic, _id) : getQuestionById(topic, _id)
    ) : null;
    const loading = topic ? (
        isPrivateMode ? isPrivateTypeLoading(topic) : isTypeLoading(topic)
    ) : false;
    const questionList = topic ? (
        isPrivateMode ? getPrivateQuestionsForTopic(topic) : getQuestionsForType(topic)
    ) : [];

    useEffect(() => {
        // 如果参数不存在，重定向到首页
        if (!topic || !_id) {
            console.log('topic or _id is not found',topic, _id);
            navigate('/');
            return;
        }

        // 如果问题数据还没有加载，则加载该类型的所有问题
        if (!question && !loading) {
            if (isPrivateMode) {
                loadPrivateQuestionsByTopic(topic);
            } else {
                loadQuestionsByType(topic);
            }
        }
        setTranscript('');
        setPassed(null);
        setFeedback('');
    }, [topic, _id, question, loading, navigate, loadQuestionsByType, loadPrivateQuestionsByTopic, isPrivateMode]);

    // 处理模式切换
    const handleModeToggle = () => {
        const newMode = !isPracticeMode;
        setIsPracticeMode(newMode);
        
        // 在练习模式下默认展开所有内容
        if (newMode) {
            setExpandedSections({
                answer: true,
                explanation: true
            });
        } else {
            // 在回答模式下默认收起所有内容
            setExpandedSections({
                answer: false,
                explanation: false
            });
        }
    };

    // 处理内容展开/收起
    const toggleSection = (section: string) => {
        if (!isPracticeMode) {
            setExpandedSections(prev => ({
                ...prev,
                [section]: !prev[section]
            }));
        }
    };

    // 构建录音URL
    const getRecordingUrl = (recordingPath: string) => {
        if (!recordingPath) return '';
        // 如果是完整URL则直接使用，否则拼接baseUrl
        if (recordingPath.startsWith('http')) {
            return recordingPath;
        }
        return `${baseUrl}/${recordingPath}`;
    };

    // 处理题目跳转
    const handleQuestionNavigation = (questionItem: QuestionType) => {
        if (questionItem._id && topic) {
            const basePath = isPrivateMode ? '/questions/private' : '/questions';
            navigate(`${basePath}/${topic}/${questionItem._id}`);
        }
    };

    // 处理喜欢问题
    const handleToggleLike = async () => {
        if (!question?._id) return;
        
        setIsUpdatingLike(true);
        try {
            const add = !isQuestionLiked(question._id);
            await updateLikedQuestions(add, question._id);
        } catch (error) {
            console.error('更新喜欢状态失败:', error);
        } finally {
            setIsUpdatingLike(false);
        }
    };

    const handleToggleFaq = async () => {
        if (!question?._id) return;
        try {
            // 如果FAQ字段未定义，默认为false
            const currentFaqStatus = question.faq || false;
            
            const response = await mainApi.patch(`${updateQuestionFaqEndpoint}/${question._id}/faq`, {
                faq: !currentFaqStatus
            });
            
            if(response.status === 200) {
                console.log('FAQ状态更新成功');
                // 这里可以添加成功后的处理逻辑，比如更新本地状态
            }
        } catch (error) {
            console.error('更新FAQ状态失败:', error);
            const errorMessage = handleApiError(error);
            console.error('FAQ更新错误详情:', errorMessage);
        }
    }

    //检查答案是否正确
    const handleCheckResult = (passed: boolean, feedback: string) => {
        setPassed(passed);
        setFeedback(feedback);
    }

    

    if (loading) {
        return (
            <div className="question-interview">
                <div className="loading-state">
                    <div>正在加载问题...</div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="question-interview">
                <div className="error-state">
                    <div>问题未找到</div>
                    <button onClick={() => navigate('/')} style={{marginTop: '16px', padding: '8px 16px', cursor: 'pointer'}}>
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="question-interview">
            {/* 侧边栏 */}
            <div className="question-interview__sidebar">
                <div className="sidebar">
                    <div className="sidebar__header">
                        <h3 className="sidebar__title">{topic?.toUpperCase()} 题库</h3>
                        <p className="sidebar__subtitle">共 {questionList.length} 道题</p>
                    </div>
                    <div className="sidebar__list">
                        {loading ? (
                            <div className="sidebar__loading">加载中...</div>
                        ) : questionList.length === 0 ? (
                            <div className="sidebar__empty">暂无题目</div>
                        ) : (
                            questionList.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    className={`sidebar__item ${item._id === _id ? 'active' : ''}`}
                                    onClick={() => handleQuestionNavigation(item)}
                                >
                                    <div className="sidebar__item-index">第 {index + 1} 题</div>
                                    <div className="sidebar__item-title">{item.question}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="question-interview__main">
                <div className="question-interview__header">
                    <div className="question-interview__title-section">
                        <h1 className="question-interview__title">面试题目</h1>
                        {question?._id && (
                            <>
                                <button
                                    onClick={handleToggleLike}
                                    disabled={isUpdatingLike}
                                    className={`like-button ${isQuestionLiked(question._id) ? 'liked' : ''}`}
                                    title={isQuestionLiked(question._id) ? '取消喜欢' : '喜欢此问题'}
                                >
                                    {isUpdatingLike ? '...' : (isQuestionLiked(question._id) ? '❤️' : '🤍')}
                                    <span className="like-button__text">
                                        {isQuestionLiked(question._id) ? '已喜欢' : '喜欢'}
                                    </span>
                                </button>
                                <button
                                    onClick={handleToggleFaq}
                                    className={`faq-button ${question.faq || false ? 'active' : ''}`}
                                    title={(question.faq || false) ? '取消高频题标记' : '标记为高频题'}
                                >
                                    🔥 {(question.faq || false) ? '高频题' : '标记高频'}
                                </button>
                            </>
                        )}
                    </div>
                    <div className="mode-toggle">
                        <span className="mode-toggle__label">
                            {isPracticeMode ? '练习模式' : '回答模式'}
                        </span>
                        <div 
                            className={`mode-toggle__switch ${isPracticeMode ? 'active' : ''}`}
                            onClick={handleModeToggle}
                        >
                            <div className="mode-toggle__slider"></div>
                        </div>
                    </div>
                </div>

                <div className="question-content">
                    {/* 问题部分 */}
                    <div className="question-section">
                        <div className="question-section-header">
                            <h2 className="question-section__title">题目</h2>
                            <div className="question-meta">
                                {(question.faq || false) && (
                                    <span className="meta-badge faq-badge">🔥 高频题</span>
                                )}
                                {question.accuracy && question.accuracy.totalAttempts > 0 && (
                                    <div className="meta-accuracy">
                                        <span className="meta-badge accuracy-badge">
                                            正确率: {((question.accuracy.correctAttempts / question.accuracy.totalAttempts) * 100).toFixed(0)}%
                                        </span>
                                        <span className="accuracy-details">
                                            ({question.accuracy.correctAttempts} / {question.accuracy.totalAttempts})
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="question-section__content">
                            {question.question}
                        </div>
                        
                        {/* 录音播放器 */}
                        {question.recording_path && (
                            <div className="audio-player">
                                <div className="audio-player__title">录音</div>
                                <div className="audio-player__controls">
                                    <audio 
                                        key={`${question._id}-${question.recording_path}`} // 添加key强制重新渲染
                                        controls
                                        preload="none"
                                    >
                                        <source src={getRecordingUrl(question.recording_path)} type="audio/mpeg" />
                                        <source src={getRecordingUrl(question.recording_path)} type="audio/wav" />
                                        <source src={getRecordingUrl(question.recording_path)} type="audio/mp3" />
                                        您的浏览器不支持音频播放功能。
                                    </audio>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 答案部分 */}
                    <div className="collapsible-section">
                        <div 
                            className="collapsible-section__header"
                            onClick={() => toggleSection('answer')}
                        >
                            <h3 className="collapsible-section__title">参考答案</h3>
                            <span className={`collapsible-section__icon ${expandedSections.answer ? 'expanded' : ''}`}>
                                ▼
                            </span>
                        </div>
                        <div className={`collapsible-section__content ${!expandedSections.answer ? 'hidden' : ''}`}>
                            {question.answer?.answer || '暂无答案'}
                        </div>
                    </div>

                    {/* 解释部分 */}
                    <div className="collapsible-section">
                        <div 
                            className="collapsible-section__header"
                            onClick={() => toggleSection('explanation')}
                        >
                            <h3 className="collapsible-section__title">详细解释</h3>
                            <span className={`collapsible-section__icon ${expandedSections.explanation ? 'expanded' : ''}`}>
                                ▼
                            </span>
                        </div>
                        <div className={`collapsible-section__content ${!expandedSections.explanation ? 'hidden' : ''}`}>
                            {question.answer?.explanation || '暂无解释'}
                        </div>
                    
                    <div className="collapsible-section">
                        <div>
                            <h2>录音转写结果：</h2>
                            <p>{transcript || '还没收到文字'}</p>

                            {/* 把回调以 prop 形式传给子组件 */}
                            <AudioRecorder onTranscription={setTranscript} />
                            <CheckAnswerButton question={question} answer={transcript} onResult={handleCheckResult} />
                            <p>{passed ? '答案正确' : passed === false ? '答案错误' : ''}</p>
                            <p>{feedback}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionInterview;


