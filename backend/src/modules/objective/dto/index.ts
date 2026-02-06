import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// 目标模块数据传输对象（DTO）

// 创建目标请求
export class CreateObjectiveDto {
  // 目标标题
  @IsString()
  @IsNotEmpty()
  title: string;

  // 目标描述
  @IsString()
  @IsOptional()
  description?: string;

  // 周期ID
  @IsString()
  @IsOptional()
  periodId?: string;

  // 周期名称
  @IsString()
  @IsOptional()
  periodName?: string;

  // 目标类型（支持自定义）
  @IsString()
  @IsOptional()
  type?: string;

  // 权重
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  weight?: number;

  // 目标值
  @IsString()
  @IsOptional()
  target?: string;

  // 优先级（高/中/低）
  @IsString()
  @IsIn(['高', '中', '低'])
  @IsOptional()
  priority?: string;

  // 截止日期
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  // 父目标ID
  @IsString()
  @IsOptional()
  parentId?: string;
}

// 更新目标请求
export class UpdateObjectiveDto {
  // 目标标题
  @IsString()
  @IsOptional()
  title?: string;

  // 目标描述
  @IsString()
  @IsOptional()
  description?: string;

  // 周期ID
  @IsString()
  @IsOptional()
  periodId?: string;

  // 周期名称
  @IsString()
  @IsOptional()
  periodName?: string;

  // 目标类型
  @IsString()
  @IsOptional()
  type?: string;

  // 权重
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  weight?: number;

  // 目标值
  @IsString()
  @IsOptional()
  target?: string;

  // 优先级
  @IsString()
  @IsIn(['高', '中', '低'])
  @IsOptional()
  priority?: string;

  // 截止日期
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  // 父目标ID
  @IsString()
  @IsOptional()
  parentId?: string;
}

// 提交目标审批请求
export class SubmitObjectiveDto {
  // 备注说明
  @IsString()
  @IsOptional()
  remark?: string;
}

// 审批目标请求
export class ApproveObjectiveDto {
  // 是否批准
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  // 审批意见
  @IsString()
  @IsOptional()
  comment?: string;
}

// 查询目标列表请求
export class QueryObjectivesDto {
  // 页码
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  // 每页数量
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  @IsOptional()
  pageSize?: number;

  // 状态筛选
  @IsString()
  @IsOptional()
  status?: string;

  // 周期ID筛选
  @IsString()
  @IsOptional()
  periodId?: string;

  // 类型筛选
  @IsString()
  @IsOptional()
  type?: string;

  // 搜索关键词
  @IsString()
  @IsOptional()
  keyword?: string;
}
