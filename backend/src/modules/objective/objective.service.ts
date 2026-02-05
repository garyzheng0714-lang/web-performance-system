import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BitableService } from '../feishu/bitable.service';
import { MessageService } from '../feishu/message.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ObjectiveService {
  private readonly logger = new Logger(ObjectiveService.name);
  private readonly tableId = process.env.BITABLE_TABLE_OBJECTIVES;

  constructor(
    private readonly bitableService: BitableService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * 创建目标
   * @param userId 用户ID
   * @param data 目标数据
   */
  async createObjective(userId: string, data: any) {
    this.logger.log(`创建目标: userId=${userId}`);

    // 验证用户是否存在
    const userResult = await this.userService.getUserById(userId);
    const user = userResult.data;

    // 生成目标ID
    const objectiveId = `OBJ${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 准备数据
    const fields = {
      '目标ID': objectiveId,
      '用户ID': userId,
      '姓名': user.name,
      '周期ID': data.periodId || '',
      '周期名称': data.periodName || '',
      '目标标题': data.title,
      '目标描述': data.description || '',
      '目标类型': data.type || '业务目标',
      '权重': data.weight || 0,
      '目标值': data.target || '',
      '优先级': data.priority || '中',
      '截止日期': data.dueDate || '',
      '状态': '草稿',
      '父目标ID': data.parentId || '',
      '创建时间': new Date().toISOString(),
      '更新时间': new Date().toISOString(),
    };

    // 创建记录
    const record = await this.bitableService.createRecord(this.tableId, fields);

    this.logger.log(`目标创建成功: ${objectiveId}`);

    return {
      success: true,
      message: '目标创建成功',
      data: {
        objectiveId,
        recordId: record.record_id,
      },
    };
  }

  /**
   * 更新目标
   * @param userId 用户ID
   * @param objectiveId 目标ID
   * @param data 更新数据
   */
  async updateObjective(userId: string, objectiveId: string, data: any) {
    this.logger.log(`更新目标: objectiveId=${objectiveId}`);

    // 查询目标
    const objectives = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[目标ID] = "${objectiveId}"`,
    );

    if (objectives.length === 0) {
      throw new NotFoundException('目标不存在');
    }

    const objective = objectives[0];
    const fields = objective.fields || {};

    // 检查权限（只能修改自己的草稿状态目标）
    if (fields['用户ID'] !== userId) {
      throw new ForbiddenException('无权修改此目标');
    }

    if (fields['状态'] !== '草稿') {
      throw new ForbiddenException('只能修改草稿状态的目标');
    }

    // 准备更新数据
    const updateFields: any = {
      '更新时间': new Date().toISOString(),
    };

    if (data.title !== undefined) updateFields['目标标题'] = data.title;
    if (data.description !== undefined) updateFields['目标描述'] = data.description;
    if (data.type !== undefined) updateFields['目标类型'] = data.type;
    if (data.weight !== undefined) updateFields['权重'] = data.weight;
    if (data.target !== undefined) updateFields['目标值'] = data.target;
    if (data.priority !== undefined) updateFields['优先级'] = data.priority;
    if (data.dueDate !== undefined) updateFields['截止日期'] = data.dueDate;

    // 更新记录
    await this.bitableService.updateRecord(
      this.tableId,
      objective.record_id,
      updateFields,
    );

    this.logger.log(`目标更新成功: ${objectiveId}`);

    return {
      success: true,
      message: '目标更新成功',
      data: {
        objectiveId,
      },
    };
  }

  /**
   * 删除目标
   * @param userId 用户ID
   * @param objectiveId 目标ID
   */
  async deleteObjective(userId: string, objectiveId: string) {
    this.logger.log(`删除目标: objectiveId=${objectiveId}`);

    // 查询目标
    const objectives = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[目标ID] = "${objectiveId}"`,
    );

    if (objectives.length === 0) {
      throw new NotFoundException('目标不存在');
    }

    const objective = objectives[0];
    const fields = objective.fields || {};

    // 检查权限
    if (fields['用户ID'] !== userId) {
      throw new ForbiddenException('无权删除此目标');
    }

    if (fields['状态'] !== '草稿') {
      throw new ForbiddenException('只能删除草稿状态的目标');
    }

    // 删除记录
    await this.bitableService.deleteRecord(this.tableId, objective.record_id);

    this.logger.log(`目标删除成功: ${objectiveId}`);

    return {
      success: true,
      message: '目标删除成功',
      data: {
        objectiveId,
      },
    };
  }

  /**
   * 提交目标审批
   * @param userId 用户ID
   * @param objectiveId 目标ID
   * @param data 提交数据
   */
  async submitObjective(userId: string, objectiveId: string, data: any) {
    this.logger.log(`提交目标审批: objectiveId=${objectiveId}`);

    // 查询目标
    const objectives = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[目标ID] = "${objectiveId}"`,
    );

    if (objectives.length === 0) {
      throw new NotFoundException('目标不存在');
    }

    const objective = objectives[0];
    const fields = objective.fields || {};

    // 检查权限
    if (fields['用户ID'] !== userId) {
      throw new ForbiddenException('无权提交此目标');
    }

    if (fields['状态'] !== '草稿') {
      throw new ForbiddenException('只能提交草稿状态的目标');
    }

    // 更新状态
    await this.bitableService.updateRecord(
      this.tableId,
      objective.record_id,
      {
        '状态': '待审批',
        '提交时间': new Date().toISOString(),
        '更新时间': new Date().toISOString(),
      },
    );

    this.logger.log(`目标提交成功: ${objectiveId}`);

    // 发送审批通知给主管
    const userResult = await this.userService.getUserById(userId);
    const user = userResult.data;
    if (user.supervisorId) {
      const periodLabel = fields['周期名称'] || fields['周期ID'] || '未指定周期';
      let objectiveCount = 1;
      const filterParts = [`CurrentValue.[用户ID] = "${userId}"`];
      if (fields['周期ID']) {
        filterParts.push(`CurrentValue.[周期ID] = "${fields['周期ID']}"`);
      }
      const relatedObjectives = await this.bitableService.findRecords(
        this.tableId,
        filterParts.join(' AND '),
      );
      objectiveCount = relatedObjectives.length || 1;

      await this.messageService.sendObjectiveApprovalNotification(
        user.supervisorId,
        user.name,
        periodLabel,
        objectiveCount,
        objectiveId,
      );
    }

    return {
      success: true,
      message: '目标提交成功，等待审批',
      data: {
        objectiveId,
        status: '待审批',
      },
    };
  }

  /**
   * 审批目标
   * @param approverId 审批人ID
   * @param objectiveId 目标ID
   * @param data 审批数据
   */
  async approveObjective(approverId: string, objectiveId: string, data: any) {
    this.logger.log(`审批目标: objectiveId=${objectiveId}`);

    // 查询目标
    const objectives = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[目标ID] = "${objectiveId}"`,
    );

    if (objectives.length === 0) {
      throw new NotFoundException('目标不存在');
    }

    const objective = objectives[0];
    const fields = objective.fields || {};

    // 检查权限（只有主管才能审批）
    const userResult = await this.userService.getUserById(fields['用户ID']);
    const user = userResult.data;
    if (user.supervisorId !== approverId) {
      throw new ForbiddenException('无权审批此目标');
    }

    if (fields['状态'] !== '待审批') {
      throw new ForbiddenException('只能审批待审批状态的目标');
    }

    // 获取审批人信息
    const approverResult = await this.userService.getUserById(approverId);
    const approver = approverResult.data;

    // 更新状态
    const updateFields: any = {
      '状态': data.approved ? '已批准' : '已拒绝',
      '审批时间': new Date().toISOString(),
      '主管意见': data.comment || '',
      '审批人ID': approverId,
      '审批人姓名': approver.name,
      '更新时间': new Date().toISOString(),
    };

    await this.bitableService.updateRecord(
      this.tableId,
      objective.record_id,
      updateFields,
    );

    this.logger.log(`目标审批完成: ${objectiveId}, 结果: ${data.approved ? '已批准' : '已拒绝'}`);

    // 发送通知给员工
    const periodLabel = fields['周期名称'] || fields['周期ID'] || '未指定周期';
    await this.messageService.sendApprovalResultNotification(
      fields['用户ID'],
      periodLabel,
      !!data.approved,
      data.comment,
    );

    return {
      success: true,
      message: data.approved ? '目标已批准' : '目标已拒绝',
      data: {
        objectiveId,
        status: data.approved ? '已批准' : '已拒绝',
      },
    };
  }

  /**
   * 获取用户的目标列表
   * @param userId 用户ID
   * @param status 状态筛选
   */
  async getUserObjectives(userId: string, status?: string) {
    this.logger.log(`获取用户目标列表: userId=${userId}, status=${status}`);

    let filter = `CurrentValue.[用户ID] = "${userId}"`;
    if (status) {
      filter += ` AND CurrentValue.[状态] = "${status}"`;
    }

    const objectives = await this.bitableService.findRecords(this.tableId, filter);

    const list = objectives.map((record) => this.formatObjective(record));

    return {
      success: true,
      data: {
        total: list.length,
        list,
      },
    };
  }

  /**
   * 获取单个目标详情
   * @param objectiveId 目标ID
   */
  async getObjectiveDetail(objectiveId: string) {
    this.logger.log(`获取目标详情: objectiveId=${objectiveId}`);

    const objectives = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[目标ID] = "${objectiveId}"`,
    );

    if (objectives.length === 0) {
      throw new NotFoundException('目标不存在');
    }

    const objective = this.formatObjective(objectives[0]);

    return {
      success: true,
      data: objective,
    };
  }

  /**
   * 获取下属的列表（从userService代理）
   * @param supervisorId 主管ID
   */
  async getSubordinates(supervisorId: string) {
    return this.userService.getSubordinates(supervisorId);
  }

  /**
   * 获取待审批的目标列表
   * @param supervisorId 主管ID
   */
  async getPendingApprovals(supervisorId: string) {
    this.logger.log(`获取待审批目标列表: supervisorId=${supervisorId}`);

    // 查询所有待审批目标并按主管过滤
    const subordinatesResult = await this.userService.getSubordinates(supervisorId);
    const subordinates = subordinatesResult.data.list || [];
    const subordinateIds = new Set(subordinates.map((item: any) => item.userId));

    if (subordinateIds.size === 0) {
      return {
        success: true,
        data: {
          total: 0,
          list: [],
        },
      };
    }

    const objectives = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[状态] = "待审批"`,
    );

    const list = objectives
      .filter((record) => subordinateIds.has(record.fields?.['用户ID']))
      .map((record) => this.formatObjective(record));

    return {
      success: true,
      data: {
        total: list.length,
        list,
      },
    };
  }

  /**
   * 格式化目标数据
   * @param record 飞书记录
   */
  private formatObjective(record: any) {
    const fields = record.fields || {};
    return {
      recordId: record.record_id,
      objectiveId: fields['目标ID'] || '',
      userId: fields['用户ID'] || '',
      userName: fields['姓名'] || '',
      periodId: fields['周期ID'] || '',
      periodName: fields['周期名称'] || '',
      title: fields['目标标题'] || '',
      description: fields['目标描述'] || '',
      type: fields['目标类型'] || '',
      weight: fields['权重'] || 0,
      target: fields['目标值'] || '',
      priority: fields['优先级'] || '',
      dueDate: fields['截止日期'] || '',
      status: fields['状态'] || '',
      submittedAt: fields['提交时间'] || '',
      approvedAt: fields['审批时间'] || '',
      supervisorComment: fields['主管意见'] || '',
      parentId: fields['父目标ID'] || '',
      createdAt: fields['创建时间'] || '',
      updatedAt: fields['更新时间'] || '',
    };
  }
}
