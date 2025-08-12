import React, { useState } from 'react';
import { useLogin } from '../../context/LoginContext';
import '../../styles/component/Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [localError, setLocalError] = useState<string>('');
    const [showLocalError, setShowLocalError] = useState<boolean>(false);
    const { login, isLoading, getCurrentUserProfile, loginError, clearLoginError } = useLogin();
    

    // 显示本地错误信息的辅助函数（用于表单验证等）
    const displayLocalError = (errorMessage: string) => {
        setLocalError(errorMessage);
        setShowLocalError(true);
        // 5秒后自动隐藏错误信息
        setTimeout(() => {
            setShowLocalError(false);
        }, 5000);
    };

    // 清除所有错误的辅助函数
    const clearAllErrors = () => {
        setLocalError('');
        setShowLocalError(false);
        clearLoginError();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAllErrors();

        if (!email.trim()) {
            displayLocalError('请输入邮箱地址');
            return;
        }

        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            displayLocalError('请输入有效的邮箱地址格式');
            return;
        }

        if (!password.trim()) {
            displayLocalError('请输入密码');
            return;
        }

        if (password.length < 6) {
            displayLocalError('密码长度至少需要6位字符');
            return;
        }

        try{
            const result = await login(email, password);     
            if (!result.success) {
                // 错误信息已经在LoginContext中设置，这里不需要再处理
                return;
            }
            
            // 登录成功后获取用户资料
            try {
                await getCurrentUserProfile();
            } catch (profileError) {
                console.error('获取用户资料失败:', profileError);
                // 即使获取用户资料失败，也不显示错误，因为登录已经成功
            }
        }catch(error){
            console.error('登录过程中出现错误:', error);
            displayLocalError('登录过程中出现网络错误，请检查网络连接后重试');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>用户登录</h1>
                <p className="login-subtitle">请登录以访问题库系统</p>
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">邮箱</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => clearAllErrors()}
                            placeholder="请输入邮箱地址"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => clearAllErrors()}
                            placeholder="请输入密码（至少6位）"
                            disabled={isLoading}
                        />
                    </div>

                    {/* 显示LoginContext中的登录错误（如401等） */}
                    {loginError && (
                        <div className="error-message">
                            {loginError}
                        </div>
                    )}
                    
                    {/* 显示本地表单验证错误 */}
                    {localError && showLocalError && (
                        <div className="error-message">
                            {localError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? '登录中...' : '登录'}
                    </button>


                </form>

                
            </div>
        </div>
    );
};

export default Login; 