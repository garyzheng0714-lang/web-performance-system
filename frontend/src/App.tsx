import React from 'react';

const App: React.FC = () => {
  return (
    <div
      style={{
        fontFamily: '"Noto Sans SC", "Space Grotesk", sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eef7f3 100%)',
      }}
    >
      <div
        style={{
          width: 'min(520px, 92vw)',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 18px 40px rgba(30, 50, 90, 0.15)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '28px', color: '#1d2b3a' }}>
          绩效考核系统
        </h1>
        <p style={{ margin: '12px 0 24px', color: '#5a6b7b', fontSize: '15px' }}>
          请使用飞书账号登录以继续
        </p>
        <a
          href="http://localhost:3001/api/auth/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 20px',
            borderRadius: '999px',
            background: '#2d6cf6',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          飞书登录
        </a>
      </div>
    </div>
  );
};

export default App;
