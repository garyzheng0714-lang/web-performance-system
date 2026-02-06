import { Card, Typography, Button, Space, Alert } from 'antd';
import { authUrl } from '@/api/client';
import { useEffect, useState } from 'react';

export function Login() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      // 清除URL中的错误参数
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #f6f3ea 0%, #e9dfcf 60%, #f1efe6 100%)',
      }}
    >
      <Card
        className="fade-in"
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: 'none',
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Typography.Title level={2} style={{ marginBottom: 8, color: '#1a1a1a' }}>
              绩效考核系统
            </Typography.Title>
            <Typography.Text type="secondary">基于飞书多维表格驱动</Typography.Text>
          </div>

          {error && (
            <Alert
              message="登录失败"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Button
            type="primary"
            size="large"
            block
            onClick={() => (window.location.href = authUrl)}
            style={{
              height: 48,
              fontSize: 16,
              background: 'linear-gradient(135deg, #0f4c5c 0%, #1b6b7a 100%)',
              border: 'none',
            }}
          >
            使用飞书账号登录
          </Button>

          <Alert
            message="首次登录提示"
            description="如果登录失败，请确认你的飞书用户ID已添加到「员工信息」表中。请联系管理员添加。"
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}
