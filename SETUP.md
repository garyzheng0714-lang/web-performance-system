# 项目初始化指南

## 当前项目状态

✅ 已完成：
- 项目基础结构创建
- 后端核心配置文件
- 类型定义文件
- 飞书SDK集成基础

⏳ 待完成：
- 完整的后端业务逻辑代码
- 前端React项目初始化
- Docker配置
- 完整文档

## 快速完成项目搭建

由于项目文件较多，我已经为您准备好了框架。接下来有两种方式完成：

### 方式1: 手动安装依赖并逐步开发（推荐学习）

1. **安装后端依赖**
```bash
cd backend
npm install
```

2. **配置环境变量**
```bash
# 复制示例文件
cp .env.example .env

# 编辑.env文件，填入您的飞书应用配置
vim .env
```

3. **创建剩余的源代码文件**

我已经为您创建了以下文件：
- `src/main.ts` - 应用入口
- `src/app.module.ts` - 根模块
- `src/types/index.ts` - 类型定义
- `src/modules/feishu/feishu.module.ts` - 飞书模块
- `src/modules/feishu/feishu.service.ts` - 飞书服务

接下来需要创建的文件（您可以逐步开发）：

**飞书模块**：
- `src/modules/feishu/bitable.service.ts` - 多维表格操作
- `src/modules/feishu/message.service.ts` - 消息推送

**认证模块**：
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/common/guards/auth.guard.ts`
- `src/common/guards/roles.guard.ts`
- `src/common/decorators/roles.decorator.ts`

**用户模块**：
- `src/modules/user/user.module.ts`
- `src/modules/user/user.controller.ts`
- `src/modules/user/user.service.ts`

**目标管理模块**：
- `src/modules/objective/objective.module.ts`
- `src/modules/objective/objective.controller.ts`
- `src/modules/objective/objective.service.ts`
- `src/modules/objective/dto/create-objective.dto.ts`
- `src/modules/objective/dto/update-objective.dto.ts`

**完成情况模块**：
- `src/modules/completion/completion.module.ts`
- `src/modules/completion/completion.controller.ts`
- `src/modules/completion/completion.service.ts`

**管理员模块**：
- `src/modules/admin/admin.module.ts`
- `src/modules/admin/admin.controller.ts`
- `src/modules/admin/admin.service.ts`

### 方式2: 使用代码生成器快速创建（推荐快速启动）

我可以为您创建一个`generate-code.ts`脚本，运行后自动生成所有缺失的文件。

Would you like me to:
1. 继续逐个创建剩余的后端文件？
2. 创建代码生成脚本？
3. 或者直接进入前端项目初始化？

## 前端项目初始化

```bash
cd ../frontend

# 使用Vite创建React+TypeScript项目
npm create vite@latest . -- --template react-ts

# 安装依赖
npm install

# 安装额外的依赖
npm install antd @ant-design/icons
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios dayjs
```

## 启动Redis（用于缓存）

### 使用Docker启动Redis
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### 或使用Homebrew (Mac)
```bash
brew install redis
brew services start redis
```

### 或使用APT (Ubuntu/Debian)
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

## 飞书应用配置步骤

### 1. 访问飞书开放平台
https://open.feishu.cn/

### 2. 创建应用
- 点击"创建企业自建应用"
- 填写应用名称和描述
- 上传应用图标

### 3. 配置应用能力
权限申请：
```
✓ contact:user.base - 获取用户基本信息
✓ bitable:app - 访问多维表格
✓ im:message - 发送消息
✓ im:message.group_msg - 发送群消息
```

### 4. 配置OAuth回调地址
- 开发环境: `http://localhost:3000/auth/callback`
- 生产环境: `https://yourdomain.com/auth/callback`

### 5. 获取凭证
- App ID (cli_xxxxx)
- App Secret

### 6. 创建多维表格
1. 在飞书中新建多维表格
2. 按照 `docs/BITABLE_SCHEMA.md` 的中文字段结构创建5张表
3. 从URL中获取Base Token和Table IDs
4. 将这些ID填入`.env`文件

## 启动开发服务器

### 后端
```bash
cd backend
npm run start:dev
```
访问: http://localhost:3001

### 前端
```bash
cd frontend
npm run dev
```
访问: http://localhost:3000

## 测试API

### 健康检查
```bash
curl http://localhost:3001/api/health
```

### 获取用户信息（需要登录后的Token）
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/users/me
```

## 常见问题

### Q: 飞书API调用失败
A: 检查App ID和App Secret是否正确，权限是否已申请并通过

### Q: 多维表格读取失败
A: 检查Base Token和Table IDs是否正确，应用是否有表格访问权限

### Q: Redis连接失败
A: 确保Redis服务已启动，检查REDIS_HOST和REDIS_PORT配置

### Q: JWT验证失败
A: 检查JWT_SECRET配置，确保前后端使用同一个密钥

## 下一步

完成上述步骤后，您可以：

1. 登录系统测试飞书OAuth流程
2. 在飞书多维表格中添加测试数据
3. 测试目标创建和审批流程
4. 开发更多自定义功能

## 获取帮助

如果遇到问题，可以：
1. 查看详细的计划文档: `~/.claude/plans/floating-nibbling-squirrel.md`
2. 查看API文档: `docs/API.md`
3. 查看飞书开放平台文档: https://open.feishu.cn/document/
4. 向我提问继续完善项目

祝开发顺利！🚀
