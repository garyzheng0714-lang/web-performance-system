# 运维监控方案（建议）

## 健康检查
- `GET /api/health`
- 期望返回 `{ status: "ok" }`

## 日志
- 服务端通过 Nest Logger 输出请求日志与异常日志
- 操作日志写入飞书多维表格（`BITABLE_TABLE_OPERATION_LOGS`）

## 监控建议
1. 使用反向代理（Nginx）统一 HTTPS、限流、日志
2. 使用进程守护（PM2/systemd）保证后端自恢复
3. 接入 APM（如 Sentry/Datadog）监控异常与性能
4. 关键指标：
   - API 响应耗时（P95）
   - 4xx/5xx 比例
   - OAuth 登录成功率
   - 飞书 API 调用失败率

## 备份策略
- 多维表格数据导出：
  - 管理员可通过 `/api/admin/export` 导出 JSON
  - 建议定期备份到对象存储（OSS/S3）

## 灰度与回滚
- 新版本先在测试租户/企业验证
- 关键接口保留旧版本一段时间
- 前端静态资源版本化（hash）
