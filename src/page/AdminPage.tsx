import React, { useState, useEffect } from 'react';
import { type QuestionType } from '../type/question.type';
import { mainApi, questionManagementApi, handleApiError, type ApiResponse } from '../config/apiInstance';
import { updateQuestionEndpoint, generateAnswerEndpoint, generateExplanationEndpoint } from '../config/config';
import { useQuestion } from '../context/QuestionContext';
import '../styles/component/AdminPanel.css';

interface EditingQuestion extends QuestionType {
  isEditing?: boolean;
  generatedAnswer?: string;
  generatedExplanation?: string;
  showAnswerComparison?: boolean;
  showExplanationComparison?: boolean;
}

const AdminPanel: React.FC = () => {
  const {
    publicTopics: topics,
    loadQuestionTopics,
    loadQuestionsByTopic,
    loadAllTopicsQuestions,
    getQuestionsForTopic,
    getAllQuestions,
    topicsLoading,
    typesError
  } = useQuestion();

  const [questions, setQuestions] = useState<EditingQuestion[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [generatingAnswer, setGeneratingAnswer] = useState<string>(''); // 正在生成答案的问题ID
  const [generatingExplanation, setGeneratingExplanation] = useState<string>(''); // 正在生成解释的问题ID

  // 获取所有问题（所有话题的问题合并）
  const fetchAllQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      // 加载所有话题的问题
      await loadAllTopicsQuestions();
      
      // 获取合并后的所有问题
      const allQuestions = getAllQuestions();
      setQuestions(allQuestions.map(q => ({ ...q, isEditing: false })));
    } catch (err) {
      console.error('获取问题失败:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // 根据话题获取问题
  const fetchQuestionsByTopic = async (topic: string) => {
    setLoading(true);
    setError('');
    try {
      await loadQuestionsByTopic(topic);
      // 等待数据加载完成后再获取问题
      const topicQuestions = getQuestionsForTopic(topic);
      console.log("获取的问题数据:", topicQuestions);
      setQuestions(topicQuestions.map(q => ({ ...q, isEditing: false })));
    } catch (err) {
      console.error('获取问题失败:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // 更新问题
  const updateQuestion = async (questionId: string, updatedData: Partial<QuestionType>) => {
    try {
      setLoading(true);
      
      // 构建查询参数
      const queryParams = new URLSearchParams({
        question_id: questionId
      });
      
      // 根据后端API结构构建参数
      if (updatedData.question) {
        queryParams.append('question', updatedData.question);
      }
      if (updatedData.answer?.answer) {
        queryParams.append('answer', updatedData.answer.answer);
      }
      if (updatedData.answer?.explanation) {
        queryParams.append('explanation', updatedData.answer.explanation);
      }
      
      const response = await questionManagementApi.patch(
        `${updateQuestionEndpoint}?${queryParams.toString()}`
      );
      
      if (response.data.message) {
        setSuccess('问题更新成功！');
        setQuestions(prev => 
          prev.map(q => 
            q._id === questionId 
              ? { ...q, ...updatedData, isEditing: false }
              : q
          )
        );
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('更新问题失败:', err);
      setError(handleApiError(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // 删除问题
  const deleteQuestion = async (questionId: string) => {
    if (!window.confirm('确定要删除这个问题吗？此操作不可撤销。')) {
      return;
    }

    try {
      setLoading(true);
      const response = await mainApi.delete<ApiResponse>(
        `/api/questions/${questionId}`
      );
      
      if (response.data.success) {
        setSuccess('问题删除成功！');
        setQuestions(prev => prev.filter(q => q._id !== questionId));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('删除问题失败:', err);
      setError(handleApiError(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // 切换编辑模式
  const toggleEdit = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q._id === questionId
          ? { ...q, isEditing: !q.isEditing }
          : { ...q, isEditing: false }
      )
    );
  };

  // 处理字段更新
  const handleFieldUpdate = (questionId: string, field: string, value: any) => {
    setQuestions(prev =>
      prev.map(q =>
        q._id === questionId
          ? { ...q, [field]: value }
          : q
      )
    );
  };

  // 处理答案更新
  const handleAnswerUpdate = (questionId: string, answerField: 'answer' | 'explanation', value: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q._id === questionId
          ? {
              ...q,
              answer: {
                ...q.answer,
                [answerField]: value
              }
            }
          : q
      )
    );
  };

  // 保存更改
  const saveChanges = (question: EditingQuestion) => {
    if (!question._id) return;

    const { isEditing, generatedAnswer, generatedExplanation, showAnswerComparison, showExplanationComparison, ...questionData } = question;
    updateQuestion(question._id, questionData);
  };

  // 生成答案
  const generateAnswer = async (questionId: string, questionText: string, questionType: string) => {
    setGeneratingAnswer(questionId);
    try {
      const queryParams = new URLSearchParams({
        question: questionText,
        type: questionType === '选择题' ? 'mcq' : 'frq'
      });

      const requestUrl = `${generateAnswerEndpoint}?${queryParams.toString()}`;
      console.log('生成答案请求URL:', requestUrl);
      console.log('参数:', { question: questionText, type: questionType === '选择题' ? 'mcq' : 'frq' });

      const response = await questionManagementApi.post(requestUrl);

      if (response.data.answer) {
        let answerText = response.data.answer;
        
        // 处理各种可能的数据格式
        if (typeof answerText === 'object') {
          // 如果是对象，尝试提取answer字段
          answerText = answerText.answer || JSON.stringify(answerText);
        } else if (typeof answerText === 'string') {
          // 如果是JSON字符串，尝试解析
          if (answerText.startsWith('{"answer":') || answerText.startsWith('{')) {
            try {
              const parsed = JSON.parse(answerText);
              answerText = parsed.answer || answerText;
            } catch (e) {
              console.log('Failed to parse answer JSON:', e);
            }
          }
        }

        // 确保最终是字符串
        answerText = typeof answerText === 'string' ? answerText : String(answerText);

        setQuestions(prev =>
          prev.map(q =>
            q._id === questionId
              ? { 
                  ...q, 
                  generatedAnswer: answerText,
                  showAnswerComparison: true
                }
              : q
          )
        );
      }
    } catch (err) {
      console.error('生成答案失败:', err);
      setError(handleApiError(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingAnswer('');
    }
  };

  // 生成解释
  const generateExplanation = async (questionId: string, questionText: string, answerText: string) => {
    setGeneratingExplanation(questionId);
    try {
      const queryParams = new URLSearchParams({
        question: questionText,
        answer: answerText,
        type: 'frq'
      });

      const response = await questionManagementApi.post(
        `${generateExplanationEndpoint}?${queryParams.toString()}`
      );

      if (response.data.explanation) {
        let explanationText = response.data.explanation;
        
        // 处理各种可能的数据格式
        if (typeof explanationText === 'object') {
          // 如果是对象，尝试提取explanation字段
          explanationText = explanationText.explanation || JSON.stringify(explanationText);
        } else if (typeof explanationText === 'string') {
          // 如果是JSON字符串，尝试解析
          if (explanationText.startsWith('{"explanation":') || explanationText.startsWith('{')) {
            try {
              const parsed = JSON.parse(explanationText);
              explanationText = parsed.explanation || explanationText;
            } catch (e) {
              console.log('Failed to parse explanation JSON:', e);
            }
          }
        }

        // 确保最终是字符串
        explanationText = typeof explanationText === 'string' ? explanationText : String(explanationText);

        setQuestions(prev =>
          prev.map(q =>
            q._id === questionId
              ? { 
                  ...q, 
                  generatedExplanation: explanationText,
                  showExplanationComparison: true
                }
              : q
          )
        );
      }
    } catch (err) {
      console.error('生成解释失败:', err);
      setError(handleApiError(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingExplanation('');
    }
  };

  // 选择答案（保留原始或生成的）
  const selectAnswer = (questionId: string, useGenerated: boolean) => {
    setQuestions(prev =>
      prev.map(q =>
        q._id === questionId
          ? {
              ...q,
              answer: {
                ...q.answer,
                answer: useGenerated ? q.generatedAnswer! : q.answer.answer
              },
              generatedAnswer: undefined,
              showAnswerComparison: false
            }
          : q
      )
    );
  };

  // 选择解释（保留原始或生成的）
  const selectExplanation = (questionId: string, useGenerated: boolean) => {
    setQuestions(prev =>
      prev.map(q =>
        q._id === questionId
          ? {
              ...q,
              answer: {
                ...q.answer,
                explanation: useGenerated ? q.generatedExplanation! : q.answer.explanation
              },
              generatedExplanation: undefined,
              showExplanationComparison: false
            }
          : q
      )
    );
  };

  // 话题选择变更
  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    if (topic) {
      fetchQuestionsByTopic(topic);
    } else {
      fetchAllQuestions();
    }
  };

  // 初始化加载话题
  useEffect(() => {
    loadQuestionTopics();
  }, []);

  // 话题加载完成后加载所有问题
  useEffect(() => {
    if (topics.length > 0 && !selectedTopic) {
      fetchAllQuestions();
    }
  }, [topics]);

  // 处理错误状态
  useEffect(() => {
    if (typesError) {
      setError(typesError);
    }
  }, [typesError]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>问题管理</h1>
        <p>在此处管理所有面试问题，可以根据话题筛选、编辑或删除问题。</p>
      </div>

      {/* 消息提示 */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* 话题筛选器 */}
      <div className="topic-filter">
        <label htmlFor="topic-select">按话题筛选：</label>
        <select
          id="topic-select"
          value={selectedTopic}
          onChange={(e) => handleTopicChange(e.target.value)}
          className="topic-select"
        >
          <option value="">所有话题</option>
          {topics.map((topic) => (
            <option key={topic._id} value={topic.topic}>
              {topic.topic}
            </option>
          ))}
        </select>
        {selectedTopic && (
          <button
            onClick={() => handleTopicChange('')}
            className="clear-filter-btn"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 问题列表 */}
      <div className="questions-container">
        {(loading || topicsLoading) && <div className="loading">加载中...</div>}
        
        {!loading && !topicsLoading && questions.length === 0 && (
          <div className="no-questions">
            {selectedTopic ? `话题 "${selectedTopic}" 下没有找到问题` : '没有找到任何问题'}
          </div>
        )}

        {questions.map((question) => (
          <div key={question._id} className="question-card">
            <div className="question-header">
              <span className="question-topic">{question.topic}</span>
              <div className="question-actions">
                <button
                  onClick={() => toggleEdit(question._id!)}
                  className="edit-btn"
                >
                  {question.isEditing ? '取消' : '编辑'}
                </button>
                <button
                  onClick={() => deleteQuestion(question._id!)}
                  className="delete-btn"
                  disabled={loading}
                >
                  删除
                </button>
              </div>
            </div>

            <div className="question-content">
              {question.isEditing ? (
                <div className="edit-form">
                  {/* 问题内容编辑 */}
                  <div className="form-group">
                    <label>问题内容：</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleFieldUpdate(question._id!, 'question', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>

                  {/* 话题编辑 */}
                  <div className="form-group">
                    <label>话题：</label>
                    <select
                      value={question.topic}
                      onChange={(e) => handleFieldUpdate(question._id!, 'topic', e.target.value)}
                      className="form-select"
                    >
                      {topics.map((topic) => (
                        <option key={topic._id} value={topic.topic}>
                          {topic.topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 答案编辑 */}
                  <div className="form-group">
                    <label>标准答案：</label>
                    <textarea
                      value={question.answer.answer}
                      onChange={(e) => handleAnswerUpdate(question._id!, 'answer', e.target.value)}
                      className="form-textarea"
                      rows={4}
                    />
                    <button
                      type="button"
                      onClick={() => generateAnswer(question._id!, question.question, question.topic)}
                      className="generate-btn"
                      disabled={generatingAnswer === question._id}
                      style={{ marginTop: '8px' }}
                    >
                      {generatingAnswer === question._id ? '生成中...' : '生成答案'}
                    </button>
                  </div>

                  {/* 解释编辑 */}
                  <div className="form-group">
                    <label>答案解释：</label>
                    <textarea
                      value={question.answer.explanation}
                      onChange={(e) => handleAnswerUpdate(question._id!, 'explanation', e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                    <button
                      type="button"
                      onClick={() => generateExplanation(question._id!, question.question, question.answer.answer)}
                      className="generate-btn"
                      disabled={generatingExplanation === question._id}
                      style={{ marginTop: '8px' }}
                    >
                      {generatingExplanation === question._id ? '生成中...' : '生成解释'}
                    </button>
                  </div>

                  {/* 答案比较功能 */}
                  {question.showAnswerComparison && question.generatedAnswer && (
                    <div className="comparison-section">
                      <h4>答案比较</h4>
                      <div className="comparison-content">
                        <div className="original-content">
                          <strong>原始答案：</strong>
                          <p>{question.answer.answer}</p>
                        </div>
                        <div className="generated-content">
                          <strong>生成的答案：</strong>
                          <p>{typeof question.generatedAnswer === 'string' ? question.generatedAnswer : JSON.stringify(question.generatedAnswer)}</p>
                        </div>
                      </div>
                      <div className="comparison-actions">
                        <button
                          type="button"
                          onClick={() => selectAnswer(question._id!, false)}
                          className="keep-original-btn"
                        >
                          保留原始答案
                        </button>
                        <button
                          type="button"
                          onClick={() => selectAnswer(question._id!, true)}
                          className="use-generated-btn"
                        >
                          使用生成的答案
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 解释比较功能 */}
                  {question.showExplanationComparison && question.generatedExplanation && (
                    <div className="comparison-section">
                      <h4>解释比较</h4>
                      <div className="comparison-content">
                        <div className="original-content">
                          <strong>原始解释：</strong>
                          <p>{question.answer.explanation || '无原始解释'}</p>
                        </div>
                        <div className="generated-content">
                          <strong>生成的解释：</strong>
                          <p>{typeof question.generatedExplanation === 'string' ? question.generatedExplanation : JSON.stringify(question.generatedExplanation)}</p>
                        </div>
                      </div>
                      <div className="comparison-actions">
                        <button
                          type="button"
                          onClick={() => selectExplanation(question._id!, false)}
                          className="keep-original-btn"
                        >
                          保留原始解释
                        </button>
                        <button
                          type="button"
                          onClick={() => selectExplanation(question._id!, true)}
                          className="use-generated-btn"
                        >
                          使用生成的解释
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FAQ 标记 */}
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={question.faq || false}
                        onChange={(e) => handleFieldUpdate(question._id!, 'faq', e.target.checked)}
                      />
                      标记为常见问题 (FAQ)
                    </label>
                  </div>

                  {/* 保存按钮 */}
                  <div className="form-actions">
                    <button
                      onClick={() => saveChanges(question)}
                      className="save-btn"
                      disabled={loading}
                    >
                      保存更改
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-mode">
                  <div className="question-text">
                    <strong>问题：</strong>
                    <p>{question.question}</p>
                  </div>
                  
                  <div className="answer-section">
                    <strong>标准答案：</strong>
                    <p>{question.answer.answer}</p>
                    
                    {question.answer.explanation && (
                      <>
                        <strong>解释：</strong>
                        <p>{question.answer.explanation}</p>
                      </>
                    )}
                  </div>

                  {question.accuracy && (
                    <div className="accuracy-stats">
                      <strong>准确性统计：</strong>
                      <span>
                        {question.accuracy.correctAttempts}/{question.accuracy.totalAttempts} 
                        ({Math.round((question.accuracy.correctAttempts / question.accuracy.totalAttempts) * 100)}%)
                      </span>
                    </div>
                  )}

                  {question.faq && (
                    <div className="faq-badge">FAQ</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
