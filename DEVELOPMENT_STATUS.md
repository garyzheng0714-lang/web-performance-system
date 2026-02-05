# 绩效考核系统 - 开发状态文档

> 本文档记录项目当前开发进度、关键设计决策和下一步计划。
> 创建时间：2026年2月3日
> 最后更新：2026年2月3日

---

## 一、项目背景

### 1.1 项目概述
- **项目名称**：绩效考核系统（Performance Appraisal System）
- **目标企业**：约100人规模的中小型企业
- **核心需求**：
  - 员工绩效考核管理（目标制定、审批、执行、评分）
  - 与飞书生态深度集成（组织架构、审批消息通知）
  - 支持自定义目标类型和考核周期

### 1.2 技术栈
| 层级 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 后端框架 | NestJS | 10.3 | 模块化、依赖注入 |
| 编程语言 | TypeScript | 5.3 | 类型安全 |
| 数据库 | 飞书 Bitable | - | 多维表格存储 |
| 认证 | 飞书 OAuth + JWT | - | 企业身份认证 |
| 缓存 | Redis（可选） | 7 | 会话/缓存 |

### 1.3 项目结构
```
performance-system/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── modules/           # 业务模块
│   │   │   ├── auth/         # 认证模块（已完成）
│   │   │   ├── feishu/       # 飞书集成（已完成）
│   │   │   ├── user/         # 员工模块（已完成）
│   │   │   ├── objective/    # 目标模块（已完成）
│   │   │   ├── completion/   # 完成情况模块（已完成）
│   │   │   └── admin/        # 管理员模块（已完成）
│   │   ├── types/            # 类型定义
│   │   └── main.ts           # 应用入口
│   ├── scripts/              # 脚本工具
│   │   ├── setup-bitable.ts  # 初始化表格
│   │   ├── add-test-user.ts  # 添加测试用户
│   │   └── create-chinese-tables.ts # 创建中文表
│   └── .env                  # 环境变量（已配置）
├── frontend/                 # 前端项目（待创建）
├── docs/                     # 文档目录
├── DEVELOPMENT_STATUS.md    # 本文档
└── README.md                # 项目说明
```

---

## 二、已完成的工作

### 2.1 数据库设计（100% 完成）

所有表格均已创建，使用**中文表名**和**中文字段名**。

| 序号 | 表名（中文） | Table ID | 说明 | 状态 |
|------|-------------|----------|------|------|
| 1 | **员工信息** | `tblx3v5rizh3ehhv` | 员工基本信息 | ✅ 已创建 |
| 2 | **考核目标** | `tblTrUg0j7MyToua` | 绩效目标设定与审批 | ✅ 已创建 |
| 3 | **完成情况** | `tblnCfcZ9IIeqbkj` | 完成情况填报与评分 | ✅ 已创建 |
| 4 | **审批记录** | `tblQmsoGBepZKBI2` | 审批流程记录 | ✅ 已创建 |
| 5 | **系统配置** | `tblL0536vf9huQeM` | 系统参数配置 | ✅ 已创建 |
| 6 | **考核周期** | `tblKYMuJR25q5YRF` | 考核周期管理 | ✅ 已创建 |
| 7 | **部门** | `tbleErZwijZMTcXc` | 部门架构管理 | ✅ 已创建 |
| 8 | **操作日志** | `tblicWLlD7zkIejz` | 审计日志记录 | ✅ 已创建 |

### 2.2 API 接口开发（100% 完成）

共实现 **39 个 API 接口**。

#### 员工模块（7 个接口）
| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/users/me` | 获取当前用户信息 |
| `GET` | `/api/users/:userId` | 获取指定用户信息 |
| `GET` | `/api/users/me/subordinates` | 获取我的下属列表 |
| `GET` | `/api/users/:userId/subordinates` | 获取指定用户的下属列表 |
| `GET` | `/api/users` | 获取所有员工列表（管理员） |
| `GET` | `/api/users/department/:department` | 根据部门获取员工列表 |
| `GET` | `/api/users/:userId/history` | 获取用户的历史考核记录 |

#### 目标模块（12 个接口）
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/objectives` | 创建目标 |
| `PUT` | `/api/objectives/:objectiveId` | 更新目标 |
| `DELETE` | `/api/objectives/:objectiveId` | 删除目标 |
| `POST` | `/api/objectives/:objectiveId/submit` | 提交目标审批 |
| `POST` | `/api/objectives/:objectiveId/approve` | 审批目标 |
| `GET` | `/api/objectives/my/list` | 获取我的目标列表 |
| `GET` | `/api/objectives/:objectiveId` | 获取目标详情 |
| `GET` | `/api/objectives/subordinates/list` | 获取下属的目标列表 |
| `GET` | `/api/objectives/pending/approvals` | 获取待审批的目标列表 |

