// 基础配置文件 - 只包含URL定义，避免循环依赖
export const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/';
export const questionManagementBaseUrl = import.meta.env.VITE_QUESTION_MANAGEMENT_BASE_URL || 'http://localhost:6432/';
