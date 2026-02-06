import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../types';

@ApiTags('管理员功能')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 获取系统统计数据
   */
  @Get('statistics')
  @ApiOperation({ summary: '获取系统统计数据' })
  @Roles(UserRole.ADMIN)
  async getStatistics(
    @Query('periodId') periodId?: string,
  ) {
    return this.adminService.getStatistics(periodId);
  }

  /**
   * 获取考核进度统计
   */
  @Get('progress')
  @ApiOperation({ summary: '获取考核进度统计' })
  @Roles(UserRole.ADMIN)
  async getProgress(
    @Query('periodId') periodId?: string,
    @Query('department') department?: string,
  ) {
    return this.adminService.getProgress(periodId, department);
  }

  /**
   * 获取员工考核统计
   */
  @Get('employee-stats')
  @ApiOperation({ summary: '获取员工考核统计' })
  @Roles(UserRole.ADMIN)
  async getEmployeeStats(
    @Query('periodId') periodId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
  ) {
    return this.adminService.getEmployeeStats(periodId, page, pageSize);
  }

  /**
   * 获取部门考核统计
   */
  @Get('department-stats')
  @ApiOperation({ summary: '获取部门考核统计' })
  @Roles(UserRole.ADMIN)
  async getDepartmentStats(
    @Query('periodId') periodId?: string,
  ) {
    return this.adminService.getDepartmentStats(periodId);
  }

  /**
   * 导出考核数据
   */
  @Get('export')
  @ApiOperation({ summary: '导出考核数据' })
  @Roles(UserRole.ADMIN)
  async exportData(
    @Query('periodId') periodId?: string,
    @Query('department') department?: string,
    @Query('format') format: string = 'excel',
  ) {
    return this.adminService.exportData(periodId, department, format);
  }

  /**
   * 获取系统日志
   */
  @Get('logs')
  @ApiOperation({ summary: '获取系统操作日志' })
  @Roles(UserRole.ADMIN)
  async getSystemLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
    @Query('userId') userId?: string,
    @Query('operation') operation?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getSystemLogs(page, pageSize, {
      userId,
      operation,
      startDate,
      endDate,
    });
  }
}
