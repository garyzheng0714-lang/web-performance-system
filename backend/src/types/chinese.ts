/**
 * 中文表名的类型定义
 * 对应飞书Bitable中的中文表名字段
 */

// ==================== 枚举类型 ====================

// 员工状态枚举
export enum 员工状态 {
  在职 = '在职',
  离职 = '离职',
}

// 目标状态枚举
export enum 目标状态 {
  草稿 = '草稿',
  待审批 = '待审批',
  已批准 = '已批准',
  已拒绝 = '已拒绝',
}

// 完成情况状态枚举
export enum 完成情况状态 {
  草稿 = '草稿',
  已提交 = '已提交',
  已评分 = '已评分',
  已归档 = '已归档',
}

// 审批类型枚举
export enum 审批类型 {
  目标审批 = '目标审批',
  评分审批 = '评分审批',
  修改申请 = '修改申请',
}

// 审批状态枚举
export enum 审批状态 {
  待审批 = '待审批',
  已批准 = '已批准',
  已拒绝 = '已拒绝',
}

// ==================== 接口定义 ====================

// 员工信息接口
export interface 员工信息 {
  用户ID: string;
  姓名: string;
  邮箱: string;
  部门: string;
  职位: string;
  主管ID: string;
  角色: string;
  状态: 员工状态;
  入职日期: string;
  创建时间: string;
}

// 考核目标接口
export interface 考核目标 {
  目标ID: string;
  用户ID: string;
  周期ID: string;
  周期名称: string;
  目标标题: string;
  目标描述: string;
  目标类型: string;
  权重: number;
  目标值: string;
  优先级: string;
  截止日期: string;
  状态: 目标状态;
  提交时间?: string;
  审批时间?: string;
  主管意见?: string;
  父目标ID?: string;
  创建时间: string;
  更新时间: string;
}

// 完成情况接口
export interface 完成情况 {
  完成ID: string;
  目标ID: string;
  用户ID: string;
  周期ID: string;
  周期名称: string;
  自评内容: string;
  实际完成值: string;
  完成率: number;
  自评分: number;
  主管评分?: number;
  校准分?: number;
  主管评语?: string;
  证明材料?: string;
  状态: 完成情况状态;
  提交时间?: string;
  评分时间?: string;
  创建时间: string;
  更新时间: string;
}

// 审批记录接口
export interface 审批记录 {
  审批ID: string;
  审批类型: 审批类型;
  关联ID: string;
  关联类型: string;
  申请人ID: string;
  申请人姓名: string;
  审批人ID: string;
  审批人姓名: string;
  状态: 审批状态;
  审批意见?: string;
  备注?: string;
  提交时间: string;
  处理时间?: string;
}

// 系统配置接口
export interface 系统配置 {
  配置键: string;
  配置值: string;
  配置类型: string;
  配置分类: string;
  配置说明: string;
  是否可编辑: boolean;
  创建时间: string;
  更新时间: string;
}

// ==================== 扩展的3张表 ====================

// 考核周期状态枚举
export enum 考核周期状态 {
  准备中 = '准备中',
  进行中 = '进行中',
  评分中 = '评分中',
  校准中 = '校准中',
  已完成 = '已完成',
  已归档 = '已归档',
}

// 部门状态枚举
export enum 部门状态 {
  启用 = '启用',
  停用 = '停用',
}

// 操作类型枚举
export enum 操作类型 {
  创建 = '创建',
  更新 = '更新',
  删除 = '删除',
  审批 = '审批',
  拒绝 = '拒绝',
  评分 = '评分',
}

// 资源类型枚举
export enum 资源类型 {
  目标 = '目标',
  完成情况 = '完成情况',
  审批 = '审批',
  员工 = '员工',
  考核周期 = '考核周期',
  部门 = '部门',
}

// 考核周期接口
export interface 考核周期 {
  周期ID: string;
  周期名称: string;
  年度: number;
  季度: number;
  开始日期: string;
  结束日期: string;
  状态: 考核周期状态;
  创建时间: string;
  更新时间: string;
}

// 部门接口
export interface 部门 {
  部门ID: string;
  部门名称: string;
  父部门ID: string;
  部门负责人ID: string;
  层级: number;
  路径: string;
  状态: 部门状态;
  创建时间: string;
}

// 操作日志接口
export interface 操作日志 {
  日志ID: string;
  用户ID: string;
  操作类型: 操作类型;
  资源类型: 资源类型;
  资源ID: string;
  旧值: string;
  新值: string;
  IP地址: string;
  用户代理: string;
  操作时间: string;
}
