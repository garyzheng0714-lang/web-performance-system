# 快速启动指南 ⚡

## 👋 欢迎！

您的飞书绩效考核系统项目已经初始化完成！这份指南将帮助您在5分钟内启动项目。

---

## 📦 当前项目包含

✅ **完整的后端框架**
- NestJS项目结构
- 飞书SDK集成（OAuth登录、多维表格、消息推送）
- 认证模块（JWT）
- 模块框架（用户、目标、完成情况、管理员）
- 类型定义和装饰器

✅ **详细的文档**
- README.md - 项目说明
- SETUP.md - 安装指南
- PROJECT_STATUS.md - 当前状态和待办事项

---

## 🚀 30秒启动后端

### 步骤1: 进入后端目录并安装依赖
```bash
cd backend
npm install
```

### 步骤2: 配置环境变量
```bash
cp .env.example .env
```

然后编辑`.env`文件，填入以下信息（暂时可以使用示例值）：
```bash
# 飞书应用配置（稍后填写真实值）
FEISHU_APP_ID=cli_test123
FEISHU_APP_SECRET=test_secret_123
FEISHU_REDIRECT_URI=http://localhost:3000/auth/callback

# 多维表格配置（稍后填写真实值）
BITABLE_APP_TOKEN=bascntest123
BITABLE_TABLE_EMPLOYEES=tbltest1
BITABLE_TABLE_OBJECTIVES=tbltest2
BITABLE_TABLE_COMPLETIONS=tbltest3
BITABLE_TABLE_APPROVALS=tbltest4
BITABLE_TABLE_CONFIG=tbltest5

# 其他配置（可以保持默认）
JWT_SECRET=my-super-secret-key-change-in-production
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 步骤3: 启动开发服务器
```bash
npm run start:dev
```

✅ **成功！** 您应该看到：
```
🚀 服务器已启动: http://localhost:3001
📚 API地址: http://localhost:3001/api
```

---

## 🔧 配置飞书应用（10分钟）

### 1. 创建飞书应用

1. 访问 https://open.feishu.cn/
2. 点击"创建企业自建应用"
3. 填写应用名称: `绩效考核系统`
4. 上传应用图标（可选）
5. 点击创建

### 2. 申请权限

进入应用的"权限管理"页面，申请以下权限：

| 权限 | 用途 |
|------|------|
| `contact:user.base` | 获取用户基本信息 |
| `bitable:app` | 访问多维表格 |
| `im:message` | 发送消息 |
| `im:message.group_msg` | 发送群消息 |

点击"申请权限" → "提交审核" → 等待管理员批准

### 3. 配置OAuth回调地址

进入"安全设置"页面：
- 重定向URL: `http://localhost:3000/auth/callback`
- （生产环境改为: `https://yourdomain.com/auth/callback`）

### 4. 获取凭证

进入"凭证与基础信息"页面，复制：
- ✅ **App ID** (例如: `cli_a1b2c3d4e5f6`)
- ✅ **App Secret** (例如: `abcdefghijklmnopqrstuvwxyz123456`)

将这两个值更新到`backend/.env`文件中。

### 5. 创建多维表格

1. 在飞书中创建一个新的多维表格
2. 创建5张表（详细结构见下方）
3. 字段结构以 `docs/BITABLE_SCHEMA.md` 为准（中文表名与字段）
4. 从URL中获取：
   - Base Token: `https://xxx.feishu.cn/base/bascnXXXXXXXXXX`
   - 每张表的Table ID: 点击表名，从URL获取 `tblXXXXXXXX`

#### 表1: employees（员工信息表）
最少需要的字段：
- `user_id` (文本)
- `name` (文本)
- `email` (文本)
- `role` (单选: 员工/主管/管理员)
- `supervisor_id` (文本)

手动添加一条测试数据：
- user_id: 你的飞书user_id (从飞书个人资料获取)
- name: 你的名字
- email: 你的邮箱
- role: 管理员
- supervisor_id: (留空)

#### 表2-5: 其他表
按照 `README.md` 中的表结构创建即可，暂时可以不添加数据。

### 6. 更新环境变量

将获取到的所有ID更新到 `backend/.env` 文件：
```bash
FEISHU_APP_ID=cli_xxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxx
BITABLE_APP_TOKEN=bascnxxxxxxxxx
BITABLE_TABLE_EMPLOYEES=tblxxxxxx
BITABLE_TABLE_OBJECTIVES=tblxxxxxx
BITABLE_TABLE_COMPLETIONS=tblxxxxxx
BITABLE_TABLE_APPROVALS=tblxxxxxx
BITABLE_TABLE_CONFIG=tblxxxxxx
```

