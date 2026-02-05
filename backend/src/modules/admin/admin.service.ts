import { Injectable, Logger } from '@nestjs/common';
import { BitableService } from '../feishu/bitable.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly bitableService: BitableService) {}

  /**
   * 获取系统统计数据
   * @param periodId 考核周期ID
   */
  async getStatistics(periodId?: string) {
    this.logger.log(`获取系统统计数据: periodId=${periodId}`);

    // 统计员工总数
    const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES;
    const employees = await this.bitableService.findRecords(employeesTableId);
    const totalEmployees = employees.length;

    // 统计目标总数
    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    const objectives = await this.bitableService.findRecords(objectivesTableId);
    const totalObjectives = objectives.length;

    // 按状态统计目标
    const statusCount = {
      draft: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    objectives.forEach((obj) => {
      const status = obj.fields?.['状态'];
      if (status === '草稿') statusCount.draft++;
      else if (status === '待审批') statusCount.pending++;
      else if (status === '已批准') statusCount.approved++;
      else if (status === '已拒绝') statusCount.rejected++;
    });

    return {
      success: true,
      data: {
        totalEmployees,
        totalObjectives,
        statusCount,
        periodId: periodId || 'all',
      },
    };
  }

  /**
   * 获取考核进度统计
   * @param periodId 考核周期ID
   * @param department 部门名称
   */
  async getProgress(periodId?: string, department?: string) {
    this.logger.log(`获取考核进度统计: periodId=${periodId}, department=${department}`);

    // 获取员工列表
    const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES;
    let employeeFilter = '';
    if (department) {
      employeeFilter = `CurrentValue.[部门] = "${department}"`;
    }
    const employees = await this.bitableService.findRecords(
      employeesTableId,
      employeeFilter || undefined,
    );

    // 统计各部门人数
    const departmentStats: Record<string, number> = {};
    employees.forEach((emp) => {
      const dept = emp.fields?.['部门'] || '未分配';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });

    // 获取目标统计
    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    let objectiveFilter = '';
    if (periodId) {
      objectiveFilter = `CurrentValue.[周期ID] = "${periodId}"`;
    }
    const objectives = await this.bitableService.findRecords(
      objectivesTableId,
      objectiveFilter || undefined,
    );

    // 统计目标完成情况
    let submittedCount = 0;
    let approvedCount = 0;
    objectives.forEach((obj) => {
      const status = obj.fields?.['状态'];
      if (status === '已批准') {
        approvedCount++;
        submittedCount++;
      } else if (status === '待审批' || status === '已拒绝') {
        submittedCount++;
      }
    });

    return {
      success: true,
      data: {
        totalEmployees: employees.length,
        departmentStats,
        totalObjectives: objectives.length,
        submittedCount,
        approvedCount,
        completionRate: objectives.length > 0 ? Math.round((approvedCount / objectives.length) * 100) : 0,
        periodId: periodId || 'all',
        department: department || 'all',
      },
    };
  }

  /**
   * 获取员工考核统计
   * @param periodId 考核周期ID
   * @param page 页码
   * @param pageSize 每页数量
   */
  async getEmployeeStats(periodId?: string, page = 1, pageSize = 50) {
    this.logger.log(`获取员工考核统计: periodId=${periodId}, page=${page}, pageSize=${pageSize}`);

    // 获取员工列表
    const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES;
    const employees = await this.bitableService.findRecords(employeesTableId);

    // 获取所有目标
    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    let objectiveFilter = '';
    if (periodId) {
      objectiveFilter = `CurrentValue.[周期ID] = "${periodId}"`;
    }
    const objectives = await this.bitableService.findRecords(
      objectivesTableId,
      objectiveFilter || undefined,
    );

    // 统计每个员工的数据
    const employeeStats = employees.map((emp) => {
      const userId = emp.fields?.['用户ID'];
      const userObjectives = objectives.filter((obj) => obj.fields?.['用户ID'] === userId);

      const totalObjectives = userObjectives.length;
      const approvedObjectives = userObjectives.filter((obj) => obj.fields?.['状态'] === '已批准').length;
      const pendingObjectives = userObjectives.filter((obj) => obj.fields?.['状态'] === '待审批').length;
      const draftObjectives = userObjectives.filter((obj) => obj.fields?.['状态'] === '草稿').length;

      return {
        userId,
        name: emp.fields?.['姓名'] || '',
        department: emp.fields?.['部门'] || '',
        position: emp.fields?.['职位'] || '',
        role: emp.fields?.['角色'] || '',
        stats: {
          total: totalObjectives,
          approved: approvedObjectives,
          pending: pendingObjectives,
          draft: draftObjectives,
          completionRate: totalObjectives > 0 ? Math.round((approvedObjectives / totalObjectives) * 100) : 0,
        },
      };
    });

    // 分页
    const total = employeeStats.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedStats = employeeStats.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        total,
        page,
        pageSize,
        list: paginatedStats,
        periodId: periodId || 'all',
      },
    };
  }

  /**
   * 获取部门考核统计
   * @param periodId 考核周期ID
   */
  async getDepartmentStats(periodId?: string) {
    this.logger.log(`获取部门考核统计: periodId=${periodId}`);

    // 获取所有员工
    const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES;
    const employees = await this.bitableService.findRecords(employeesTableId);

    // 按部门分组统计
    const departmentMap: Record<string, any> = {};

    employees.forEach((emp) => {
      const dept = emp.fields?.['部门'] || '未分配';
      if (!departmentMap[dept]) {
        departmentMap[dept] = {
          department: dept,
          employeeCount: 0,
          employees: [],
        };
      }
      departmentMap[dept].employeeCount++;
      departmentMap[dept].employees.push({
        userId: emp.fields?.['用户ID'],
        name: emp.fields?.['姓名'],
        position: emp.fields?.['职位'],
        role: emp.fields?.['角色'],
      });
    });

    // 获取所有目标
    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    let objectiveFilter = '';
    if (periodId) {
      objectiveFilter = `CurrentValue.[周期ID] = "${periodId}"`;
    }
    const objectives = await this.bitableService.findRecords(
      objectivesTableId,
      objectiveFilter || undefined,
    );

    // 统计每个部门的目标完成情况
    const departmentList = Object.values(departmentMap).map((dept: any) => {
      const userIds = dept.employees.map((e: any) => e.userId);
      const deptObjectives = objectives.filter((obj) =>
        userIds.includes(obj.fields?.['用户ID']),
      );

      const totalObjectives = deptObjectives.length;
      const approvedObjectives = deptObjectives.filter(
        (obj) => obj.fields?.['状态'] === '已批准',
      ).length;
      const pendingObjectives = deptObjectives.filter(
        (obj) => obj.fields?.['状态'] === '待审批',
      ).length;

      return {
        ...dept,
        stats: {
          total: totalObjectives,
          approved: approvedObjectives,
          pending: pendingObjectives,
          completionRate: totalObjectives > 0 ? Math.round((approvedObjectives / totalObjectives) * 100) : 0,
        },
      };
    });

    return {
      success: true,
      data: {
        totalDepartments: departmentList.length,
        totalEmployees: employees.length,
        list: departmentList,
        periodId: periodId || 'all',
      },
    };
  }

  /**
   * 导出考核数据
   * @param periodId 考核周期ID
   * @param department 部门名称
   * @param format 导出格式
   */
  async exportData(periodId?: string, department?: string, format = 'excel') {
    this.logger.log(`导出考核数据: periodId=${periodId}, department=${department}, format=${format}`);

    // 获取员工数据
    const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES;
    let employeeFilter = '';
    if (department) {
      employeeFilter = `CurrentValue.[部门] = "${department}"`;
    }
    const employees = await this.bitableService.findRecords(
      employeesTableId,
      employeeFilter || undefined,
    );

    // 获取目标数据
    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    let objectiveFilter = '';
    if (periodId) {
      objectiveFilter = `CurrentValue.[周期ID] = "${periodId}"`;
    }
    const objectives = await this.bitableService.findRecords(
      objectivesTableId,
      objectiveFilter || undefined,
    );

    // 获取完成情况数据
    const completionsTableId = process.env.BITABLE_TABLE_COMPLETIONS;
    const completions = await this.bitableService.findRecords(completionsTableId);

    // 整理导出数据
    const exportData = employees.map((emp) => {
      const userId = emp.fields?.['用户ID'];
      const userObjectives = objectives.filter((obj) => obj.fields?.['用户ID'] === userId);
      const userCompletions = completions.filter((comp) => comp.fields?.['用户ID'] === userId);

      return {
        员工ID: userId,
        姓名: emp.fields?.['姓名'],
        部门: emp.fields?.['部门'],
        职位: emp.fields?.['职位'],
        角色: emp.fields?.['角色'],
        目标数量: userObjectives.length,
        已批准目标: userObjectives.filter((obj) => obj.fields?.['状态'] === '已批准').length,
        完成情况数量: userCompletions.length,
        已评分: userCompletions.filter((comp) => comp.fields?.['状态'] === '已评分').length,
      };
    });

    // TODO: 根据 format 生成文件（excel/csv/json）

    return {
      success: true,
      message: '数据导出成功',
      data: {
        format,
        totalRecords: exportData.length,
        data: exportData,
        // TODO: 返回文件下载链接
      },
    };
  }

  /**
   * 获取系统操作日志
   * @param page 页码
   * @param pageSize 每页数量
   * @param filters 筛选条件
   */
  async getSystemLogs(
    page = 1,
    pageSize = 50,
    filters?: {
      userId?: string;
      operation?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    this.logger.log(`获取系统日志: page=${page}, pageSize=${pageSize}`);

    const logsTableId = process.env.BITABLE_TABLE_OPERATION_LOGS;

    // 构建筛选条件
    let filter = '';
    const conditions: string[] = [];

    if (filters?.userId) {
      conditions.push(`CurrentValue.[用户ID] = "${filters.userId}"`);
    }
    if (filters?.operation) {
      conditions.push(`CurrentValue.[操作类型] = "${filters.operation}"`);
    }
    if (filters?.startDate) {
      conditions.push(`CurrentValue.[操作时间] >= "${filters.startDate}"`);
    }
    if (filters?.endDate) {
      conditions.push(`CurrentValue.[操作时间] <= "${filters.endDate}"`);
    }

    if (conditions.length > 0) {
      filter = conditions.join(' AND ');
    }

    // 查询日志
    const logs = await this.bitableService.findRecords(
      logsTableId,
      filter || undefined,
      pageSize,
    );

    // 格式化日志数据
    const formattedLogs = logs.map((log) => ({
      logId: log.fields?.['日志ID'],
      userId: log.fields?.['用户ID'],
      operationType: log.fields?.['操作类型'],
      resourceType: log.fields?.['资源类型'],
      resourceId: log.fields?.['资源ID'],
      oldValue: log.fields?.['旧值'],
      newValue: log.fields?.['新值'],
      ipAddress: log.fields?.['IP地址'],
      userAgent: log.fields?.['用户代理'],
      operationTime: log.fields?.['操作时间'],
    }));

    return {
      success: true,
      data: {
        total: formattedLogs.length,
        page,
        pageSize,
        list: formattedLogs,
      },
    };
  }
}
