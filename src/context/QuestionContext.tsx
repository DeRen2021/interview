import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type QuestionType } from '../type/question.type';
import { type TopicType } from '../type/topic.type';
import { 
    baseUrl, 
    getAllQuestionTypesEndpoint, 
    getQuestionByTopicEndpoint,
    getPrivateTopicEndpoint,
    getPrivateQuestionByTopicEndpoint
} from '../config/config';
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
    // 公共问题类型相关
    questionTypes: TopicType[];
    topicsLoading: boolean;
    typesError: string | null;
    
    // 私有问题类型相关
    privateTopics: TopicType[];
    privateTopicsLoading: boolean;
    privateTopicsError: string | null;
    
    // 问题数据相关
    questionsCache: Record<string, QuestionType[]>;
    questionsLoading: Record<string, boolean>;
    questionsError: Record<string, string | null>;
    
    // 私有问题数据相关
    privateQuestionsCache: Record<string, QuestionType[]>;
    privateQuestionsLoading: Record<string, boolean>;
    privateQuestionsError: Record<string, string | null>;
    
    // 公共方法
    loadQuestionTopics: () => Promise<void>;
    loadQuestionsByTopic: (type: string) => Promise<void>;
    loadAllTopicsQuestions: () => Promise<void>;
    getQuestionsForTopic: (type: string) => QuestionType[];
    getAllQuestions: () => QuestionType[];
    getQuestionById: (type: string, id: string) => QuestionType | null;
    isTypeLoading: (type: string) => boolean;
    getTypeError: (type: string) => string | null;
    clearTypeError: (type: string) => void;
    refreshQuestionTypes: () => Promise<void>;
    
    // 私有方法（懒加载）
    loadPrivateTopics: () => Promise<void>;
    loadPrivateQuestionsByTopic: (type: string) => Promise<void>;
    loadAllPrivateTopicsQuestions: () => Promise<void>;
    getPrivateQuestionsForTopic: (type: string) => QuestionType[];
    getAllPrivateQuestions: () => QuestionType[];
    getPrivateQuestionById: (type: string, id: string) => QuestionType | null;
    isPrivateTypeLoading: (type: string) => boolean;
    getPrivateTypeError: (type: string) => string | null;
    clearPrivateTypeError: (type: string) => void;
    refreshPrivateTopics: () => Promise<void>;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

interface QuestionProviderProps {
    children: ReactNode;
}

