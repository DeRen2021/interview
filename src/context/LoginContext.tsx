import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type UserDocument } from '../type/user.type';
import { type ObjectId } from '../type/common';
import { authUserEndpoint, updateUserNameEndpoint, getUserProfileEndpoint,
    updateUserLikedTopicsEndpoint, updateUserLikedQuestionsEndpoint, mainApi } from '../config/config';
import { TokenManager, handleApiError } from '../config/apiInstance';

interface LoginContextType {
    // 用户状态
    user: UserDocument | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    
    // 错误状态
    loginError: string | null;
    clearLoginError: () => void;
    
    // 方法
    login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
    logout: () => void;
    getCurrentUser: () => UserDocument | null;
    getCurrentUserProfile: () => Promise<void>;
    
    // 更新用户信息的方法
    updateUsername: (newUsername: string) => Promise<boolean>;

    updateLikedTopics: (add:boolean,topicId: ObjectId, ) => Promise<boolean>;

    updateLikedQuestions: (add:boolean,questionId: ObjectId) => Promise<boolean>;
    
    // 便捷检查方法
    isTopicLiked: (topicId: ObjectId) => boolean;
    isQuestionLiked: (questionId: ObjectId) => boolean;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

interface LoginProviderProps {
    children: ReactNode;
}

export const LoginProvider: React.FC<LoginProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserDocument | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loginError, setLoginError] = useState<string | null>(null);

    // 从localStorage恢复用户状态
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                // 确保用户数据包含必要的字段，如果不存在则初始化为空数组
                const normalizedUserData = {
                    ...userData,
                    likedTopics: userData.likedTopics || [],
                    likedQuestions: userData.likedQuestions || []
                };
                setUser(normalizedUserData);
                
                // 如果用户数据包含token，则设置到TokenManager中
                if (normalizedUserData.token) {
                    TokenManager.setToken(normalizedUserData.token);
                }
                
                // 更新localStorage中的数据
                localStorage.setItem('currentUser', JSON.stringify(normalizedUserData));
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('currentUser');
                TokenManager.removeToken();
            }
        }
        setIsLoading(false);
        
        // 监听token过期事件
        const handleAuthExpired = () => {
            console.log('检测到认证过期，清除用户状态');
            setUser(null);
            setLoginError('登录已过期，请重新登录');
        };
        
        window.addEventListener('auth-expired', handleAuthExpired);
        
        return () => {
            window.removeEventListener('auth-expired', handleAuthExpired);
        };
    }, []);

    // 登录验证（调用后端API）
    const login = async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
        setIsLoading(true);
        setLoginError(null); // 清除之前的错误
        
        try {
            const response = await mainApi.post(authUserEndpoint, { email, password });
            // console.log('API响应:', response.data);
            
            if (response.status === 200 && response.data.success) {
                const userData = response.data.data;
                
                // 如果后端返回了token，保存它
                if (userData.token) {
                    TokenManager.setToken(userData.token);
                }
                
                setUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
                console.log('规范化后的用户数据:', userData);
                setLoginError(null); // 清除错误
                return { success: true };
            }else{
                const errorMsg = '登录失败，请检查邮箱和密码';
                setLoginError(errorMsg);
                return { success: false, error: errorMsg };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMsg = handleApiError(error);
            setLoginError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        setUser(null);
        setLoginError(null);
        localStorage.removeItem('currentUser');
        TokenManager.removeToken(); // 清除JWT token
    };

    const clearLoginError = (): void => {
        setLoginError(null);
    };

    const getCurrentUser = (): UserDocument | null => {
        return user;
    };

    const getCurrentUserProfile = async(): Promise<void> => {
        try {
            const response = await mainApi.get(getUserProfileEndpoint);
            if (response.status === 200 && response.data.success) {
                const updatedUserData = response.data.data;
                setUser(updatedUserData);
                localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
            }
        } catch (error) {
            console.error('Get user profile error:', error);
            // 如果获取用户资料失败，不需要清除用户状态
        }
    };

    // 更新用户名
    const updateUsername = async (newUsername: string): Promise<boolean> => {
        if (!user) return false;
        
        try {
            const response = await mainApi.put(updateUserNameEndpoint, { 
                userId: user._id, 
                username: newUsername 
            });
            
            if (response.status === 200) {
                const updatedUser = { ...user, username: newUsername };
                setUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update username error:', error);
            return false;
        }
    };

    // 更新喜欢的主题
    const updateLikedTopics = async (add:boolean,topicId: ObjectId): Promise<boolean> => {
        if (!user) return false;
        
        try {
            const response = await mainApi.put(updateUserLikedTopicsEndpoint, {
                add,
                likedTopicId:topicId,
            });
            
            if (response.status === 200) {
                // 确保 likedTopics 存在，如果不存在则初始化为空数组
                let updatedLikedTopics = [...(user.likedTopics || [])];
                
                if (add && !updatedLikedTopics.includes(topicId)) {
                    updatedLikedTopics.push(topicId);
                } else if (!add) {
                    updatedLikedTopics = updatedLikedTopics.filter(id => id !== topicId);
                }
                
                const updatedUser = { ...user, likedTopics: updatedLikedTopics };
                setUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update liked topics error:', error);
            return false;
        }
    };

    // 更新喜欢的问题
    const updateLikedQuestions = async (add:boolean,questionId: ObjectId): Promise<boolean> => {
        if (!user) return false;
        
        try {
            const response = await mainApi.put(updateUserLikedQuestionsEndpoint, {
                add,
                likedQuestionId:questionId,
            });
            
            if (response.status === 200) {
                // 确保 likedQuestions 存在，如果不存在则初始化为空数组
                let updatedLikedQuestions = [...(user.likedQuestions || [])];
                
                if (add && !updatedLikedQuestions.includes(questionId)) {
                    updatedLikedQuestions.push(questionId);
                } else if (!add) {
                    updatedLikedQuestions = updatedLikedQuestions.filter(id => id !== questionId);
                }
                
                const updatedUser = { ...user, likedQuestions: updatedLikedQuestions };
                setUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update liked questions error:', error);
            return false;
        }
    };

    // 检查主题是否被喜欢
    const isTopicLiked = (topicId: ObjectId): boolean => {
        if (!user || !user.likedTopics) return false;
        return user.likedTopics.includes(topicId);
    };

    // 检查问题是否被喜欢
    const isQuestionLiked = (questionId: ObjectId): boolean => {
        if (!user || !user.likedQuestions) return false;
        return user.likedQuestions.includes(questionId);
    };

    const contextValue: LoginContextType = {
        user,
        isLoggedIn: !!user,
        isLoading,
        loginError,
        clearLoginError,
        login,
        logout,
        getCurrentUser,
        updateUsername,
        updateLikedTopics,
        updateLikedQuestions,
        isTopicLiked,
        isQuestionLiked,
        getCurrentUserProfile
    };

    return (
        <LoginContext.Provider value={contextValue}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = (): LoginContextType => {
    const context = useContext(LoginContext);
    if (context === undefined) {
        throw new Error('useLogin must be used within a LoginProvider');
    }
    return context;
}; 