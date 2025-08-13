import React from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../context/LoginContext';
import '../styles/component/Header.css';

const Header: React.FC = () => {
    const { user, logout } = useLogin();

    const handleLogout = () => {
        if (window.confirm('确定要退出登录吗？')) {
            logout();
        }
    };

    // console.log('user', user);

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left">
                    <Link to="/" className="app-title-link">
                        <h1 className="app-title">题库系统</h1>
                    </Link>
                </div>
                
                <div className="header-right">
                    <nav className="header-nav">
                        <Link to="/" className="nav-link">首页</Link>
                        <Link to="/profile" className="nav-link">个人资料</Link>
                        
                        <Link 
                            to="/upload" 
                            className={`nav-link ${user?.role !== 'admin' ? 'disabled' : ''}`}
                            onClick={(e) => user?.role !== 'admin' && e.preventDefault()}
                        >
                            上传问题
                        </Link>
                        <Link 
                            to="/admin" 
                            className={`nav-link ${user?.role !== 'admin' ? 'disabled' : ''}`}
                            onClick={(e) => user?.role !== 'admin' && e.preventDefault()}
                        >
                            管理问题
                        </Link>
                    </nav>
                    <div className="user-info">
                        <span className="welcome-text">欢迎，{user?.email}</span>
                        <button onClick={handleLogout} className="logout-button">
                            退出登录
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 