#### 完成情况模块（10 个接口）
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/completions` | 创建完成情况 |
| `PUT` | `/api/completions/:completionId` | 更新完成情况（自评） |
| `POST` | `/api/completions/:completionId/submit` | 提交完成情况 |
| `POST` | `/api/completions/:completionId/score` | 主管评分 |
| `GET` | `/api/completions/my/list` | 获取我的完成情况列表 |
| `GET` | `/api/completions/:completionId` | 获取完成情况详情 |
| `GET` | `/api/completions/pending/scores` | 获取待评分的完成情况列表 |
| `POST` | `/api/completions/:completionId/archive` | 归档完成情况 |

#### 管理员模块（8 个接口）
| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/admin/statistics` | 获取系统统计数据 |
| `GET` | `/api/admin/progress` | 获取考核进度统计 |
| `GET` | `/api/admin/employee-stats` | 获取员工考核统计 |
| `GET` | `/api/admin/department-stats` | 获取部门考核统计 |
| `GET` | `/api/admin/export` | 导出考核数据 |
| `GET` | `/api/admin/logs` | 获取系统操作日志 |

### 2.3 类型定义（100% 完成）

创建了完整的 TypeScript 类型定义：
- `src/types/index.ts` - 英文类型定义
- `src/types/chinese.ts` - 中文类型定义（中文字段名）

### 2.4 环境配置（100% 完成）

`.env` 文件已配置，包含：
- 飞书应用配置（App ID, App Secret）
- 8 张表格的 Table IDs
- JWT 配置
- Redis 配置（可选）

---

## 三、关键设计决策

### 3.1 技术选型决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 后端框架 | NestJS | 模块化架构、依赖注入、TypeScript 原生支持 |
| 数据库 | 飞书 Bitable | 与企业飞书生态集成、零运维成本、适合 100 人规模 |
| 认证方式 | 飞书 OAuth + JWT | 复用企业组织架构、单点登录体验好 |
| 字段命名 | 中文 | 业务人员可直接理解、降低沟通成本 |

### 3.2 数据库设计决策

1. **表名使用中文**：如 `员工信息`、`考核目标`，便于业务人员理解
2. **字段名使用中文**：如 `用户ID`、`目标标题`，与业务语言一致
3. **8 张核心表**：覆盖员工、目标、完成情况、审批、系统配置、考核周期、部门、操作日志
4. **状态机设计**：每个业务实体都有明确的状态流转

### 3.3 API 设计决策

1. **RESTful 风格**：统一的接口风格，易于理解和维护
2. **权限控制**：基于角色的权限控制（员工、主管、管理员）
3. **统一响应格式**：`{ success: boolean, message: string, data: any }`
4. **JWT 认证**：所有 API 都需要 Bearer Token 认证

### 3.4 中文字段名设计

**员工信息表字段**：
- `用户ID`、`姓名`、`邮箱`、`部门`、`职位`、`主管ID`、`角色`、`状态`、`入职日期`、`创建时间`

**考核目标表字段**：
- `目标ID`、`用户ID`、`姓名`、`周期ID`、`周期名称`、`目标标题`、`目标描述`、`目标类型`、`权重`、`目标值`、`优先级`、`截止日期`、`状态`、`提交时间`、`审批时间`、`主管意见`、`父目标ID`、`创建时间`、`更新时间`

**完成情况表字段**：
- `完成ID`、`目标ID`、`用户ID`、`姓名`、`周期ID`、`周期名称`、`自评内容`、`实际完成值`、`完成率`、`自评分`、`主管评分`、`校准分`、`主管评语`、`证明材料`、`状态`、`提交时间`、`评分时间`、`创建时间`、`更新时间`

---

## 四、表结构与 Table ID

### 4.1 完整表清单

