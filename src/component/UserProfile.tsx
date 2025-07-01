import React, { useState } from 'react';
import { useLogin } from '../context/LoginContext';
import { type ObjectId } from '../type/common';
import '../styles/component/UserProfile.css';

const UserProfile: React.FC = () => {
    const { 
        user, 
        updateUsername, 
        updateLikedTopics, 
        updateLikedQuestions,
        isTopicLiked,
        isQuestionLiked 
    } = useLogin();
    
    const [newUsername, setNewUsername] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    // 更新用户名
    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) return;
        
        setIsUpdating(true);
        setMessage('');
        
        try {
            const success = await updateUsername(newUsername);
            if (success) {
                setMessage('用户名更新成功！');
                setNewUsername('');
            } else {
                setMessage('更新失败，请重试');
            }
        } catch (error) {
            setMessage('更新过程中出现错误');
        } finally {
            setIsUpdating(false);
        }
    };

    // 切换喜欢的主题
    const handleToggleTopic = async (topicId: ObjectId) => {
        setIsUpdating(true);
        setMessage('');
        
        try {
            const add = !isTopicLiked(topicId);
            const success = await updateLikedTopics(add, topicId);
            
            if (success) {
                setMessage(`主题${add ? '添加' : '移除'}成功！`);
            } else {
                setMessage('操作失败，请重试');
            }
        } catch (error) {
            setMessage('操作过程中出现错误');
        } finally {
            setIsUpdating(false);
        }
    };

    // 切换喜欢的问题
    const handleToggleQuestion = async (questionId: ObjectId) => {
        setIsUpdating(true);
        setMessage('');
        
        try {
            const add = !isQuestionLiked(questionId);
            const success = await updateLikedQuestions(add, questionId);
            
            if (success) {
                setMessage(`问题${add ? '添加' : '移除'}成功！`);
            } else {
                setMessage('操作失败，请重试');
            }
        } catch (error) {
            setMessage('操作过程中出现错误');
        } finally {
            setIsUpdating(false);
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
                    <p><strong>用户名:</strong> {user.username}</p>
                    <p><strong>邮箱:</strong> {user.email}</p>
                    <p><strong>喜欢的主题数:</strong> {user.likedTopics.length}</p>
                    <p><strong>喜欢的问题数:</strong> {user.likedQuestions.length}</p>
                </div>
            </div>

            {/* 更新用户名表单 */}
            <div className="update-section">
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
            </div>

            {/* 演示主题操作按钮 */}
            <div className="update-section">
                <h3>主题操作示例</h3>
                <div className="action-buttons">
                    <button 
                        onClick={() => handleToggleTopic('example_topic_1')}
                        disabled={isUpdating}
                        className={`action-button ${isTopicLiked('example_topic_1') ? 'liked' : ''}`}
                    >
                        {isTopicLiked('example_topic_1') ? '取消喜欢' : '喜欢'} 示例主题1
                    </button>
                    <button 
                        onClick={() => handleToggleTopic('example_topic_2')}
                        disabled={isUpdating}
                        className={`action-button ${isTopicLiked('example_topic_2') ? 'liked' : ''}`}
                    >
                        {isTopicLiked('example_topic_2') ? '取消喜欢' : '喜欢'} 示例主题2
                    </button>
                </div>
            </div>

            {/* 演示问题操作按钮 */}
            <div className="update-section">
                <h3>问题操作示例</h3>
                <div className="action-buttons">
                    <button 
                        onClick={() => handleToggleQuestion('example_question_1')}
                        disabled={isUpdating}
                        className={`action-button ${isQuestionLiked('example_question_1') ? 'liked' : ''}`}
                    >
                        {isQuestionLiked('example_question_1') ? '取消喜欢' : '喜欢'} 示例问题1
                    </button>
                    <button 
                        onClick={() => handleToggleQuestion('example_question_2')}
                        disabled={isUpdating}
                        className={`action-button ${isQuestionLiked('example_question_2') ? 'liked' : ''}`}
                    >
                        {isQuestionLiked('example_question_2') ? '取消喜欢' : '喜欢'} 示例问题2
                    </button>
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