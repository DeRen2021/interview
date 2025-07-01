import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { type QuestionType } from '../type/question.type';
import { type QuestionTypeType } from '../type/questionType.type';
import { baseUrl, getAllQuestionTypesEndpoint, getQuestionByTypeEndpoint } from '../config/config';

interface ApiResponse {
    success: boolean;
    data: QuestionType[];
    count: number;
}

interface QuestionTypesApiResponse {
    success: boolean;
    data: QuestionTypeType[];
}

interface QuestionContextType {
    // 问题类型相关
    questionTypes: QuestionTypeType[];
    typesLoading: boolean;
    typesError: string | null;
    
    // 问题数据相关
    questionsCache: Record<string, QuestionType[]>;
    questionsLoading: Record<string, boolean>;
    questionsError: Record<string, string | null>;
    
    // 方法
    loadQuestionsByType: (type: string) => Promise<void>;
    getQuestionsForType: (type: string) => QuestionType[];
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
    const [questionTypes, setQuestionTypes] = useState<QuestionTypeType[]>([]);
    const [typesLoading, setTypesLoading] = useState<boolean>(true);
    const [typesError, setTypesError] = useState<string | null>(null);
    
    // 问题数据缓存
    const [questionsCache, setQuestionsCache] = useState<Record<string, QuestionType[]>>({});
    const [questionsLoading, setQuestionsLoading] = useState<Record<string, boolean>>({});
    const [questionsError, setQuestionsError] = useState<Record<string, string | null>>({});



    // 初始化加载问题类型
    useEffect(() => {
        loadQuestionTypes();
    }, []);

    const loadQuestionTypes = async () => {
        setTypesLoading(true);
        setTypesError(null);
        
        try {
            const response = await axios.get<QuestionTypesApiResponse>(`${baseUrl}${getAllQuestionTypesEndpoint}`);
            console.log('Question types fetched successfully:', response.data,response.data.data.length);
            if (response.data && response.data.data.length > 0) {
                
                setQuestionTypes(response.data.data);
                
            } else {
                console.error('No question types found');
                setQuestionTypes([]);
                setTypesError('No question types found');
            }
        } catch (error) {
            console.error('Error fetching question types:', error);
            // 如果API调用失败，使用默认类型
            setQuestionTypes([]);
            setTypesError('无法连接到服务器');
        } finally {
            setTypesLoading(false);
        }
    };

    const refreshQuestionTypes = async (): Promise<void> => {
        await loadQuestionTypes();
    };

    const loadQuestionsByType = async (type: string): Promise<void> => {
        // 如果已经在加载中或者已经有缓存数据，则不重复请求
        if (questionsLoading[type] || questionsCache[type]) {
            return;
        }

        // 设置加载状态
        setQuestionsLoading(prev => ({ ...prev, [type]: true }));
        setQuestionsError(prev => ({ ...prev, [type]: null }));

        try {
            const response = await axios.get<ApiResponse>(`${baseUrl}${getQuestionByTypeEndpoint}${type}`);
            
            if (response.data.success) {
                // 将数据存入缓存
                setQuestionsCache(prev => ({
                    ...prev,
                    [type]: response.data.data
                }));
            } else {
                setQuestionsError(prev => ({
                    ...prev,
                    [type]: '获取问题失败'
                }));
            }
        } catch (error) {
            console.error(`Error fetching questions for type ${type}:`, error);
            setQuestionsError(prev => ({
                ...prev,
                [type]: '连接服务器失败'
            }));
        } finally {
            setQuestionsLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const getQuestionById = (type: string,id: string): QuestionType | null => {
        const questions = questionsCache[type];
        if (!questions || questions.length === 0) {
            return null;
        }
        return questions.find(question => question._id === id) || null;
    };

    const getQuestionsForType = (type: string): QuestionType[] => {
        return questionsCache[type] || [];
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
        questionTypes,
        typesLoading,
        typesError,
        
        // 问题数据相关
        questionsCache,
        questionsLoading,
        questionsError,
        
        // 方法
        loadQuestionsByType,
        getQuestionsForType,
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