| 序号 | 表名（中文） | Table ID | 用途说明 | 核心字段 |
|------|-------------|----------|----------|----------|
| 1 | **员工信息** | `tblx3v5rizh3ehhv` | 员工基本信息管理 | 用户ID、姓名、邮箱、部门、职位、主管ID、角色、状态、入职日期、创建时间 |
| 2 | **考核目标** | `tblTrUg0j7MyToua` | 绩效目标设定与审批 | 目标ID、用户ID、姓名、周期ID、目标标题、目标描述、目标类型、权重、目标值、优先级、截止日期、状态、提交时间、审批时间、主管意见、创建时间、更新时间 |
| 3 | **完成情况** | `tblnCfcZ9IIeqbkj` | 完成情况填报与评分 | 完成ID、目标ID、用户ID、姓名、周期ID、自评内容、实际完成值、完成率、自评分、主管评分、校准分、主管评语、证明材料、状态、提交时间、评分时间、创建时间、更新时间 |
| 4 | **审批记录** | `tblQmsoGBepZKBI2` | 审批流程记录 | 审批ID、审批类型、关联ID、关联类型、申请人ID、申请人姓名、审批人ID、审批人姓名、状态、审批意见、备注、提交时间、处理时间、耗时 |
| 5 | **系统配置** | `tblL0536vf9huQeM` | 系统参数配置 | 配置键、配置值、配置类型、配置分类、配置说明、是否可编辑、创建时间、更新时间 |
| 6 | **考核周期** | `tblKYMuJR25q5YRF` | 考核周期管理 | 周期ID、周期名称、年度、季度、开始日期、结束日期、状态、创建时间、更新时间 |
| 7 | **部门** | `tbleErZwijZMTcXc` | 部门架构管理 | 部门ID、部门名称、父部门ID、部门负责人ID、层级、路径、状态、创建时间 |
| 8 | **操作日志** | `tblicWLlD7zkIejz` | 审计日志记录 | 日志ID、用户ID、操作类型、资源类型、资源ID、旧值、新值、IP地址、用户代理、操作时间 |

### 4.2 环境变量配置

```bash
# 飞书应用配置
FEISHU_APP_ID=cli_a9f7f8703778dcee
FEISHU_APP_SECRET=iqMX8dolH5aObUzgM18MQbtWvtfwKymM
FEISHU_REDIRECT_URI=http://localhost:3000/auth/callback

# 飞书多维表格配置
BITABLE_APP_TOKEN=BZbibvYNfaEhgLslphYcKi8RnGf
BITABLE_TABLE_EMPLOYEES=tblx3v5rizh3ehhv
BITABLE_TABLE_OBJECTIVES=tblTrUg0j7MyToua
BITABLE_TABLE_COMPLETIONS=tblnCfcZ9IIeqbkj
BITABLE_TABLE_APPROVALS=tblQmsoGBepZKBI2
BITABLE_TABLE_CONFIG=tblL0536vf9huQeM
BITABLE_TABLE_PERIODS=tblKYMuJR25q5YRF
BITABLE_TABLE_DEPARTMENTS=tbleErZwijZMTcXc
BITABLE_TABLE_OPERATION_LOGS=tblicWLlD7zkIejz

# JWT配置
JWT_SECRET=performance-system-secret-key-2026
JWT_EXPIRES_IN=7d

# 服务配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

---

## 五、模块划分

### 5.1 后端模块清单

| 模块 | 路径 | API 数量 | 状态 | 说明 |
|------|------|----------|------|------|
| Auth | `src/modules/auth/` | 6 | ✅ 完成 | 飞书 OAuth 认证、JWT Token |
| Feishu | `src/modules/feishu/` | - | ✅ 完成 | 飞书 SDK 封装、Bitable 操作 |
| User | `src/modules/user/` | 7 | ✅ 完成 | 员工查询、下属管理 |
| Objective | `src/modules/objective/` | 12 | ✅ 完成 | 目标 CRUD、审批流程 |
| Completion | `src/modules/completion/` | 10 | ✅ 完成 | 完成情况填报、评分 |
| Admin | `src/modules/admin/` | 8 | ✅ 完成 | 数据统计、日志查询 |
| **总计** | - | **60** | ✅ | - |

### 5.2 API 接口汇总

#### 认证模块（6 个）
```
GET  /api/auth/login          # 飞书登录（重定向到飞书授权页面）
GET  /api/auth/callback      # OAuth 回调
GET  /api/auth/profile       # 获取当前用户信息
GET  /api/auth/refresh       # 刷新 Token
GET  /api/auth/logout        # 登出
GET  /api/                   # 健康检查
```

#### 员工模块（7 个）
```
GET    /api/users/me                          # 获取当前用户信息
GET    /api/users/:userId                     # 获取指定用户信息
GET    /api/users/me/subordinates             # 获取我的下属列表
GET    /api/users/:userId/subordinates        # 获取指定用户的下属列表
GET    /api/users                             # 获取所有员工列表（管理员）
GET    /api/users/department/:department      # 根据部门获取员工列表
GET    /api/users/:userId/history             # 获取用户的历史考核记录
```

#### 目标模块（12 个）
```
POST   /api/objectives                         # 创建目标
PUT    /api/objectives/:objectiveId          # 更新目标
DELETE /api/objectives/:objectiveId          # 删除目标
POST   /api/objectives/:objectiveId/submit    # 提交目标审批
POST   /api/objectives/:objectiveId/approve   # 审批目标
GET    /api/objectives/my/list                # 获取我的目标列表
GET    /api/objectives/:objectiveId           # 获取目标详情
GET    /api/objectives/subordinates/list      # 获取下属的目标列表
GET    /api/objectives/pending/approvals      # 获取待审批的目标列表
```

#### 完成情况模块（10 个）
```
POST   /api/completions                              # 创建完成情况
PUT    /api/completions/:completionId                # 更新完成情况（自评）
POST   /api/completions/:completionId/submit        # 提交完成情况
POST   /api/completions/:completionId/score         # 主管评分
GET    /api/completions/my/list                     # 获取我的完成情况列表
GET    /api/completions/:completionId               # 获取完成情况详情
GET    /api/completions/pending/scores              # 获取待评分的完成情况列表
POST   /api/completions/:completionId/archive       # 归档完成情况
```

#### 管理员模块（8 个）
```
GET /api/admin/statistics          # 获取系统统计数据
GET /api/admin/progress            # 获取考核进度统计
GET /api/admin/employee-stats      # 获取员工考核统计
GET /api/admin/department-stats    # 获取部门考核统计
GET /api/admin/export              # 导出考核数据
GET /api/admin/logs                # 获取系统操作日志
```

### 5.3 模块依赖关系

```
AuthModule
  └── 依赖: FeishuModule

