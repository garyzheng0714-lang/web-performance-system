import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// 完成情况模块数据传输对象（DTO）

// 创建完成情况请求
export class CreateCompletionDto {
  // 目标ID
  @IsString()
  @IsNotEmpty()
  objectiveId: string;

  // 周期ID
  @IsString()
  @IsOptional()
  periodId?: string;

  // 周期名称
  @IsString()
  @IsOptional()
  periodName?: string;

  // 自评内容
  @IsString()
  @IsOptional()
  selfAssessment?: string;

  // 实际完成值
  @IsString()
  @IsOptional()
  actualValue?: string;

  // 完成率
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionRate?: number;

  // 自评分
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  selfScore?: number;
}

// 更新完成情况请求（员工自评）
export class UpdateCompletionDto {
  // 自评内容
  @IsString()
  @IsOptional()
  selfAssessment?: string;

  // 实际完成值
  @IsString()
  @IsOptional()
  actualValue?: string;

  // 完成率
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionRate?: number;

  // 自评分
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  selfScore?: number;
}

// 提交完成情况请求
export class SubmitCompletionDto {
  // 备注说明
  @IsString()
  @IsOptional()
  remark?: string;
}

// 评分请求
export class ScoreCompletionDto {
  // 主管评分
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  supervisorScore: number;

  // 校准分
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  calibrationScore?: number;

  // 主管评语
  @IsString()
  @IsOptional()
  supervisorComment?: string;
}
