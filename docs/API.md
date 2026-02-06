# API 文档（摘要版）

基础前缀：`/api`

认证方式：除登录/回调外，其余接口需在 Header 中携带 `Authorization: Bearer <token>`。

统一响应格式：
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-02-05T12:00:00.000Z",
  "path": "/api/xxx"
}
```

错误响应：
```json
{
  "success": false,
  "message": "错误信息",
  "error": {
    "statusCode": 400,
    "detail": {}
  },
  "timestamp": "2026-02-05T12:00:00.000Z",
  "path": "/api/xxx"
}
```

## 认证
- `GET /api/auth/login` 发起飞书登录
- `GET /api/auth/callback?code=...` OAuth 回调
- `GET /api/auth/profile` 获取当前用户信息
- `GET /api/auth/refresh` 刷新 Token
- `GET /api/auth/logout` 登出
- `GET /api/health` 健康检查

## 用户
- `GET /api/users/me` 获取当前用户信息
- `GET /api/users/:userId` 获取指定用户信息
- `GET /api/users/me/subordinates` 获取我的下属列表
- `GET /api/users/:userId/subordinates` 获取指定用户下属列表
- `GET /api/users` 获取所有员工列表
  - Query: `page`, `pageSize`
- `GET /api/users/department/:department` 按部门查询
- `GET /api/users/:userId/history` 获取历史记录（目标 + 完成情况）
- `POST /api/users` 创建用户（管理员）
- `PUT /api/users/:userId` 更新用户（管理员）
- `DELETE /api/users/:userId` 删除用户（管理员）

## 目标
- `POST /api/objectives` 创建目标
- `PUT /api/objectives/:objectiveId` 更新目标
- `DELETE /api/objectives/:objectiveId` 删除目标
- `POST /api/objectives/:objectiveId/submit` 提交审批
- `POST /api/objectives/:objectiveId/approve` 主管审批
- `GET /api/objectives/my/list` 获取我的目标
  - Query: `status`, `periodId`, `type`, `keyword`, `page`, `pageSize`
- `GET /api/objectives/:objectiveId` 获取目标详情
- `GET /api/objectives/subordinates/list` 获取下属目标
  - Query: `userId`, `status`, `periodId`, `type`, `keyword`, `page`, `pageSize`
- `GET /api/objectives/pending/approvals` 待审批列表

## 完成情况
- `POST /api/completions` 创建完成情况
- `PUT /api/completions/:completionId` 更新完成情况
- `POST /api/completions/:completionId/submit` 提交完成情况
- `POST /api/completions/:completionId/score` 主管评分
- `GET /api/completions/my/list` 获取我的完成情况
  - Query: `status`, `periodId`, `page`, `pageSize`
- `GET /api/completions/:completionId` 获取完成情况详情
- `GET /api/completions/pending/scores` 待评分列表
- `POST /api/completions/:completionId/archive` 归档完成情况
- `DELETE /api/completions/:completionId` 删除完成情况（仅草稿）

## 管理员
- `GET /api/admin/statistics` 系统统计
- `GET /api/admin/progress` 考核进度
- `GET /api/admin/employee-stats` 员工统计
- `GET /api/admin/department-stats` 部门统计
- `GET /api/admin/export` 导出数据
- `GET /api/admin/logs` 操作日志
  - Query: `page`, `pageSize`, `userId`, `operation`, `startDate`, `endDate`

## Swagger
开发环境访问：`/api/docs`