UserModule
  └── 依赖: FeishuModule (BitableService)

ObjectiveModule
  ├── 依赖: FeishuModule (BitableService)
  └── 依赖: UserModule

CompletionModule
  ├── 依赖: FeishuModule (BitableService)
  └── 依赖: UserModule

AdminModule
  ├── 依赖: FeishuModule (BitableService)
  └── 依赖: UserModule
```

---

## 六、关键设计决策

### 6.1 技术选型决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 后端框架 | NestJS | 模块化架构、依赖注入、TypeScript 原生支持、企业级设计模式 |
| 数据库 | 飞书 Bitable | 与飞书生态深度集成、零运维成本、适合 100 人规模、无需额外部署 |
| 认证方式 | 飞书 OAuth + JWT | 复用企业组织架构、单点登录体验好、安全性高 |
| 字段命名 | 中文 | 业务人员可直接理解、降低沟通成本、符合国内企业习惯 |
| API 风格 | RESTful | 统一、规范、易于理解和维护 |

### 6.2 数据库设计决策

#### 表名和字段名使用中文
- **表名**：`员工信息`、`考核目标`、`完成情况`、`审批记录` 等
- **字段名**：`用户ID`、`目标标题`、`自评内容` 等
- **理由**：业务人员可直接查看表格、降低技术-业务沟通成本

#### 8 张核心表设计
1. **员工信息**：基础员工信息、部门、职位、汇报关系
2. **考核目标**：绩效目标设定、审批流程、状态管理
3. **完成情况**：完成情况填报、自评、主管评分
4. **审批记录**：所有审批操作的记录
5. **系统配置**：系统参数、可配置项
6. **考核周期**：季度、年度等考核周期管理
7. **部门**：部门架构、层级关系
8. **操作日志**：审计日志、操作记录

#### 状态机设计
- **目标状态**：草稿 → 待审批 → 已批准/已拒绝
- **完成情况状态**：草稿 → 已提交 → 已评分 → 已归档
- **审批状态**：待审批 → 已批准/已拒绝

### 6.3 API 设计决策

#### 统一响应格式
```typescript
{
  success: boolean;    // 是否成功
  message: string;   // 提示信息
  data: any;          // 数据内容
}
```

#### 权限控制
- **JWT Token**：所有 API 都需要 Bearer Token
- **角色控制**：员工、主管、管理员三级权限
- **数据权限**：只能操作自己的数据或下属的数据

#### 接口分组
- `/api/auth/*` - 认证相关
- `/api/users/*` - 员工管理
- `/api/objectives/*` - 目标管理
- `/api/completions/*` - 完成情况管理
- `/api/admin/*` - 管理员功能

---

## 七、下一步开发计划

### 7.1 当前状态
- ✅ 数据库设计（100%）
- ✅ 后端 API 开发（100%，共 39 个接口）
- ✅ 飞书集成（100%）
- ⬜ 前端项目（未开始）
- ⬜ 测试覆盖（未开始）
- ⬜ 部署上线（未开始）

### 7.2 第一阶段：测试与优化（建议 1 周）

#### 任务 1.1：启动后端服务并测试 API
- **目标**：验证所有 API 接口是否正常工作
- **步骤**：
  1. 进入 backend 目录：`cd backend`
  2. 安装依赖：`npm install`
  3. 启动服务：`npm run start:dev`
  4. 使用 Postman 或 curl 测试接口
- **关键接口测试**：
  - `GET http://localhost:3001/api/auth/login` - 测试飞书登录
  - `GET http://localhost:3001/api/users/me` - 获取当前用户（需要 Token）
  - `POST http://localhost:3001/api/objectives` - 创建目标

#### 任务 1.2：添加单元测试
- **目标**：为核心业务逻辑添加单元测试
- **测试范围**：
  - UserService - 员工查询、下属管理
  - ObjectiveService - 目标创建、更新、审批
  - CompletionService - 完成情况填报、评分
- **框架**：Jest（NestJS 内置）
- **命令**：`npm run test`

#### 任务 1.3：添加接口文档
- **目标**：生成 API 文档
- **方案**：Swagger（@nestjs/swagger）
- **访问**：`http://localhost:3001/api/docs`
- **内容**：所有接口的请求/响应参数说明

### 7.3 第二阶段：前端开发（建议 2-3 周）

#### 任务 2.1：初始化前端项目
- **技术栈**：React + TypeScript + Vite
- **UI 库**：Ant Design 5.x
- **状态管理**：Zustand 或 React Query
- **路由**：React Router 6
- **HTTP 客户端**：Axios
- **命令**：
  ```bash
  cd frontend
  npm create vite@latest . -- --template react-ts
  npm install
  npm install antd @ant-design/icons
  npm install zustand axios react-router-dom
  ```

#### 任务 2.2：核心页面开发
按优先级开发以下页面：

**第一优先级（基础功能）**：
1. **登录页面** - 飞书扫码登录
2. **首页/仪表盘** - 展示待办事项、统计数据
3. **目标管理页面** - 创建、编辑、提交目标
4. **我的目标列表** - 查看自己的目标

**第二优先级（主管功能）**：
5. **待审批页面** - 主管审批目标
6. **下属目标页面** - 查看下属的目标
7. **评分页面** - 对完成情况进行评分

**第三优先级（管理功能）**：
8. **数据统计页面** - 考核进度、员工统计
9. **系统配置页面** - 考核周期、配置项管理
10. **操作日志页面** - 查看系统日志

#### 任务 2.3：组件封装
封装常用组件，提高复用性：
- `ObjectiveCard` - 目标卡片组件
- `ObjectiveForm` - 目标表单组件
- `ApprovalStatus` - 审批状态标签
- `UserSelect` - 用户选择器
- `DepartmentTree` - 部门树形选择
- `ScoreInput` - 评分输入组件

### 7.4 第三阶段：集成与优化（建议 1 周）

#### 任务 3.1：飞书消息通知集成
- **目标审批通知**：员工提交目标后，通知主管审批
- **审批结果通知**：目标审批完成后，通知员工结果
- **评分通知**：主管评分完成后，通知员工
- **待办提醒**：定期提醒待审批、待评分事项

#### 任务 3.2：性能优化
- **API 响应优化**：添加缓存、减少数据库查询
- **前端性能**：懒加载、组件按需加载、图片压缩
- **数据库优化**：添加索引、优化查询语句

#### 任务 3.3：安全加固
- **输入验证**：所有接口添加参数校验
- **SQL 注入防护**：使用参数化查询
- **XSS 防护**：前端转义输出
- **CSRF 防护**：添加 Token 验证
- **权限控制**：细化接口权限

### 7.5 第四阶段：部署上线（建议 3-5 天）

#### 任务 4.1：测试环境部署
- **服务器准备**：阿里云/腾讯云 ECS
- **环境配置**：Node.js 18+、Redis 7
- **域名配置**：申请测试域名
- **SSL 证书**：配置 HTTPS
- **部署脚本**：编写自动化部署脚本

#### 任务 4.2：生产环境部署
- **生产服务器**：更高配置、负载均衡
- **数据库备份**：定期备份 Bitable 数据
- **监控告警**：配置日志监控、错误告警
- **CDN 加速**：静态资源加速

#### 任务 4.3：用户培训
- **管理员培训**：系统配置、数据管理
- **主管培训**：目标审批、评分操作
- **员工培训**：目标制定、完成情况填报
- **操作手册**：编写用户操作手册

---

## 八、开发环境配置

### 8.1 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: >= 2.30.0
- **Redis**: >= 7.0（可选）

### 8.2 快速启动

```bash
# 1. 克隆项目
cd /Users/simba/Library/Mobile\ Documents/com~apple~CloudDocs/Trae/网页开发/绩效考核系统/performance-system

# 2. 安装后端依赖
cd backend
npm install

# 3. 检查环境变量
cat .env  # 确保所有配置正确

# 4. 启动后端服务
npm run start:dev

# 服务将在 http://localhost:3001 启动
```

### 8.3 测试 API

```bash
# 测试健康检查
curl http://localhost:3001/api

# 测试飞书登录（浏览器访问）
open http://localhost:3001/api/auth/login

# 测试员工列表（需要 Token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/users
```

---

## 九、项目文档清单

| 文档 | 路径 | 说明 | 状态 |
|------|------|------|------|
| 开发状态文档 | `DEVELOPMENT_STATUS.md` | 本文档，记录开发进度 | ✅ 完成 |
| 项目说明 | `README.md` | 项目整体介绍 | ✅ 已有 |
| 快速开始 | `QUICKSTART.md` | 快速启动指南 | ✅ 已有 |
| 详细配置 | `SETUP.md` | 详细配置步骤 | ✅ 已有 |
| 项目状态 | `PROJECT_STATUS.md` | 开发状态跟踪 | ✅ 已有 |
| 当前状态 | `CURRENT_STATUS.md` | 最新状态说明 | ✅ 已有 |
| API 文档 | Swagger UI | 自动生成 | ⬜ 待生成 |

---

## 十、联系与支持

### 10.1 项目信息
- **项目名称**：绩效考核系统
- **当前版本**：v0.1.0（开发版）
- **最后更新**：2026年2月3日

### 10.2 开发团队
- **后端开发**：已完成全部 API 开发
- **前端开发**：待开始
- **测试**：待开始
- **部署**：待开始

### 10.3 注意事项
1. **飞书应用凭证**：请确保 `.env` 文件中的飞书应用凭证（App ID 和 App Secret）安全，不要提交到 Git
2. **Table IDs**：更换电脑后，请确认 Table IDs 仍然有效，如有变动请更新 `.env` 文件
3. **数据备份**：建议定期备份飞书 Bitable 数据
4. **测试数据**：employees 表中已有 3 个测试用户，可用于开发测试

---

## 附录：快速参考

### A. 常用命令

```bash
# 启动后端服务
cd backend && npm run start:dev

# 构建生产版本
cd backend && npm run build

# 运行测试
cd backend && npm run test

# 查看飞书表格列表
node -e "
const dotenv = require('dotenv');
const lark = require('@larksuiteoapi/node-sdk');
dotenv.config({ path: 'backend/.env' });
const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});
async function list() {
  const res = await client.bitable.appTable.list({
    path: { app_token: process.env.BITABLE_APP_TOKEN }
  });
  res.data?.items?.forEach(t => console.log(t.name, '-', t.table_id));
}
list();
"
```

### B. 核心文件路径

| 文件/目录 | 路径 |
|-----------|------|
| 后端入口 | `backend/src/main.ts` |
| 环境变量 | `backend/.env` |
| 员工服务 | `backend/src/modules/user/user.service.ts` |
| 目标服务 | `backend/src/modules/objective/objective.service.ts` |
| 完成服务 | `backend/src/modules/completion/completion.service.ts` |
| 类型定义 | `backend/src/types/index.ts` |
| 中文类型 | `backend/src/types/chinese.ts` |

---

**文档结束**

> 本文档由 Claude 生成于 2026年2月3日
> 如有疑问，请参考 `README.md` 和 `SETUP.md`
