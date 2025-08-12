import React, { useState } from 'react';
import '../styles/component/QuestionUpload.css';
import { questionManagementApi, handleApiError } from '../config/apiInstance';
import { AxiosError } from 'axios';

interface UploadStep {
    step: number;
    title: string;
}

interface QAItem {
    question: string;
    answer: string;
}

const QuestionUpload: React.FC = () => {

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // 问题列表
    const [questionList, setQuestionList] = useState<QAItem[]>([]);
    const [topic, setTopic] = useState('');
    const [questionType, setQuestionType] = useState('frq');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // const [generatingAnswers, setGeneratingAnswers] = useState(false);

    const steps: UploadStep[] = [
        { step: 1, title: '上传文件' },
        { step: 2, title: '编辑问题' },
        // { step: 3, title: '生成答案' },
        { step: 3, title: '设置主题并保存' }
    ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setError('');
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError('请选择文件');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await questionManagementApi.post('/api/parse-frq-question', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("\n\n\n",response,"\n\n\n");
            
            let qaList: QAItem[] = [];
            
            if (response.data) {
                // 检查可能的字段名
                // console.log('question_list.question 是数组，长度:', response.data.question_list.question.length);
                qaList = response.data.question_list.question;

                if (qaList.length > 0) {
                    setQuestionList(qaList);
                    setCurrentStep(2);
                    const answersCount = qaList.filter((qa: QAItem) => qa.answer && qa.answer.trim()).length;
                    setSuccess(`文件解析成功！共解析出 ${qaList.length} 个问题${answersCount > 0 ? `，其中 ${answersCount} 个已有答案` : ''}`);
                } else {
                    setError('文件解析失败：未找到问题数据');
                }
            } else {
                setError('文件解析失败：响应数据为空');
            }
        } catch (err) {
            console.error('文件上传请求失败:', err);
            const error = err as AxiosError;
            console.error('错误详情:', error.response?.data);
            console.error('错误状态:', error.response?.status);
            setError(handleApiError(error));
        }

        setLoading(false);
    };

    const handleQuestionChange = (index: number, value: string) => {
        const updatedQuestions = [...questionList];
        updatedQuestions[index] = { ...updatedQuestions[index], question: value };
        setQuestionList(updatedQuestions);
    };

    // const handleAnswerChange = (index: number, value: string) => {
    //     const updatedQuestions = [...questionList];
    //     updatedQuestions[index] = { ...updatedQuestions[index], answer: value };
    //     setQuestionList(updatedQuestions);
    // };

    const handleRemoveQuestion = (index: number) => {
        const updatedQuestions = questionList.filter((_, i) => i !== index);
        setQuestionList(updatedQuestions);
    };

    const handleAddQuestion = () => {
        setQuestionList([...questionList, { question: '', answer: '' }]);
    };


    const handleUploadToDatabase = async () => {
        if (!topic.trim() || questionList.length === 0) {
            setError('请输入主题并确保至少有一个问题');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 准备问题和答案列表
            const questionTexts: string[] = [];
            const answerList: string[] = [];
            
            for (const qaItem of questionList) {
                if (qaItem.question.trim()) {
                    questionTexts.push(qaItem.question);
                    
                    if (qaItem.answer.trim()) {
                        answerList.push(qaItem.answer);
                    } else {
                        answerList.push('');
                    }
                }
            }

            const response = await questionManagementApi.post('/api/upload-question', {
                question_list: questionTexts,
                answer_list: answerList,
                topic: topic,
                type: questionType
            });

            if (response.data) {
                setSuccess('问题上传成功！');
                // 重置表单
                setTimeout(() => {
                    setCurrentStep(1);
                    setSelectedFile(null);
                    setQuestionList([]);
                    setTopic('');
                    setQuestionType('frq');
                    setSuccess('');
                }, 3000);
            }
        } catch (err) {
            const error = err as AxiosError;
            setError(handleApiError(error));
        }

        setLoading(false);
    };

    const resetForm = () => {
        setCurrentStep(1);
        setSelectedFile(null);
        setQuestionList([]);
        setTopic('');
        setQuestionType('frq');
        setError('');
        setSuccess('');
    };

    return (
        <div className="question-upload">

            <div className="upload-container">
                <header className="upload-header">
                    <h1 className="upload-title">问题上传管理</h1>
                    <div className="step-indicator">
                        {steps.map((stepInfo) => (
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
                            <label htmlFor="questionType">题目类型 *</label>
                            <select
                                id="questionType"
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="form-input"
                            >
                                <option value="frq">简答题 (FRQ)</option>
                                <option value="mcq">选择题 (MCQ)</option>
                            </select>
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
                            disabled={loading || !selectedFile}
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    解析中...
                                </>
                            ) : '解析文件'}
                        </button>
                    </div>
                )}

                {/* 步骤2: 编辑问题 */}
                {currentStep === 2 && (
                    <div className="step-content">
                        <h2>步骤 2: 编辑问题列表</h2>
                        <p className="step-description">您可以编辑、删除或添加问题</p>
                        
                        <div className="questions-list">
                            {questionList.map((qaItem, index) => (
                                <div key={index} className="question-item">
                                    <div className="question-header">
                                        <span className="question-number">问题 {index + 1}</span>
                                        {qaItem.answer && qaItem.answer.trim() && (
                                            <span className="answer-status">✅ 已有答案</span>
                                        )}
                                        <button
                                            onClick={() => handleRemoveQuestion(index)}
                                            className="btn btn-danger btn-small"
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div className="qa-content">
                                        <div className="question-section">
                                            <label>问题内容</label>
                                            <textarea
                                                value={qaItem.question}
                                                onChange={(e) => handleQuestionChange(index, e.target.value)}
                                                placeholder="输入问题内容..."
                                                className="question-textarea"
                                                rows={3}
                                            />
                                        </div>
                                        {qaItem.answer && qaItem.answer.trim() && (
                                            <div className="answer-section">
                                                <label>预设答案</label>
                                                <textarea
                                                    value={qaItem.answer}
                                                    placeholder="答案内容..."
                                                    className="answer-textarea"
                                                    rows={4}
                                                />
                                            </div>
                                        )}
                                    </div>
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

                

                {/* 步骤4: 设置主题并上传 */}
                {currentStep === 3 && (
                    <div className="step-content">
                        <h2>步骤 4: 设置主题并保存到数据库</h2>
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
                            <p><strong>题目类型：</strong>{questionType === 'frq' ? '简答题' : '选择题'}</p>
                            <p><strong>已有答案：</strong>{questionList.filter(qa => qa.answer && qa.answer.trim()).length} 个</p>
                            <p><strong>主题：</strong>{topic || '未设置'}</p>
                        </div>

                        <div className="step-navigation">
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="btn btn-secondary"
                            >
                                返回上一步
                            </button>
                            <button
                                onClick={handleUploadToDatabase}
                                disabled={loading || !topic.trim() || questionList.length === 0}
                                className="btn btn-primary"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        上传中...
                                    </>
                                ) : '上传到数据库'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionUpload; 