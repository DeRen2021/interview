import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type QuestionType } from '../../type/question.type';
import { baseUrl } from '../../config/config';
import { useQuestion } from '../../context/QuestionContext';
import { useLogin } from '../../context/LoginContext';
import '../../styles/component/QuestionInterview.css';
import AudioRecorder from './record';
import { type audioResponse } from '../../type/openai.type';
import { checkAnswerEndpoint } from '../../config/config';
import  axios from 'axios';

const QuestionInterview: React.FC = () => {
    const { type, _id } = useParams<{ type: string, _id: string }>();
    const navigate = useNavigate();
    const { getQuestionById, loadQuestionsByType, isTypeLoading, getQuestionsForType } = useQuestion();
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
    const question = type && _id ? getQuestionById(type, _id) : null;
    const loading = type ? isTypeLoading(type) : false;
    const questionList = type ? getQuestionsForType(type) : [];

    useEffect(() => {
        // 如果参数不存在，重定向到首页
        if (!type || !_id) {
            navigate('/');
            return;
        }

        // 如果问题数据还没有加载，则加载该类型的所有问题
        if (!question && !loading) {
            loadQuestionsByType(type);

        }
        setTranscript('');
        setPassed(null);
        setFeedback('');
    }, [type, _id, question, loading, navigate, loadQuestionsByType]);

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
        if (questionItem._id && type) {
            navigate(`/questions/${type}/${questionItem._id}`);
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

    //检查答案是否正确
    const handleCheckAnswer = async (answer:string,question:string) => {
        try{
            const response = await axios.post(checkAnswerEndpoint, {
                question:question,answer:answer
            });
            if(response.status === 200){  
                const data: audioResponse = response.data;
                console.log(data);
                setPassed(data.passed);
                setFeedback(data.feedback);
            }
        }catch(error){
            console.error('检查答案失败:', error);
            setPassed(false);
            setFeedback('检查答案失败');
        } 
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
                        <h3 className="sidebar__title">{type?.toUpperCase()} 题库</h3>
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
                        <h2 className="question-section__title">题目</h2>
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
                            <button onClick={() => handleCheckAnswer(transcript,question.question)}>检查答案</button>
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


