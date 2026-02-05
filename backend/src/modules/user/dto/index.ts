import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// 用户模块数据传输对象（DTO）

// 更新用户信息请求
export class UpdateUserDto {
  // 用户ID
  @IsString()
  @IsNotEmpty()
  userId: string;

  // 姓名
  @IsString()
  @IsOptional()
  name?: string;

  // 邮箱
  @IsString()
  @IsOptional()
  email?: string;

  // 部门
  @IsString()
  @IsOptional()
  department?: string;

  // 职位
  @IsString()
  @IsOptional()
  position?: string;

  // 主管ID
  @IsString()
  @IsOptional()
  supervisorId?: string;

  // 角色
  @IsString()
  @IsOptional()
  role?: string;

  // 状态
  @IsString()
  @IsOptional()
  status?: string;
}

// 查询用户列表请求
export class QueryUsersDto {
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

  // 部门筛选
  @IsString()
  @IsOptional()
  department?: string;

  // 角色筛选
  @IsString()
  @IsOptional()
  role?: string;

  // 状态筛选
  @IsString()
  @IsOptional()
  status?: string;

  // 搜索关键词
  @IsString()
  @IsOptional()
  keyword?: string;
}

// 创建用户请求
export class CreateUserDto {
  // 用户ID
  @IsString()
  @IsNotEmpty()
  userId: string;

  // 姓名
  @IsString()
  @IsNotEmpty()
  name: string;

  // 邮箱
  @IsString()
  @IsNotEmpty()
  email: string;

  // 部门
  @IsString()
  @IsNotEmpty()
  department: string;

  // 职位
  @IsString()
  @IsNotEmpty()
  position: string;

  // 主管ID
  @IsString()
  @IsOptional()
  supervisorId?: string;

  // 角色
  @IsString()
  @IsNotEmpty()
  role: string;

  // 状态
  @IsString()
  @IsOptional()
  status?: string;
}
