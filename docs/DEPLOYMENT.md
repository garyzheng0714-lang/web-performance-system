# 部署指南

## 前置条件
- Node.js 18+（推荐 20+）
- npm 9+
- 可选：Docker / Docker Compose

## 环境变量
后端读取 `backend/.env`，确保以下字段已配置：
- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_REDIRECT_URI`（例如 `http://localhost:3001/api/auth/callback`）
- `BITABLE_APP_TOKEN`
- `BITABLE_TABLE_EMPLOYEES`
- `BITABLE_TABLE_OBJECTIVES`
- `BITABLE_TABLE_COMPLETIONS`
- `JWT_SECRET`
- `FRONTEND_URL`

## 本地开发
1. 后端
```
cd backend
npm install
npm run build
node dist/main.js
```
启动后访问：`http://localhost:3001/api`
Swagger（开发环境）：`http://localhost:3001/api/docs`

2. 前端
```
cd frontend
npm install
npm run dev
```
启动后访问：`http://localhost:3000`

## Docker Compose
```
docker compose up --build
```
默认端口：
- 前端：`http://localhost:3000`
- 后端：`http://localhost:3001/api`

## 飞书开放平台配置要点
- 安全设置 → 重定向 URL：
  - `http://localhost:3001/api/auth/callback`（开发环境）
- 事件回调地址：
  - `http://localhost:3001/api/auth/callback`
- 权限范围：
  - 至少包含 `contact:user.base` 或 `contact:user.base:readonly`

## 生产环境建议
- 使用反向代理（Nginx）统一域名与 HTTPS
- 将 `FEISHU_REDIRECT_URI` 与 `FRONTEND_URL` 替换为生产域名
- 使用更强的 `JWT_SECRET`（长度 32+）
- 关闭 Swagger（`NODE_ENV=production`）