export const QuestionProvider: React.FC<QuestionProviderProps> = ({ children }) => {
    // 公共问题类型状态
    const [questionTopics, setQuestionTopics] = useState<TopicType[]>([]);
    const [topicsLoading, setTopicsLoading] = useState<boolean>(true);
    const [topicsError, setTopicsError] = useState<string | null>(null);
    
    // 私有问题类型状态（懒加载）
    const [privateTopics, setPrivateTopics] = useState<TopicType[]>([]);
    const [privateTopicsLoading, setPrivateTopicsLoading] = useState<boolean>(false);
    const [privateTopicsError, setPrivateTopicsError] = useState<string | null>(null);
    const [privateTopicsLoaded, setPrivateTopicsLoaded] = useState<boolean>(false);
    
    // 公共问题数据缓存
    const [questionsCache, setQuestionsCache] = useState<Record<string, QuestionType[]>>({});
    const [questionsLoading, setQuestionsLoading] = useState<Record<string, boolean>>({});
    const [questionsError, setQuestionsError] = useState<Record<string, string | null>>({});
    
    // 私有问题数据缓存
    const [privateQuestionsCache, setPrivateQuestionsCache] = useState<Record<string, QuestionType[]>>({});
    const [privateQuestionsLoading, setPrivateQuestionsLoading] = useState<Record<string, boolean>>({});
    const [privateQuestionsError, setPrivateQuestionsError] = useState<Record<string, string | null>>({});



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

    // 私有话题懒加载方法
    const loadPrivateTopics = async (): Promise<void> => {
        // 如果已经加载过，直接返回
        if (privateTopicsLoaded) {
            return;
        }

        // 如果正在加载中，等待加载完成
        if (privateTopicsLoading) {
            return new Promise((resolve) => {
                const checkLoading = () => {
                    if (!privateTopicsLoading) {
                        resolve();
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
        }

        setPrivateTopicsLoading(true);
        setPrivateTopicsError(null);
        
        try {
            const response = await mainApi.get<TopicApiResponse>(`${baseUrl}${getPrivateTopicEndpoint}`);
            console.log('Private topics API response:', response.data);
            if (response.data && response.data.data && response.data.data.length > 0) {
                console.log('Private topics data:', response.data.data);
                setPrivateTopics(response.data.data);
                setPrivateTopicsLoaded(true);
            } else {
                console.log('No private topics found');
                setPrivateTopics([]);
                setPrivateTopicsLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching private topics:', error);
            setPrivateTopics([]);
            setPrivateTopicsError('无法获取私有话题');
        } finally {
            setPrivateTopicsLoading(false);
        }
    };

    const refreshPrivateTopics = async (): Promise<void> => {
        setPrivateTopicsLoaded(false); // 重置加载标记以强制重新加载
        await loadPrivateTopics();
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

    // 私有问题懒加载方法
    const loadPrivateQuestionsByTopic = async (topic: string): Promise<void> => {
        // 如果已经有缓存数据，直接返回
        if (privateQuestionsCache[topic]) {
            return;
        }
        
        // 如果正在加载中，等待加载完成
        if (privateQuestionsLoading[topic]) {
            return new Promise((resolve) => {
                const checkLoading = () => {
                    if (!privateQuestionsLoading[topic]) {
                        resolve();
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
        }

        // 设置加载状态
        setPrivateQuestionsLoading(prev => ({ ...prev, [topic]: true }));
        setPrivateQuestionsError(prev => ({ ...prev, [topic]: null }));

        try {
            const response = await mainApi.get<ApiResponse>(`${baseUrl}${getPrivateQuestionByTopicEndpoint}${topic}`);
            console.log('Private questions fetched successfully:', response.data, response.data.data.length);
            if (response.data.success) {
                // 将数据存入缓存
                setPrivateQuestionsCache(prev => ({
                    ...prev,
                    [topic]: response.data.data
                }));
            } else {
                setPrivateQuestionsError(prev => ({
                    ...prev,
                    [topic]: '获取私有问题失败'
                }));
            }
        } catch (error) {
            console.error(`Error fetching private questions for type ${topic}:`, error);
            setPrivateQuestionsError(prev => ({
                ...prev,
                [topic]: '连接服务器失败'
            }));
        } finally {
            setPrivateQuestionsLoading(prev => ({ ...prev, [topic]: false }));
        }
    };

    // 加载所有私有话题的问题
    const loadAllPrivateTopicsQuestions = async (): Promise<void> => {
        // 先确保私有话题已加载
        await loadPrivateTopics();
        // 并行加载所有私有话题的问题
        const loadPromises = privateTopics.map(topic => loadPrivateQuestionsByTopic(topic.topic));
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

    // 私有数据获取方法
    const getPrivateQuestionsForTopic = (type: string): QuestionType[] => {
        return privateQuestionsCache[type] || [];
    };

    // 获取所有私有问题（合并所有话题）
    const getAllPrivateQuestions = (): QuestionType[] => {
        const allQuestions: QuestionType[] = [];
        privateTopics.forEach(topic => {
            const topicQuestions = privateQuestionsCache[topic.topic] || [];
            allQuestions.push(...topicQuestions);
        });
        return allQuestions;
    };

    const getPrivateQuestionById = (type: string, id: string): QuestionType | null => {
        const questions = privateQuestionsCache[type];
        if (!questions || questions.length === 0) {
            return null;
        }
        return questions.find(question => question._id === id) || null;
    };

    const isPrivateTypeLoading = (type: string): boolean => {
        return privateQuestionsLoading[type] || false;
    };

    const getPrivateTypeError = (type: string): string | null => {
        return privateQuestionsError[type] || null;
    };

    const clearPrivateTypeError = (type: string): void => {
        setPrivateQuestionsError(prev => ({ ...prev, [type]: null }));
    };

    const contextValue: QuestionContextType = {
        // 公共问题类型相关
        questionTypes: questionTopics,
        topicsLoading,
        typesError: topicsError,
        
        // 私有问题类型相关
        privateTopics,
        privateTopicsLoading,
        privateTopicsError,
        
        // 公共问题数据相关
        questionsCache,
        questionsLoading,
        questionsError,
        
        // 私有问题数据相关
        privateQuestionsCache,
        privateQuestionsLoading,
        privateQuestionsError,
        
        // 公共方法
        loadQuestionTopics,
        loadQuestionsByTopic,
        loadAllTopicsQuestions,
        getQuestionsForTopic,
        getAllQuestions,
        getQuestionById,
        isTypeLoading,
        getTypeError,
        clearTypeError,
        refreshQuestionTypes,
        
        // 私有方法（懒加载）
        loadPrivateTopics,
        loadPrivateQuestionsByTopic,
        loadAllPrivateTopicsQuestions,
        getPrivateQuestionsForTopic,
        getAllPrivateQuestions,
        getPrivateQuestionById,
        isPrivateTypeLoading,
        getPrivateTypeError,
        clearPrivateTypeError,
        refreshPrivateTopics
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