import { mainApi, questionManagementApi } from '../config/config';
import { handleApiError } from '../config/apiInstance';
import { useState } from 'react';

// API请求状态接口
interface ApiState<T = any> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// useApi Hook - 用于处理API请求的通用Hook
export const useApi = <T = any>() => {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    // 发起API请求的通用方法
    const request = async <R = T>(
        apiCall: () => Promise<any>,
        options?: {
            onSuccess?: (data: R) => void;
            onError?: (error: string) => void;
            suppressError?: boolean; // 是否抑制错误更新到state
        }
    ): Promise<{ success: boolean; data?: R; error?: string }> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await apiCall();
            const responseData = response.data;

            setState({
                data: responseData,
                loading: false,
                error: null,
            });

            if (options?.onSuccess) {
                options.onSuccess(responseData);
            }

            return { success: true, data: responseData };
        } catch (error: any) {
            const errorMessage = handleApiError(error);
            
            if (!options?.suppressError) {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                }));
            } else {
                setState(prev => ({ ...prev, loading: false }));
            }

            if (options?.onError) {
                options.onError(errorMessage);
            }

            return { success: false, error: errorMessage };
        }
    };

    // 清除错误状态
    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    // 重置状态
    const reset = () => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    };

    return {
        ...state,
        request,
        clearError,
        reset,
    };
};

// 主API实例的便捷方法
export const useMainApi = () => {
    const apiHook = useApi();

    return {
        ...apiHook,
        get: (url: string, config?: any) => 
            apiHook.request(() => mainApi.get(url, config)),
        post: (url: string, data?: any, config?: any) => 
            apiHook.request(() => mainApi.post(url, data, config)),
        put: (url: string, data?: any, config?: any) => 
            apiHook.request(() => mainApi.put(url, data, config)),
        delete: (url: string, config?: any) => 
            apiHook.request(() => mainApi.delete(url, config)),
        patch: (url: string, data?: any, config?: any) => 
            apiHook.request(() => mainApi.patch(url, data, config)),
    };
};

// 问题管理API实例的便捷方法
export const useQuestionManagementApi = () => {
    const apiHook = useApi();

    return {
        ...apiHook,
        get: (url: string, config?: any) => 
            apiHook.request(() => questionManagementApi.get(url, config)),
        post: (url: string, data?: any, config?: any) => 
            apiHook.request(() => questionManagementApi.post(url, data, config)),
        put: (url: string, data?: any, config?: any) => 
            apiHook.request(() => questionManagementApi.put(url, data, config)),
        delete: (url: string, config?: any) => 
            apiHook.request(() => questionManagementApi.delete(url, config)),
        patch: (url: string, data?: any, config?: any) => 
            apiHook.request(() => questionManagementApi.patch(url, data, config)),
    };
};

// 导出API实例供直接使用
export { mainApi, questionManagementApi };
