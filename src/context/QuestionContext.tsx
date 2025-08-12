import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type QuestionType } from '../type/question.type';
import { type TopicType } from '../type/topic.type';
import { baseUrl, getAllQuestionTypesEndpoint, getQuestionByTopicEndpoint } from '../config/config';
import { mainApi } from '../config/apiInstance';

interface ApiResponse {
    success: boolean;
    data: QuestionType[];
    count: number;
}

interface TopicApiResponse {
    success: boolean;
    data: TopicType[];
}

interface QuestionContextType {
    // 问题类型相关
    questionTypes: TopicType[];
    topicsLoading: boolean;
    typesError: string | null;
    
    // 问题数据相关
    questionsCache: Record<string, QuestionType[]>;
    questionsLoading: Record<string, boolean>;
    questionsError: Record<string, string | null>;
    
    // 方法
    loadQuestionTopics: () => Promise<void>;
    loadQuestionsByTopic: (type: string) => Promise<void>;
    loadAllTopicsQuestions: () => Promise<void>;
    getQuestionsForTopic: (type: string) => QuestionType[];
    getAllQuestions: () => QuestionType[];
    getQuestionById: (type: string,id: string) => QuestionType | null;
    isTypeLoading: (type: string) => boolean;
    getTypeError: (type: string) => string | null;
    clearTypeError: (type: string) => void;
    refreshQuestionTypes: () => Promise<void>;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

interface QuestionProviderProps {
    children: ReactNode;
}

export const QuestionProvider: React.FC<QuestionProviderProps> = ({ children }) => {
    // 问题类型状态
    const [questionTopics, setQuestionTopics] = useState<TopicType[]>([]);
    const [topicsLoading, setTopicsLoading] = useState<boolean>(true);
    const [topicsError, setTopicsError] = useState<string | null>(null);
    
    // 问题数据缓存
    const [questionsCache, setQuestionsCache] = useState<Record<string, QuestionType[]>>({});
    const [questionsLoading, setQuestionsLoading] = useState<Record<string, boolean>>({});
    const [questionsError, setQuestionsError] = useState<Record<string, string | null>>({});



    // 初始化加载问题类型
    useEffect(() => {
        loadQuestionTopics();
    }, []);

    const loadQuestionTopics = async (): Promise<void> => {
        setTopicsLoading(true);
        setTopicsError(null);
        
        try {
            const response = await mainApi.get<TopicApiResponse>(`${baseUrl}${getAllQuestionTypesEndpoint}`);
            // console.log('Question types fetched successfully:', response.data,response.data.data.length);
            if (response.data && response.data.data.length > 0) {
                setQuestionTopics(response.data.data);
            } else {
                console.error('No question types found');
                setQuestionTopics([]);
                setTopicsError('No question types found');
            }
        } catch (error) {
            console.error('Error fetching question types:', error);
            // 如果API调用失败，使用默认类型
            setQuestionTopics([]);
            setTopicsError('无法连接到服务器');
        } finally {
            setTopicsLoading(false);
        }
    };

    const refreshQuestionTypes = async (): Promise<void> => {
        await loadQuestionTopics();
    };

    const loadQuestionsByTopic = async (topic: string): Promise<void> => {
        // 如果已经有缓存数据，直接返回
        if (questionsCache[topic]) {
            return;
        }
        
        // 如果正在加载中，等待加载完成
        if (questionsLoading[topic]) {
            // 等待加载完成
            return new Promise((resolve) => {
                const checkLoading = () => {
                    if (!questionsLoading[topic]) {
                        resolve();
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
        }

        // 设置加载状态
        setQuestionsLoading(prev => ({ ...prev, [topic]: true }));
        setQuestionsError(prev => ({ ...prev, [topic]: null }));

        try {
            const response = await mainApi.get<ApiResponse>(`${baseUrl}${getQuestionByTopicEndpoint}${topic}`);
            console.log('Questions fetched successfully:', response.data,response.data.data.length);
            if (response.data.success) {
                // 将数据存入缓存
                setQuestionsCache(prev => ({
                    ...prev,
                    [topic]: response.data.data
                }));
            } else {
                setQuestionsError(prev => ({
                    ...prev,
                    [topic]: '获取问题失败'
                }));
            }
        } catch (error) {
            console.error(`Error fetching questions for type ${topic}:`, error);
            setQuestionsError(prev => ({
                ...prev,
                [topic]: '连接服务器失败'
            }));
        } finally {
            setQuestionsLoading(prev => ({ ...prev, [topic]: false }));
        }
    };

    // 加载所有话题的问题
    const loadAllTopicsQuestions = async (): Promise<void> => {
        // 并行加载所有话题的问题
        const loadPromises = questionTopics.map(topic => loadQuestionsByTopic(topic.topic));
        await Promise.all(loadPromises);
    };

    const getQuestionsForTopic = (type: string): QuestionType[] => {
        return questionsCache[type] || [];
    };

    // 获取所有问题（合并所有话题）
    const getAllQuestions = (): QuestionType[] => {
        const allQuestions: QuestionType[] = [];
        questionTopics.forEach(topic => {
            const topicQuestions = questionsCache[topic.topic] || [];
            allQuestions.push(...topicQuestions);
        });
        return allQuestions;
    };

    const getQuestionById = (type: string,id: string): QuestionType | null => {
        const questions = questionsCache[type];
        if (!questions || questions.length === 0) {
            return null;
        }
        return questions.find(question => question._id === id) || null;
    };

    

    const isTypeLoading = (type: string): boolean => {
        return questionsLoading[type] || false;
    };

    const getTypeError = (type: string): string | null => {
        return questionsError[type] || null;
    };

    const clearTypeError = (type: string): void => {
        setQuestionsError(prev => ({ ...prev, [type]: null }));
    };

    const contextValue: QuestionContextType = {
        // 问题类型相关
        questionTypes: questionTopics,
        topicsLoading,
        typesError: topicsError,
        
        // 问题数据相关
        questionsCache,
        questionsLoading,
        questionsError,
        
        // 方法
        loadQuestionTopics,
        loadQuestionsByTopic,
        loadAllTopicsQuestions,
        getQuestionsForTopic,
        getAllQuestions,
        isTypeLoading,
        getTypeError,
        clearTypeError,
        refreshQuestionTypes,
        getQuestionById
    };

    return (
        <QuestionContext.Provider value={contextValue}>
            {children}
        </QuestionContext.Provider>
    );
};

export const useQuestion = (): QuestionContextType => {
    const context = useContext(QuestionContext);
    if (context === undefined) {
        throw new Error('useQuestion must be used within a QuestionProvider');
    }
    return context;
}; 