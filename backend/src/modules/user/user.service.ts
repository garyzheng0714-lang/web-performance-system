import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BitableService } from '../feishu/bitable.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly tableId = process.env.BITABLE_TABLE_EMPLOYEES;

  constructor(private readonly bitableService: BitableService) {}

  /**
   * 获取当前用户信息
   * @param userId 用户ID
   */
  async getCurrentUser(userId: string) {
    this.logger.log(`获取当前用户信息: ${userId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${userId}"`,
    );

    if (records.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const user = this.formatUser(records[0]);
    return {
      success: true,
      data: user,
    };
  }

  /**
   * 根据ID获取用户信息
   * @param userId 用户ID
   */
  async getUserById(userId: string) {
    this.logger.log(`查询用户信息: ${userId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${userId}"`,
    );

    if (records.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const user = this.formatUser(records[0]);
    return {
      success: true,
      data: user,
    };
  }

  /**
   * 获取用户的下属列表
   * @param supervisorId 主管ID
   */
  async getSubordinates(supervisorId: string) {
    this.logger.log(`获取下属列表: ${supervisorId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[主管ID] = "${supervisorId}"`,
    );

    const subordinates = records.map((record) => this.formatUser(record));

    return {
      success: true,
      data: {
        total: subordinates.length,
        list: subordinates,
      },
    };
  }

  /**
   * 获取所有员工列表（管理员使用）
   * @param page 页码
   * @param pageSize 每页数量
   */
  async getAllUsers(page = 1, pageSize = 50) {
    this.logger.log(`获取所有员工列表: page=${page}, pageSize=${pageSize}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      undefined,
      pageSize,
    );

    const users = records.map((record) => this.formatUser(record));

    return {
      success: true,
      data: {
        total: users.length,
        page,
        pageSize,
        list: users,
      },
    };
  }

  /**
   * 根据部门获取员工列表
   * @param department 部门名称
   */
  async getUsersByDepartment(department: string) {
    this.logger.log(`获取部门员工: ${department}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[部门] = "${department}"`,
    );

    const users = records.map((record) => this.formatUser(record));

    return {
      success: true,
      data: {
        department,
        total: users.length,
        list: users,
      },
    };
  }

  /**
   * 获取用户的历史考核记录
   * @param userId 用户ID
   */
  async getUserHistory(userId: string) {
    this.logger.log(`获取用户历史记录: ${userId}`);

    // 这里需要查询考核目标和完成情况表
    // 暂时返回用户基本信息
    const user = await this.getUserById(userId);

    return {
      success: true,
      data: {
        user: user.data,
        history: [],
      },
    };
  }

  /**
   * 格式化用户数据
   * @param record 飞书记录
   */
  private formatUser(record: any) {
    const fields = record.fields || {};
    return {
      recordId: record.record_id,
      userId: fields['用户ID'] || '',
      name: fields['姓名'] || '',
      email: fields['邮箱'] || '',
      department: fields['部门'] || '',
      position: fields['职位'] || '',
      supervisorId: fields['主管ID'] || '',
      role: fields['角色'] || '',
      status: fields['状态'] || '',
      entryDate: fields['入职日期'] || '',
      createdAt: fields['创建时间'] || '',
    };
  }
}
