import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { BitableService } from '../feishu/bitable.service';
import { OperationLogService } from '../operation-log/operation-log.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly tableId = process.env.BITABLE_TABLE_EMPLOYEES;

  constructor(
    private readonly bitableService: BitableService,
    private readonly operationLogService: OperationLogService,
  ) {
    if (!this.tableId) {
      throw new Error('BITABLE_TABLE_EMPLOYEES 未配置');
    }
  }

  /**
   * 获取当前用户信息
   * @param userId 用户ID
   */
  async getCurrentUser(userId: string) {
    this.logger.log(`获取当前用户信息: ${userId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`,
    );

    if (records.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUser(records[0]);
  }

  /**
   * 根据ID获取用户信息
   * @param userId 用户ID
   */
  async getUserById(userId: string) {
    this.logger.log(`查询用户信息: ${userId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`,
    );

    if (records.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUser(records[0]);
  }

  /**
   * 获取用户的下属列表
   * @param supervisorId 主管ID
   */
  async getSubordinates(supervisorId: string) {
    this.logger.log(`获取下属列表: ${supervisorId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[主管ID] = "${this.escapeFilterValue(supervisorId)}"`,
    );

    const subordinates = records.map((record) => this.formatUser(record));

    return {
      total: subordinates.length,
      list: subordinates,
    };
  }

  /**
   * 获取所有员工列表（管理员使用）
   * @param page 页码
   * @param pageSize 每页数量
   */
  async getAllUsers(page = 1, pageSize = 50) {
    this.logger.log(`获取所有员工列表: page=${page}, pageSize=${pageSize}`);

    const records = await this.bitableService.findRecords(this.tableId);

    const users = records.map((record) => this.formatUser(record));
    const total = users.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedUsers = users.slice(startIndex, endIndex);

    return {
      total,
      page,
      pageSize,
      list: pagedUsers,
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
      `CurrentValue.[部门] = "${this.escapeFilterValue(department)}"`,
    );

    const users = records.map((record) => this.formatUser(record));

    return {
      department,
      total: users.length,
      list: users,
    };
  }

  /**
   * 获取用户的历史考核记录
   * @param userId 用户ID
   */
  async getUserHistory(userId: string) {
    this.logger.log(`获取用户历史记录: ${userId}`);

    const user = await this.getUserById(userId);

    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    const completionsTableId = process.env.BITABLE_TABLE_COMPLETIONS;

    const objectives = await this.bitableService.findRecords(
      objectivesTableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`,
    );
    const completions = await this.bitableService.findRecords(
      completionsTableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`,
    );

    return {
      user,
      objectives: objectives.map((record) => {
        const fields = record.fields || {};
        return {
          objectiveId: fields['目标ID'] || '',
          title: fields['目标标题'] || '',
          periodName: fields['周期名称'] || '',
          status: fields['状态'] || '',
          updatedAt: fields['更新时间'] || '',
        };
      }),
      completions: completions.map((record) => {
        const fields = record.fields || {};
        return {
          completionId: fields['完成ID'] || '',
          objectiveId: fields['目标ID'] || '',
          periodName: fields['周期名称'] || '',
          status: fields['状态'] || '',
          supervisorScore: fields['主管评分'] || 0,
          updatedAt: fields['更新时间'] || '',
        };
      }),
    };
  }

  /**
   * 创建用户（管理员）
   */
  async createUser(
    data: {
    userId: string;
    name: string;
    email: string;
    department: string;
    position: string;
    supervisorId?: string;
    role: string;
    status?: string;
    },
    actorId?: string,
  ) {
    this.logger.log(`创建用户: ${data.userId}`);

    const exists = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(data.userId)}"`,
    );

    if (exists.length > 0) {
      throw new ConflictException('用户已存在');
    }

    const fields = {
      '用户ID': data.userId,
      '姓名': data.name,
      '邮箱': data.email,
      '部门': data.department,
      '职位': data.position,
      '主管ID': data.supervisorId || '',
      '角色': data.role,
      '状态': data.status || '在职',
      '入职日期': '',
      '创建时间': new Date().toISOString(),
    };

    const record = await this.bitableService.createRecord(this.tableId, fields);

    await this.operationLogService.logOperation({
      userId: actorId || data.userId,
      operationType: '创建',
      resourceType: '员工',
      resourceId: data.userId,
      newValue: fields,
    });

    return {
      recordId: record.record_id,
      userId: data.userId,
    };
  }

  /**
   * 更新用户（管理员）
   */
  async updateUser(
    userId: string,
    data: Partial<{
    name: string;
    email: string;
    department: string;
    position: string;
    supervisorId: string;
    role: string;
    status: string;
    }>,
    actorId?: string,
  ) {
    this.logger.log(`更新用户: ${userId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`,
    );

    if (records.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const updateFields: Record<string, any> = {};
    if (data.name !== undefined) updateFields['姓名'] = data.name;
    if (data.email !== undefined) updateFields['邮箱'] = data.email;
    if (data.department !== undefined) updateFields['部门'] = data.department;
    if (data.position !== undefined) updateFields['职位'] = data.position;
    if (data.supervisorId !== undefined) updateFields['主管ID'] = data.supervisorId;
    if (data.role !== undefined) updateFields['角色'] = data.role;
    if (data.status !== undefined) updateFields['状态'] = data.status;

    await this.bitableService.updateRecord(
      this.tableId,
      records[0].record_id,
      updateFields,
    );

    await this.operationLogService.logOperation({
      userId: actorId || userId,
      operationType: '更新',
      resourceType: '员工',
      resourceId: userId,
      oldValue: records[0].fields,
      newValue: updateFields,
    });

    return {
      userId,
    };
  }

  /**
   * 删除用户（管理员）
   */
  async deleteUser(userId: string, actorId?: string) {
    this.logger.log(`删除用户: ${userId}`);

    const records = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`,
    );

    if (records.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    await this.bitableService.deleteRecord(this.tableId, records[0].record_id);

    await this.operationLogService.logOperation({
      userId: actorId || userId,
      operationType: '删除',
      resourceType: '员工',
      resourceId: userId,
      oldValue: records[0].fields,
    });

    return { userId };
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
      role: fields['角色'] || '员工',
      status: fields['状态'] || '',
      entryDate: fields['入职日期'] || '',
      createdAt: fields['创建时间'] || '',
    };
  }

  private escapeFilterValue(value: string) {
    return value.replace(/"/g, '\\"');
  }
}
