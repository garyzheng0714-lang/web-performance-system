# 飞书绩效考核系统

基于飞书开放平台的完整绩效考核管理系统，使用飞书多维表格作为数据存储。

## 🚀 技术栈

### 后端
- **框架**: NestJS + TypeScript
- **SDK**: @larksuiteoapi/node-sdk (飞书官方SDK)
- **缓存**: Redis
- **认证**: JWT + Passport

### 前端
- **框架**: React 18 + TypeScript
- **UI库**: Ant Design
- **状态管理**: Redux Toolkit
- **构建工具**: Vite
- **HTTP客户端**: Axios

### 数据存储
- **主数据**: 飞书多维表格 (Bitable API)
- **缓存**: Redis
- **会话**: Redis

## 📁 项目结构

```
performance-system/
├── backend/          # 后端NestJS项目
│   ├── src/
│   │   ├── common/   # 通用模块（守卫、装饰器等）
│   │   ├── config/   # 配置文件
│   │   ├── modules/  # 功能模块
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── feishu/     # 飞书集成
│   │   │   ├── user/       # 用户管理
│   │   │   ├── objective/  # 目标管理
│   │   │   ├── completion/ # 完成情况
│   │   │   └── admin/      # 管理员
│   │   ├── types/   # TypeScript类型定义
│   │   └── main.ts  # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/         # 前端React项目
│   ├── src/
│   │   ├── components/  # 通用组件
│   │   ├── features/    # 功能模块
│   │   ├── services/    # API服务
│   │   ├── store/       # Redux store
│   │   ├── types/       # 类型定义
│   │   └── App.tsx      # 根组件
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                # 文档
│   ├── API.md          # API文档
│   ├── SETUP.md        # 部署文档
│   └── BITABLE_SCHEMA.md  # 多维表格结构
│
├── docker-compose.yml   # Docker编排
└── README.md           # 项目说明
```

## 🔧 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Redis >= 7.0 (可选，用于缓存)
- 飞书企业账号

## 📋 准备工作

### 1. 创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 申请以下权限：
   - `contact:user.base` - 获取用户基本信息
   - `bitable:app` - 访问多维表格
   - `im:message` - 发送消息
   - `im:message.group_msg` - 发送群消息

4. 配置重定向URL：
   - 开发环境: `http://localhost:3000/auth/callback`
   - 生产环境: `https://your-domain.com/auth/callback`

5. 记录以下信息：
   - App ID
   - App Secret

### 2. 创建飞书多维表格

本项目使用**中文表名与中文字段**，字段结构请以 `docs/BITABLE_SCHEMA.md` 为准。

在飞书中创建一个新的多维表格（Base），包含以下5张表：

#### 表1: 员工信息表 (employees)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| user_id | 文本 | 飞书用户ID |
| name | 文本 | 姓名 |
| email | 文本 | 邮箱 |
| department | 单选 | 部门 |
| position | 文本 | 职位 |
| supervisor_id | 文本 | 主管ID |
| role | 单选 | 角色（员工/主管/管理员） |
| status | 单选 | 状态（在职/离职） |
| created_at | 日期 | 创建时间 |

#### 表2: 考核目标表 (objectives)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| objective_id | 文本 | 目标ID |
| user_id | 文本 | 员工ID |
| period | 文本 | 考核周期 |
| title | 文本 | 目标标题 |
| description | 多行文本 | 目标描述 |
| weight | 数字 | 权重 |
| target | 文本 | 目标值 |
| status | 单选 | 状态 |
| submitted_at | 日期 | 提交时间 |
| approved_at | 日期 | 审批时间 |
| supervisor_comment | 多行文本 | 主管意见 |
| created_at | 日期 | 创建时间 |
| updated_at | 日期 | 更新时间 |

#### 表3: 考核完成情况表 (completions)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| completion_id | 文本 | 完成记录ID |
| objective_id | 文本 | 目标ID |
| user_id | 文本 | 员工ID |
| period | 文本 | 考核周期 |
| self_assessment | 多行文本 | 自评内容 |
| actual_value | 文本 | 实际完成值 |
| self_score | 数字 | 自评分 |
| supervisor_score | 数字 | 主管评分 |
| supervisor_comment | 多行文本 | 主管评语 |
| status | 单选 | 状态 |
| submitted_at | 日期 | 提交时间 |
| scored_at | 日期 | 评分时间 |
| created_at | 日期 | 创建时间 |
| updated_at | 日期 | 更新时间 |

