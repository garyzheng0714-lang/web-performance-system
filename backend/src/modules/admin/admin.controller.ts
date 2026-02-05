import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('管理员功能')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 获取系统统计数据
   */
  @Get('statistics')
  @ApiOperation({ summary: '获取系统统计数据' })
  async getStatistics(
    @Request() req,
    @Query('periodId') periodId?: string,
  ) {
    // 检查是否为管理员
    if (req.user.role !== '管理员') {
      return {
        success: false,
        message: '无权限访问此接口',
      };
    }
    return this.adminService.getStatistics(periodId);
  }

  /**
   * 获取考核进度统计
   */
  @Get('progress')
  @ApiOperation({ summary: '获取考核进度统计' })
  async getProgress(
    @Request() req,
    @Query('periodId') periodId?: string,
    @Query('department') department?: string,
  ) {
    if (req.user.role !== '管理员') {
      return {
        success: false,
        message: '无权限访问此接口',
      };
    }
    return this.adminService.getProgress(periodId, department);
  }

  /**
   * 获取员工考核统计
   */
  @Get('employee-stats')
  @ApiOperation({ summary: '获取员工考核统计' })
  async getEmployeeStats(
    @Request() req,
    @Query('periodId') periodId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
  ) {
    if (req.user.role !== '管理员') {
      return {
        success: false,
        message: '无权限访问此接口',
      };
    }
    return this.adminService.getEmployeeStats(periodId, page, pageSize);
  }

  /**
   * 获取部门考核统计
   */
  @Get('department-stats')
  @ApiOperation({ summary: '获取部门考核统计' })
  async getDepartmentStats(
    @Request() req,
    @Query('periodId') periodId?: string,
  ) {
    if (req.user.role !== '管理员') {
      return {
        success: false,
        message: '无权限访问此接口',
      };
    }
    return this.adminService.getDepartmentStats(periodId);
  }

  /**
   * 导出考核数据
   */
  @Get('export')
  @ApiOperation({ summary: '导出考核数据' })
  async exportData(
    @Request() req,
    @Query('periodId') periodId?: string,
    @Query('department') department?: string,
    @Query('format') format: string = 'excel',
  ) {
    if (req.user.role !== '管理员') {
      return {
        success: false,
        message: '无权限访问此接口',
      };
    }
    return this.adminService.exportData(periodId, department, format);
  }

  /**
   * 获取系统日志
   */
  @Get('logs')
  @ApiOperation({ summary: '获取系统操作日志' })
  async getSystemLogs(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
    @Query('userId') userId?: string,
    @Query('operation') operation?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (req.user.role !== '管理员') {
      return {
        success: false,
        message: '无权限访问此接口',
      };
    }
    return this.adminService.getSystemLogs(page, pageSize, {
      userId,
      operation,
      startDate,
      endDate,
    });
  }
}
