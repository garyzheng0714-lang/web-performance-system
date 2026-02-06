# 飞书绩效考核系统

基于飞书开放平台 + 多维表格（Bitable）的绩效考核系统，提供完整的目标管理、审批、完成情况与评分流程，支持管理员统计与导出。

## 主要功能
- 飞书 OAuth 登录 + JWT 认证
- 目标创建 / 提交 / 审批
- 完成情况填写 / 提交 / 评分 / 归档
- 管理员统计、导出与操作日志
- 统一的 API 响应格式与错误处理

## 技术栈
- 后端：NestJS + TypeScript + 飞书 SDK
- 前端：React 18 + Ant Design + Redux Toolkit + Vite
- 数据：飞书多维表格（Bitable）

## 项目结构
```
performance-system/
├── backend/            # 后端 NestJS
├── frontend/           # 前端 React
├── docs/               # 文档（API/部署/测试/运维）
├── docker-compose.yml  # 本地容器编排
└── README.md
```

## 环境要求
- Node.js >= 18
- npm >= 9
- 飞书企业账号

## 飞书开放平台配置
1. 创建企业自建应用
2. 申请权限（至少）：
   - `contact:user.base` 或 `contact:user.base:readonly`
   - `bitable:app`
   - `im:message`
3. 安全设置 → 重定向 URL
   - 开发环境：`http://localhost:3001/api/auth/callback`
   - 生产环境：`https://your-domain.com/api/auth/callback`

## 多维表格
本项目使用**中文字段**。表结构参考：
- `docs/BITABLE_SCHEMA.md`

建议使用 `backend/scripts/` 中脚本初始化表结构。

## 环境变量（后端）
复制 `backend/.env.example` 到 `backend/.env` 并填写：
- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_REDIRECT_URI`
- `BITABLE_APP_TOKEN`
- `BITABLE_TABLE_EMPLOYEES`
- `BITABLE_TABLE_OBJECTIVES`
- `BITABLE_TABLE_COMPLETIONS`
- `JWT_SECRET`
- `FRONTEND_URL`

## 本地运行
### 后端
```bash
cd backend
npm install
npm run build
node dist/main.js
```
服务地址：`http://localhost:3001/api`
开发环境 Swagger：`http://localhost:3001/api/docs`

### 前端
```bash
cd frontend
npm install
npm run dev
```
访问：`http://localhost:3000`

## Docker Compose
```bash
docker compose up --build
```
- 前端：`http://localhost:3000`
- 后端：`http://localhost:3001/api`

## 文档索引
- `docs/API.md` API 文档
- `docs/DEPLOYMENT.md` 部署指南
- `docs/TEST_CASES.md` 测试用例
- `docs/OPS.md` 运维监控建议

## 常见问题
**OAuth 登录失败 / invalid access token**
- 确保 `FEISHU_APP_ID/SECRET` 正确且对应同一应用
- 确保应用已发布到企业
- 权限范围与 `FEISHU_OAUTH_SCOPE` 一致
- 重定向地址与平台配置精确匹配

---
如需扩展功能（考核周期、配置中心、审批流程升级），建议先在测试企业验证。
