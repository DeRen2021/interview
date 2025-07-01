import React, { useState } from 'react';
import { useLogin } from '../context/LoginContext';
import '../styles/component/TypeCard.css';

interface TypeCardProps {
    type: string;
    topicId?: string; // 添加topicId用于like功能
    onClick: () => void;
}

const TypeCard: React.FC<TypeCardProps> = ({ type, topicId, onClick }) => {
    const { updateLikedTopics, isTopicLiked } = useLogin();
    const [isLiking, setIsLiking] = useState(false);

    // 处理喜欢主题
    const handleToggleLike = async (event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
        
        if (!topicId) return;
        
        setIsLiking(true);
        try {
            const add = !isTopicLiked(topicId);
            await updateLikedTopics(add, topicId);
        } catch (error) {
            console.error('更新喜欢状态失败:', error);
        } finally {
            setIsLiking(false);
        }
    };
    // 为不同类型定义图标
    const getTypeIcon = (type: string): string => {
        switch (type.toLowerCase()) {
            case 'react':
                return '⚛️';
            case 'redux':
                return '🔄';
            case 'ts':
            case 'typescript':
                return '📘';
            case 'javascript':
            case 'js':
                return '📒';
            case 'vue':
                return '🟢';
            case 'angular':
                return '🔺';
            case 'node':
            case 'nodejs':
                return '🟩';
            default:
                return '📋';
        }
    };

    // 为不同类型定义描述
    const getTypeDescription = (type: string): string => {
        switch (type.toLowerCase()) {
            case 'react':
                return '用于构建用户界面的JavaScript库';
            case 'redux':
                return 'JavaScript状态管理库';
            case 'ts':
            case 'typescript':
                return 'JavaScript的超集，具有静态类型检查';
            case 'javascript':
            case 'js':
                return '动态的编程语言';
            case 'vue':
                return '渐进式JavaScript框架';
            case 'angular':
                return 'TypeScript构建的应用设计框架';
            case 'node':
            case 'nodejs':
                return '基于Chrome V8引擎的JavaScript运行时';
            default:
                return '技术面试题集合';
        }
    };

    return (
        <div className="type-card" onClick={onClick}>
            <div className="type-card-header">
                <div className="type-icon">{getTypeIcon(type)}</div>
                <h3 className="type-title">{type.toUpperCase()}</h3>
                {topicId && (
                    <button
                        className={`like-topic-button ${isTopicLiked(topicId) ? 'liked' : ''}`}
                        onClick={handleToggleLike}
                        disabled={isLiking}
                        title={isTopicLiked(topicId) ? '取消喜欢此主题' : '喜欢此主题'}
                    >
                        {isLiking ? '⏳' : (isTopicLiked(topicId) ? '❤️' : '🤍')}
                    </button>
                )}
            </div>
            
            <div className="type-card-body">
                <p className="type-description">{getTypeDescription(type)}</p>
            </div>
            
            <div className="type-card-footer">
                <span className="type-link">点击开始练习 →</span>
            </div>
        </div>
    );
};

export default TypeCard; 