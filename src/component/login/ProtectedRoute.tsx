import React from 'react';
import { useLogin } from '../../context/LoginContext';
import Login from './Login';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isLoggedIn, isLoading } = useLogin();

    // 正在加载用户状态时显示加载界面
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>加载中...</p>
                </div>
            </div>
        );
    }

    // 如果用户未登录，显示登录页面
    if (!isLoggedIn) {
        return <Login />;
    }

    // 如果用户已登录，显示受保护的内容
    return <>{children}</>;
};

export default ProtectedRoute; 