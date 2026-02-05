// 用户角色枚举
export enum UserRole {
  EMPLOYEE = '员工',
  SUPERVISOR = '主管',
  ADMIN = '管理员',
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = '在职',
  INACTIVE = '离职',
}

// 目标状态枚举
export enum ObjectiveStatus {
  DRAFT = '草稿',
  PENDING = '待审批',
  APPROVED = '已批准',
  REJECTED = '已拒绝',
}

// 完成情况状态枚举
export enum CompletionStatus {
  DRAFT = '草稿',
  SUBMITTED = '已提交',
  SCORED = '已评分',
  ARCHIVED = '已归档',
}

// 审批类型枚举
export enum ApprovalType {
  OBJECTIVE = '目标审批',
  SCORE = '评分审批',
  UNLOCK = '修改申请',
}

// 审批状态枚举
export enum ApprovalStatus {
  PENDING = '待审批',
  APPROVED = '已批准',
  REJECTED = '已拒绝',
}

// 用户信息接口
export interface Employee {
  user_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  supervisor_id: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

// 考核目标接口
export interface Objective {
  objective_id: string;
  user_id: string;
  period: string;
  title: string;
  description: string;
  weight: number;
  target: string;
  status: ObjectiveStatus;
  submitted_at?: string;
  approved_at?: string;
  supervisor_comment?: string;
  created_at: string;
  updated_at: string;
}

// 考核完成情况接口
export interface Completion {
  completion_id: string;
  objective_id: string;
  user_id: string;
  period: string;
  self_assessment: string;
  actual_value: string;
  self_score: number;
  supervisor_score?: number;
  supervisor_comment?: string;
  status: CompletionStatus;
  submitted_at?: string;
  scored_at?: string;
  created_at: string;
  updated_at: string;
}

// 审批记录接口
export interface Approval {
  approval_id: string;
  type: ApprovalType;
  related_id: string;
  applicant_id: string;
  approver_id: string;
  status: ApprovalStatus;
  comment?: string;
  submitted_at: string;
  processed_at?: string;
}

// 系统配置接口
export interface SystemConfig {
  config_key: string;
  config_value: string;
  description: string;
  updated_at: string;
}

// JWT Payload接口
export interface JwtPayload {
  user_id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// 飞书API响应接口
export interface FeishuApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 飞书多维表格记录接口
export interface BitableRecord {
  record_id: string;
  fields: Record<string, any>;
  created_time: number;
  last_modified_time: number;
}

// 考核周期状态枚举
export enum PeriodStatus {
  PLANNING = '准备中',
  ACTIVE = '进行中',
  REVIEWING = '评分中',
  CALIBRATING = '校准中',
  COMPLETED = '已完成',
  ARCHIVED = '已归档',
}

// 部门状态枚举
export enum DepartmentStatus {
  ACTIVE = '启用',
  INACTIVE = '停用',
}

// 操作类型枚举
export enum OperationType {
  CREATE = '创建',
  UPDATE = '更新',
  DELETE = '删除',
  APPROVE = '审批',
  REJECT = '拒绝',
  SCORE = '评分',
}

// 资源类型枚举
export enum ResourceType {
  OBJECTIVE = '目标',
  COMPLETION = '完成情况',
  APPROVAL = '审批',
  EMPLOYEE = '员工',
  PERIOD = '考核周期',
  DEPARTMENT = '部门',
}

// 考核周期接口
export interface Period {
  周期ID: string;
  周期名称: string;
  年度: number;
  季度: number;
  开始日期: string;
  结束日期: string;
  状态: PeriodStatus;
  创建时间: string;
  更新时间: string;
}

// 部门接口
export interface Department {
  部门ID: string;
  部门名称: string;
  父部门ID: string;
  部门负责人ID: string;
  层级: number;
  路径: string;
  状态: DepartmentStatus;
  创建时间: string;
}

// 操作日志接口
export interface OperationLog {
  日志ID: string;
  用户ID: string;
  操作类型: OperationType;
  资源类型: ResourceType;
  资源ID: string;
  旧值: string;
  新值: string;
  IP地址: string;
  用户代理: string;
  操作时间: string;
}

// 飞书用户信息接口
export interface FeishuUser {
  union_id: string;
  user_id: string;
  open_id: string;
  name: string;
  en_name: string;
  email: string;
  mobile: string;
  avatar_url: string;
}

// 导出中文类型定义
export * from './chinese';
