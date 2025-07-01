import React, { useState } from 'react';
import { useLogin } from '../../context/LoginContext';
import '../../styles/component/Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { login, isLoading } = useLogin();
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('请输入邮箱');
            return;
        }

        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('请输入有效的邮箱地址');
            return;
        }

        if (!password.trim()) {
            setError('请输入密码');
            return;
        }


        const success = await login(email, password);
        
        if (!success) {
            setError('登录失败，请检查邮箱和密码');
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
                            placeholder="请输入密码（至少6位）"
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

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