### 7. 重启后端服务

```bash
# 按 Ctrl+C 停止服务，然后重新启动
npm run start:dev
```

---

## 🧪 测试飞书登录

### 方式1: 使用浏览器
```bash
# 访问登录endpoint
open http://localhost:3001/api/auth/login
```

应该会：
1. 跳转到飞书授权页面
2. 扫码授权
3. 回调到前端（目前会404，因为前端还没创建）

### 方式2: 使用curl测试Token生成
```bash
# 获取用户访问令牌（需要先完成OAuth流程）
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📁 项目文件导览

```
performance-system/
├── backend/
│   ├── src/
│   │   ├── main.ts       👈 应用入口
│   │   ├── app.module.ts 👈 根模块
│   │   ├── modules/
│   │   │   ├── feishu/   ✅ 飞书集成（完整）
│   │   │   ├── auth/     ✅ 认证模块（完整）
│   │   │   ├── user/     ⏳ 待实现业务逻辑
│   │   │   ├── objective/⏳ 待实现业务逻辑
│   │   │   ├── completion/⏳ 待实现业务逻辑
│   │   │   └── admin/    ⏳ 待实现业务逻辑
│   │   ├── types/        ✅ 类型定义（完整）
│   │   └── common/       ✅ 装饰器和守卫（完整）
│   ├── package.json
│   └── .env             👈 配置文件
│
├── frontend/             ⏳ 待创建
├── docs/
├── README.md            📚 项目说明
├── SETUP.md             📚 详细安装指南
├── PROJECT_STATUS.md    📚 当前状态
└── QUICKSTART.md        📚 本文件
```

---

## 🎯 下一步做什么？

### 选项1: 实现后端业务逻辑（推荐）

参考 `PROJECT_STATUS.md` 中的"待实现"部分，逐个实现：

1. **用户模块** - 最简单，先从这里开始
2. **目标管理模块** - 核心功能
3. **完成情况模块** - 核心功能
4. **管理员模块** - 后台管理

每个模块我都可以帮你实现，只需要告诉我：
> "帮我实现用户模块的业务逻辑"

### 选项2: 创建前端项目

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install antd @ant-design/icons
npm install @reduxjs/toolkit react-redux
npm install react-router-dom axios dayjs
```

### 选项3: 继续向我提问

我可以帮你：
- ✅ 实现具体的业务逻辑代码
- ✅ 调试错误
- ✅ 解释代码工作原理
- ✅ 添加新功能
- ✅ 优化性能
- ✅ 创建前端页面

---

## 💡 常见问题

### Q1: 飞书API调用报错？
**A**: 检查：
1. App ID和App Secret是否正确
2. 权限是否已申请并批准
3. 回调地址是否配置正确

### Q2: 多维表格读取失败？
**A**: 检查：
1. Base Token和Table ID是否正确
2. 应用是否有该表格的访问权限
3. 字段名称是否与代码中匹配

### Q3: JWT验证失败？
**A**: 检查：
1. JWT_SECRET是否配置
2. Token是否过期
3. 请求头格式: `Authorization: Bearer <token>`

### Q4: 我需要修改某个功能怎么办？
**A**: 直接告诉我你想修改什么，例如：
- "我想把考核周期从月改成季度"
- "我想添加多级审批"
- "我想导出PDF格式的报告"

---

## 📞 获取帮助

🤔 **不知道如何继续？**
直接问我：
- "下一步我应该做什么？"
- "帮我实现XXX功能"
- "这段代码为什么报错？"
- "如何测试飞书登录？"

我会提供：
- ✅ 详细的代码实现
- ✅ 逐步的操作指南
- ✅ 问题排查建议
- ✅ 最佳实践推荐

---

## 🎉 恭喜！

你已经完成了项目的基础搭建！

**已完成**:
- ✅ 后端框架搭建
- ✅ 飞书SDK集成
- ✅ 认证系统
- ✅ 数据模型设计

**接下来**:
- ⏳ 实现业务逻辑
- ⏳ 创建前端界面
- ⏳ 测试和优化
- ⏳ 部署上线

**预计完成时间**: 3-4周

---

**让我们开始吧！告诉我你想先做什么：** 🚀

1. 实现某个具体的业务模块
2. 创建前端项目
3. 优化现有代码
4. 添加新功能
5. 其他需求

随时向我提问！
