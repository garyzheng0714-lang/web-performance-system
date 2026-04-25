# web-performance-system

![分类](https://img.shields.io/badge/%E5%88%86%E7%B1%BB-%E9%A3%9E%E4%B9%A6%E5%BA%94%E7%94%A8-2563eb?style=flat-square)
![技术栈](https://img.shields.io/badge/%E6%8A%80%E6%9C%AF%E6%A0%88-NestJS%20React-0f766e?style=flat-square)
![状态](https://img.shields.io/badge/%E7%8A%B6%E6%80%81-%E4%B8%9A%E5%8A%A1%E7%B3%BB%E7%BB%9F-16a34a?style=flat-square)
![README](https://img.shields.io/badge/README-%E4%B8%AD%E6%96%87-brightgreen?style=flat-square)

飞书应用：基于飞书开放平台、多维表格和 Redis 的绩效考核系统，覆盖目标、审批、填报、评分与管理统计。

## 仓库定位

- 分类：飞书业务应用 / 绩效考核系统。
- 面向对象：需要用飞书账号登录、用飞书多维表格承载绩效数据，并提供 Web 管理后台的组织或团队。
- 主要边界：前端提供管理后台，后端提供统一 API；业务数据依赖飞书多维表格，缓存与会话相关能力依赖 Redis。
- 与表格工具仓库的区别：本仓库是完整业务系统，不是单个多维表格插件、字段捷径或通用表格转换工具。

## 功能特性

- 飞书 OAuth 登录和 JWT 认证
- 员工目标创建、提交、审批和状态流转
- 完成情况填报、提交、评分和归档
- 管理员数据统计、导出和操作日志
- 飞书多维表格作为业务数据存储
- 统一 API 响应格式、异常过滤和请求日志
- Docker Compose 本地编排，包含前端、后端和 Redis

## 技术栈

- 后端：NestJS、TypeScript、`@larksuiteoapi/node-sdk`
- 前端：React 18、Ant Design、Redux Toolkit、Vite、TypeScript
- 数据与缓存：飞书多维表格（Bitable）、Redis
- 部署辅助：Docker、Docker Compose、Nginx

## 项目结构

```text
.
├── backend/             # NestJS API 服务
│   ├── src/modules/     # auth、user、objective、completion、admin、feishu 等模块
│   ├── scripts/         # 多维表格初始化和测试用户脚本
│   └── .env.example     # 后端环境变量模板
├── frontend/            # React 管理后台
│   └── src/             # 页面、API client、状态管理和布局组件
├── docs/                # API、部署、测试、运维和表结构文档
├── docker-compose.yml   # 本地容器编排
├── nginx.conf           # 前端 Nginx 反向代理配置
└── README.md
```

## 环境要求

- Node.js 18+
- npm 9+
- Redis 7+（使用 Docker Compose 时会自动启动）
- 飞书企业账号和企业自建应用
- 一个用于保存绩效数据的飞书多维表格

## 飞书开放平台配置

1. 创建企业自建应用。
2. 申请并发布所需权限，至少包含用户基础信息、多维表格和消息相关权限。
3. 在安全设置中配置 OAuth 重定向地址：
   - 本地开发：`http://localhost:3001/api/auth/callback`
   - 生产环境：使用实际域名下的 `/api/auth/callback`
4. 按 `docs/BITABLE_SCHEMA.md` 创建或初始化多维表格。

## 配置

复制后端环境变量模板并填写实际值：

```bash
cd backend
cp .env.example .env
```

主要变量：

| 变量 | 用途 |
| --- | --- |
| `FEISHU_APP_ID` / `FEISHU_APP_SECRET` | 飞书应用凭证 |
| `FEISHU_REDIRECT_URI` / `FEISHU_OAUTH_SCOPE` | OAuth 回调和授权范围 |
| `BITABLE_APP_TOKEN` | 飞书多维表格 App Token |
| `BITABLE_TABLE_EMPLOYEES` | 员工表 ID |
| `BITABLE_TABLE_OBJECTIVES` | 目标表 ID |
| `BITABLE_TABLE_COMPLETIONS` | 完成情况表 ID |
| `BITABLE_TABLE_APPROVALS` | 审批表 ID |
| `BITABLE_TABLE_CONFIG` | 配置表 ID |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` / `REDIS_DB` | Redis 连接配置 |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT 签名和有效期 |
| `FRONTEND_URL` / `CORS_ORIGIN` | 前端地址和跨域配置 |

## 本地运行

### 后端

```bash
cd backend
npm install
npm run start:dev
```

默认 API 地址：`http://localhost:3001/api`

开发环境 Swagger 文档：`http://localhost:3001/api/docs`

### 前端

```bash
cd frontend
npm install
npm run dev
```

默认前端地址：`http://localhost:3000`

### Docker Compose

```bash
docker compose up --build
```

默认服务：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:3001/api`
- Redis：`localhost:6379`

## 常用命令

后端：

```bash
npm run build
npm run start:prod
npm test
npm run test:cov
npm run lint
npm run setup:bitable
npm run add:testuser
```

前端：

```bash
npm run dev
npm run build
npm run preview
```

## 文档索引

- [docs/API.md](./docs/API.md)：API 文档
- [docs/BITABLE_SCHEMA.md](./docs/BITABLE_SCHEMA.md)：多维表格结构
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)：部署说明
- [docs/TEST_CASES.md](./docs/TEST_CASES.md)：测试用例
- [docs/OPS.md](./docs/OPS.md)：运维监控建议
- [QUICKSTART.md](./QUICKSTART.md)：快速启动说明
- [SETUP.md](./SETUP.md)：配置说明

## 常见问题

### OAuth 登录失败

- 确认 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET` 来自同一个飞书应用。
- 确认应用已发布到企业。
- 确认开放平台中的重定向地址与 `FEISHU_REDIRECT_URI` 完全一致。
- 确认授权范围与 `FEISHU_OAUTH_SCOPE` 和已申请权限一致。

### 多维表格读写失败

- 检查 `BITABLE_APP_TOKEN` 和各表 ID 是否来自同一个多维表格。
- 检查飞书应用是否具备多维表格访问权限。
- 对照 `docs/BITABLE_SCHEMA.md` 确认字段名称和类型。

## 注意事项

- 本项目使用中文字段名和中文业务状态，请谨慎修改多维表格字段。
- 生产环境必须替换默认 `JWT_SECRET`，并使用 HTTPS 回调地址。
- 初始化或修复多维表格前，建议先在测试企业和测试表中验证脚本。