#### 表4: 审批记录表 (approvals)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| approval_id | 文本 | 审批ID |
| type | 单选 | 审批类型 |
| related_id | 文本 | 关联ID |
| applicant_id | 文本 | 申请人ID |
| approver_id | 文本 | 审批人ID |
| status | 单选 | 状态 |
| comment | 多行文本 | 审批意见 |
| submitted_at | 日期 | 提交时间 |
| processed_at | 日期 | 处理时间 |

#### 表5: 系统配置表 (system_config)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| config_key | 文本 | 配置键 |
| config_value | 文本 | 配置值 |
| description | 文本 | 配置说明 |
| updated_at | 日期 | 更新时间 |

创建完成后，记录以下信息：
- Base Token (从URL中获取: `https://xxx.feishu.cn/base/bascn...`)
- 每个表的 Table ID (从URL中获取)

## 🚀 快速开始

### 1. 克隆项目

```bash
cd performance-system
```

### 2. 配置后端

```bash
cd backend

# 复制环境变量文件
cp .env.example .env

# 编辑.env文件，填入你的配置
# FEISHU_APP_ID=your_app_id
# FEISHU_APP_SECRET=your_app_secret
# BITABLE_APP_TOKEN=your_base_token
# BITABLE_TABLE_EMPLOYEES=your_table_id
# ...

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

后端服务将运行在 http://localhost:3001

### 3. 配置前端

```bash
cd ../frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 http://localhost:3000

### 4. 访问系统

打开浏览器访问 http://localhost:3000，使用飞书账号登录。

## 🔑 核心功能

### 1. 认证与授权
- 飞书 OAuth 2.0 登录
- JWT Token 认证
- 基于角色的权限控制（员工/主管/管理员）

### 2. 目标管理
- 创建、编辑考核目标
- 提交审批工作流
- 主管审批（批准/拒绝）
- 飞书消息通知

### 3. 完成情况与评分
- 员工填写完成情况和自评
- 主管查看并评分
- 自动归档机制

### 4. 管理员功能
- 全局数据查看
- 考核周期管理
- 解锁归档数据
- 数据统计和导出

## 📖 API文档

详细的API文档请查看 [docs/API.md](./docs/API.md)

## 🐳 Docker部署

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📝 业务流程

### 目标设定与审批流程
1. 员工登录系统，创建考核目标
2. 员工提交审批，主管收到飞书消息通知
3. 主管审批（批准/拒绝），员工收到通知
4. 如被拒绝，员工可修改后重新提交
5. 批准后目标锁定，开始执行

### 月度考核流程
1. 月底系统提醒员工填写完成情况
2. 员工填写实际完成情况和自评分
3. 主管收到通知，查看并评分
4. 评分完成后自动归档
5. 员工收到最终考核结果通知

## 🛠️ 开发指南

### 添加新功能模块

1. 在 `backend/src/modules` 创建新模块
2. 在 `frontend/src/features` 创建对应的前端页面
3. 更新路由配置
4. 添加API服务

### 调试

后端：
```bash
npm run start:debug
```

前端：
```bash
npm run dev
```

使用 Chrome DevTools 或 VS Code 进行调试。

## 📊 技术特点

✅ **零数据库成本** - 使用飞书多维表格存储数据
✅ **深度集成** - 与飞书消息、审批无缝衔接
✅ **类型安全** - 全栈 TypeScript 开发
✅ **模块化** - 清晰的代码结构，易于维护
✅ **可扩展** - 灵活的架构设计

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请提交 Issue 或联系开发团队。

---

**注意事项：**

1. 生产环境请修改 JWT_SECRET 为强密码
2. 配置好 CORS 策略
3. 定期备份飞书多维表格数据
4. 注意飞书 API 调用频率限制
5. 建议使用 HTTPS 部署

## 下一步计划

- [ ] 添加数据分析和报表功能
- [ ] 开发飞书小程序版本
- [ ] 集成AI辅助评语生成
- [ ] 增加360度评价功能
- [ ] 开发移动端适配

**祝你使用愉快！** 🎉
