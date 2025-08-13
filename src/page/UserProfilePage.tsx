import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext';
import '../styles/component/UserProfile.css';
import { type QuestionType } from '../type/question.type';
import { getUserLikedQuestionsEndpoint, mainApi } from '../config/config';
import { handleApiError } from '../config/apiInstance';

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { 
        user, 
    } = useLogin();
    
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [likedQuestions, setLikedQuestions] = useState<QuestionType[]>([]);

    useEffect(() => {
        // 当用户信息可用时，自动获取喜欢的问题列表
        // console.log(user)
        if (user) {
            getLikedQuestions();
        }
    }, [user]); // 依赖于user，当user对象变化时会重新执行

    
    

    const getLikedQuestions = async () => {
        if (!user || !user.email || !user.role) {
            setMessage('用户未登录或用户信息不完整');
            return;
        }

        setIsUpdating(true);
        setMessage('');
        try {
            // 将用户ID作为查询参数附加到URL
            const url = `${getUserLikedQuestionsEndpoint}?userId=${user._id}`;
            // 使用配置好的mainApi实例，这样会经过拦截器和错误处理
            const response = await mainApi.get<{ success: boolean, data: QuestionType[] }>(url);
            
            // 检查响应是否成功，并且 data 字段是一个数组
            if (response.data.success && Array.isArray(response.data.data)) {
                // 问题列表在 response.data.data 中
                setLikedQuestions(response.data.data);
                // 自动加载，无需显示成功消息
                // setMessage('成功获取喜欢的题目列表！');
            } else {
                setMessage('未能获取喜欢的题目列表');
                setLikedQuestions([]);
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setMessage(errorMessage);
            setLikedQuestions([]);
            console.error('获取喜欢的题目列表时出错:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleQuestionClick = (question: QuestionType) => {
        if (question.topic && question._id) {
            navigate(`/questions/${question.topic}/${question._id}`);
        }
    };

    if (!user) {
        return <div>请先登录</div>;
    }

    return (
        <div className="user-profile">
            <div className="profile-header">
                <h2>用户资料</h2>
                <div className="user-info">
                    <p><strong>邮箱:</strong> {user.email}</p>
                    <p><strong>用户权限:</strong> {user.role}</p>
                    <p><strong>喜欢的主题数:</strong> {user.likedTopics.length}</p>
                    <p><strong>喜欢的问题数:</strong> {user.likedQuestions.length}</p>
                </div>
            </div>

            {/* 更新用户名表单 */}
            {/* <div className="update-section">
                <h3>更新用户名</h3>
                <form onSubmit={handleUpdateUsername} className="update-form">
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="输入新的用户名"
                        disabled={isUpdating}
                        className="update-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isUpdating || !newUsername.trim()}
                        className="update-button"
                    >
                        {isUpdating ? '更新中...' : '更新用户名'}
                    </button>
                </form>
            </div> */}

            

            

            {/* 获取喜欢的问题 */}
            <div className="update-section">
                <h3>我喜欢的题目</h3>
                {isUpdating && <p>加载中...</p>}
                <div className="liked-questions-list">
                    {likedQuestions.length > 0 ? (
                        <ul>
                            {likedQuestions.map(q => (
                                <li 
                                    key={q._id} 
                                    onClick={() => handleQuestionClick(q)}
                                    className="liked-question-item"
                                >
                                    {q.question}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !isUpdating && <p>还没有喜欢的题目。</p>
                    )}
                </div>
            </div>

            {/* 消息提示 */}
            {message && (
                <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default UserProfile; 