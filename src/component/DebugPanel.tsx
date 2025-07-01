import React, { useState, useEffect } from 'react';
import { useQuestion } from '../context/QuestionContext';
import { useLogin } from '../context/LoginContext';
import '../styles/component/DebugPanel.css';

const DebugPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { questionsCache, questionsLoading, questionsError } = useQuestion();

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    if (!isOpen) {
        return (
            <button className="debug-toggle" onClick={togglePanel}>
                🔍 调试面板
            </button>
        );
    }

    return (
        <div className="debug-panel">
            <div className="debug-header">
                <h3>🔍 调试面板 - 缓存状态</h3>
                <button className="debug-close" onClick={togglePanel}>
                    ✕
                </button>
            </div>
            
            <div className="debug-content">
                <div className="debug-section">
                    <h4>📦 缓存的问题数据</h4>
                    {Object.keys(questionsCache).length === 0 ? (
                        <p className="debug-empty">暂无缓存数据</p>
                    ) : (
                        <div className="debug-cache-list">
                            {Object.entries(questionsCache).map(([type, questions]) => (
                                <div key={type} className="debug-cache-item">
                                    <span className="debug-type">{type.toUpperCase()}</span>
                                    <span className="debug-count">{questions.length} 个问题</span>
                                    <span className="debug-status cached">已缓存</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="debug-section">
                    <h4>⏳ 加载状态</h4>
                    {Object.keys(questionsLoading).length === 0 ? (
                        <p className="debug-empty">无加载任务</p>
                    ) : (
                        <div className="debug-loading-list">
                            {Object.entries(questionsLoading).map(([type, loading]) => (
                                loading && (
                                    <div key={type} className="debug-loading-item">
                                        <span className="debug-type">{type.toUpperCase()}</span>
                                        <span className="debug-status loading">加载中...</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

                <div className="debug-section">
                    <h4>❌ 错误状态</h4>
                    {Object.values(questionsError).every(error => !error) ? (
                        <p className="debug-empty">无错误</p>
                    ) : (
                        <div className="debug-error-list">
                            {Object.entries(questionsError).map(([type, error]) => (
                                error && (
                                    <div key={type} className="debug-error-item">
                                        <span className="debug-type">{type.toUpperCase()}</span>
                                        <span className="debug-status error">{error}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DebugPanel; 