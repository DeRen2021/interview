import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { baseUrl, questionManagementBaseUrl } from './baseConfig';

// JWT Token 管理类
class TokenManager {
    private static readonly TOKEN_KEY = 'auth_token';
    
    static setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }
    
    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    
    static removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }
    
    static hasToken(): boolean {
        return !!this.getToken();
    }
}

// 创建API实例的通用配置
const createApiInstance = (baseURL: string,timeout: number = 20000): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        timeout:timeout, // 10秒超时
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // 请求拦截器 - 自动添加JWT token
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = TokenManager.getToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            console.error('请求拦截器错误:', error);
            return Promise.reject(error);
        }
    );

    // 响应拦截器 - 处理token过期等情况
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error) => {
            // 如果token过期或无效，清除本地token
            if (error.response?.status === 401) {
                console.warn('Token已过期或无效，正在清除本地认证信息');
                TokenManager.removeToken();
                
                // 可以在这里触发用户重新登录的逻辑
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    localStorage.removeItem('currentUser');
                    // 如果需要，可以在这里触发全局状态更新
                    window.dispatchEvent(new CustomEvent('auth-expired'));
                }
            }
            
            return Promise.reject(error);
        }
    );

    return instance;
};

// 创建主API实例 (端口3000)
export const mainApi = createApiInstance(baseUrl);

// 创建问题管理API实例 (端口6432)
export const questionManagementApi = createApiInstance(questionManagementBaseUrl,300000);

// 导出Token管理器
export { TokenManager };


// API响应类型定义
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// 通用API错误处理
export const handleApiError = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    
    switch (error.response?.status) {
        case 400:
            return '请求参数错误';
        case 401:
            return '未授权访问，请重新登录';
        case 403:
            return '权限不足';
        case 404:
            return '请求的资源不存在';
        case 429:
            return '请求过于频繁，请稍后重试';
        case 500:
            return '服务器内部错误';
        case 502:
            return '网关错误';
        case 503:
            return '服务暂时不可用';
        default:
            if (!error.response) {
                return '网络连接失败，请检查网络设置';
            }
            return '未知错误，请稍后重试';
    }
};
