import React, { useState } from 'react';
import { parseQuestionEndpoint, uploadQuestionEndpoint } from '../config/config';
import '../styles/component/QuestionUpload.css';

interface UploadStep {
    step: number;
    title: string;
}

const QuestionUpload: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [accessId, setAccessId] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [questionList, setQuestionList] = useState<string[]>([]);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const steps: UploadStep[] = [
        { step: 1, title: '上传文件' },
        { step: 2, title: '编辑问题' },
        { step: 3, title: '设置主题并保存' }
    ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setError('');
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !accessId.trim()) {
            setError('请选择文件并输入访问ID');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('access_id', accessId);

            const response = await fetch(parseQuestionEndpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setQuestionList(data.question_list || []);
                setCurrentStep(2);
                setSuccess('文件解析成功！');
            } else {
                setError(data.error || '文件解析失败');
            }
        } catch (err) {
            setError('网络错误，请稍后重试');
        }

        setLoading(false);
    };

    const handleQuestionChange = (index: number, value: string) => {
        const updatedQuestions = [...questionList];
        updatedQuestions[index] = value;
        setQuestionList(updatedQuestions);
    };

    const handleRemoveQuestion = (index: number) => {
        const updatedQuestions = questionList.filter((_, i) => i !== index);
        setQuestionList(updatedQuestions);
    };

    const handleAddQuestion = () => {
        setQuestionList([...questionList, '']);
    };

    const handleUploadToDatabase = async () => {
        if (!topic.trim() || questionList.length === 0) {
            setError('请输入主题并确保至少有一个问题');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(uploadQuestionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_list: questionList.filter(q => q.trim()),
                    topic: topic,
                    access_id: accessId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('问题上传成功！');
                // 重置表单
                setTimeout(() => {
                    setCurrentStep(1);
                    setSelectedFile(null);
                    setQuestionList([]);
                    setTopic('');
                    setAccessId('');
                    setSuccess('');
                }, 2000);
            } else {
                setError(data.error || '上传失败');
            }
        } catch (err) {
            setError('网络错误，请稍后重试');
        }

        setLoading(false);
    };

    const resetForm = () => {
        setCurrentStep(1);
        setSelectedFile(null);
        setQuestionList([]);
        setTopic('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="question-upload">
            <div className="upload-container">
                <header className="upload-header">
                    <h1 className="upload-title">问题上传管理</h1>
                    <div className="step-indicator">
                        {steps.map((stepInfo, index) => (
                            <div
                                key={stepInfo.step}
                                className={`step ${currentStep >= stepInfo.step ? 'active' : ''} ${currentStep === stepInfo.step ? 'current' : ''}`}
                            >
                                <div className="step-number">{stepInfo.step}</div>
                                <div className="step-title">{stepInfo.title}</div>
                            </div>
                        ))}
                    </div>
                </header>

                {error && (
                    <div className="message error-message">
                        <span className="message-icon">❌</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="message success-message">
                        <span className="message-icon">✅</span>
                        <span>{success}</span>
                    </div>
                )}

                {/* 步骤1: 文件上传 */}
                {currentStep === 1 && (
                    <div className="step-content">
                        <h2>步骤 1: 上传文件</h2>
                        <div className="form-group">
                            <label htmlFor="accessId">访问ID *</label>
                            <input
                                type="text"
                                id="accessId"
                                value={accessId}
                                onChange={(e) => setAccessId(e.target.value)}
                                placeholder="请输入访问ID"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="file">选择文件 *</label>
                            <input
                                type="file"
                                id="file"
                                accept=".docx,.pages"
                                onChange={handleFileChange}
                                className="form-input file-input"
                            />
                            <p className="file-help">支持的文件格式：.docx, .pages</p>
                            {selectedFile && (
                                <div className="selected-file">
                                    <span className="file-icon">📄</span>
                                    <span className="file-name">{selectedFile.name}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleFileUpload}
                            disabled={loading || !selectedFile || !accessId.trim()}
                            className="btn btn-primary"
                        >
                            {loading ? '解析中...' : '解析文件'}
                        </button>
                    </div>
                )}

                {/* 步骤2: 编辑问题 */}
                {currentStep === 2 && (
                    <div className="step-content">
                        <h2>步骤 2: 编辑问题列表</h2>
                        <p className="step-description">您可以编辑、删除或添加问题</p>
                        
                        <div className="questions-list">
                            {questionList.map((question, index) => (
                                <div key={index} className="question-item">
                                    <div className="question-header">
                                        <span className="question-number">问题 {index + 1}</span>
                                        <button
                                            onClick={() => handleRemoveQuestion(index)}
                                            className="btn btn-danger btn-small"
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <textarea
                                        value={question}
                                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                                        placeholder="输入问题内容..."
                                        className="question-textarea"
                                        rows={3}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="question-actions">
                            <button
                                onClick={handleAddQuestion}
                                className="btn btn-secondary"
                            >
                                + 添加问题
                            </button>
                        </div>

                        <div className="step-navigation">
                            <button
                                onClick={resetForm}
                                className="btn btn-secondary"
                            >
                                重新开始
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={questionList.length === 0}
                                className="btn btn-primary"
                            >
                                继续下一步
                            </button>
                        </div>
                    </div>
                )}

                {/* 步骤3: 设置主题并上传 */}
                {currentStep === 3 && (
                    <div className="step-content">
                        <h2>步骤 3: 设置主题并保存到数据库</h2>
                        <div className="form-group">
                            <label htmlFor="topic">主题 *</label>
                            <input
                                type="text"
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="请输入问题主题"
                                className="form-input"
                            />
                        </div>

                        <div className="summary">
                            <h3>上传摘要</h3>
                            <p><strong>问题数量：</strong>{questionList.length} 个</p>
                            <p><strong>主题：</strong>{topic || '未设置'}</p>
                        </div>

                        <div className="step-navigation">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="btn btn-secondary"
                            >
                                返回编辑
                            </button>
                            <button
                                onClick={handleUploadToDatabase}
                                disabled={loading || !topic.trim() || questionList.length === 0}
                                className="btn btn-primary"
                            >
                                {loading ? '上传中...' : '上传到数据库'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionUpload; 