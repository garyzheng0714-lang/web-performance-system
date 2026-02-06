import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BitableService } from '../feishu/bitable.service';
import { MessageService } from '../feishu/message.service';
import { UserService } from '../user/user.service';
import { QueryCompletionsDto } from './dto';
import { OperationLogService } from '../operation-log/operation-log.service';

@Injectable()
export class CompletionService {
  private readonly logger = new Logger(CompletionService.name);
  private readonly tableId = process.env.BITABLE_TABLE_COMPLETIONS;

  constructor(
    private readonly bitableService: BitableService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly operationLogService: OperationLogService,
  ) {
    if (!this.tableId) {
      throw new Error('BITABLE_TABLE_COMPLETIONS 未配置');
    }
  }

  /**
   * 创建完成情况记录
   * @param userId 用户ID
   * @param data 完成情况数据
   */
  async createCompletion(userId: string, data: any) {
    this.logger.log(`创建完成情况: userId=${userId}`);

    // 验证用户是否存在
    const user = await this.userService.getUserById(userId);

    // 校验目标是否存在且归属当前用户
    const objectivesTableId = process.env.BITABLE_TABLE_OBJECTIVES;
    if (objectivesTableId) {
      const objectives = await this.bitableService.findRecords(
        objectivesTableId,
        `CurrentValue.[目标ID] = "${this.escapeFilterValue(data.objectiveId)}"`,
      );
      if (objectives.length === 0) {
        throw new NotFoundException('关联目标不存在');
      }
      const objectiveFields = objectives[0].fields || {};
      if (objectiveFields['用户ID'] && objectiveFields['用户ID'] !== userId) {
        throw new ForbiddenException('无权为该目标创建完成情况');
      }
      // 自动补全周期信息
      data.periodId = data.periodId || objectiveFields['周期ID'] || '';
      data.periodName = data.periodName || objectiveFields['周期名称'] || '';
    }

    // 生成完成ID
    const completionId = `COMP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 准备数据
    const fields = {
      '完成ID': completionId,
      '目标ID': data.objectiveId,
      '用户ID': userId,
      '姓名': user.name,
      '周期ID': data.periodId || '',
      '周期名称': data.periodName || '',
      '自评内容': data.selfAssessment || '',
      '实际完成值': data.actualValue || '',
      '完成率': data.completionRate || 0,
      '自评分': data.selfScore || 0,
      '状态': '草稿',
      '创建时间': new Date().toISOString(),
      '更新时间': new Date().toISOString(),
    };

    // 创建记录
    const record = await this.bitableService.createRecord(this.tableId, fields);

    this.logger.log(`完成情况创建成功: ${completionId}`);

    await this.operationLogService.logOperation({
      userId,
      operationType: '创建',
      resourceType: '完成情况',
      resourceId: completionId,
      newValue: fields,
    });

    return {
      completionId,
      recordId: record.record_id,
    };
  }

  /**
   * 更新完成情况（员工自评）
   * @param userId 用户ID
   * @param completionId 完成ID
   * @param data 更新数据
   */
  async updateCompletion(userId: string, completionId: string, data: any) {
    this.logger.log(`更新完成情况: completionId=${completionId}`);

    // 查询完成情况
    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${this.escapeFilterValue(completionId)}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = completions[0];
    const fields = completion.fields || {};

    // 检查权限
    if (fields['用户ID'] !== userId) {
      throw new ForbiddenException('无权修改此完成情况');
    }

    if (fields['状态'] !== '草稿') {
      throw new ForbiddenException('只能修改草稿状态的完成情况');
    }

    // 准备更新数据
    const updateFields: any = {
      '更新时间': new Date().toISOString(),
    };

    if (data.selfAssessment !== undefined) updateFields['自评内容'] = data.selfAssessment;
    if (data.actualValue !== undefined) updateFields['实际完成值'] = data.actualValue;
    if (data.completionRate !== undefined) updateFields['完成率'] = data.completionRate;
    if (data.selfScore !== undefined) updateFields['自评分'] = data.selfScore;

    // 更新记录
    await this.bitableService.updateRecord(
      this.tableId,
      completion.record_id,
      updateFields,
    );

    this.logger.log(`完成情况更新成功: ${completionId}`);

    await this.operationLogService.logOperation({
      userId,
      operationType: '更新',
      resourceType: '完成情况',
      resourceId: completionId,
      oldValue: fields,
      newValue: updateFields,
    });

    return { completionId };
  }

  /**
   * 提交完成情况（员工提交）
   * @param userId 用户ID
   * @param completionId 完成ID
   */
  async submitCompletion(userId: string, completionId: string) {
    this.logger.log(`提交完成情况: completionId=${completionId}`);

    // 查询完成情况
    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${this.escapeFilterValue(completionId)}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = completions[0];
    const fields = completion.fields || {};

    // 检查权限
    if (fields['用户ID'] !== userId) {
      throw new ForbiddenException('无权提交此完成情况');
    }

    if (fields['状态'] !== '草稿') {
      throw new ForbiddenException('只能提交草稿状态的完成情况');
    }

    // 更新状态
    await this.bitableService.updateRecord(
      this.tableId,
      completion.record_id,
      {
        '状态': '已提交',
        '提交时间': new Date().toISOString(),
        '更新时间': new Date().toISOString(),
      },
    );

    this.logger.log(`完成情况提交成功: ${completionId}`);

    await this.operationLogService.logOperation({
      userId,
      operationType: '提交',
      resourceType: '完成情况',
      resourceId: completionId,
      oldValue: fields,
      newValue: { status: '已提交' },
    });

    // 发送通知给主管
    const user = await this.userService.getUserById(userId);
    if (user.supervisorId) {
      const periodLabel = fields['周期名称'] || fields['周期ID'] || '未指定周期';
      await this.messageService.sendScoreNotification(
        user.supervisorId,
        user.name,
        periodLabel,
      );
    }

    return {
      completionId,
      status: '已提交',
    };
  }

  /**
   * 主管评分
   * @param supervisorId 主管ID
   * @param completionId 完成ID
   * @param data 评分数据
   */
  async scoreCompletion(supervisorId: string, completionId: string, data: any) {
    this.logger.log(`主管评分: completionId=${completionId}`);

    // 查询完成情况
    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${this.escapeFilterValue(completionId)}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = completions[0];
    const fields = completion.fields || {};

    // 获取员工的主管ID
    const user = await this.userService.getUserById(fields['用户ID']);

    // 检查权限
    if (user.supervisorId !== supervisorId) {
      throw new ForbiddenException('无权评分此完成情况');
    }

    if (fields['状态'] !== '已提交') {
      throw new ForbiddenException('只能评分已提交状态的完成情况');
    }

    // 更新评分
    const calibrationScore = data.calibrationScore ?? data.supervisorScore;

    await this.bitableService.updateRecord(
      this.tableId,
      completion.record_id,
      {
        '主管评分': data.supervisorScore,
        '校准分': calibrationScore,
        '主管评语': data.supervisorComment || '',
        '状态': '已评分',
        '评分时间': new Date().toISOString(),
        '更新时间': new Date().toISOString(),
      },
    );

    this.logger.log(`评分完成: ${completionId}`);

    await this.operationLogService.logOperation({
      userId: supervisorId,
      operationType: '评分',
      resourceType: '完成情况',
      resourceId: completionId,
      oldValue: fields,
      newValue: {
        supervisorScore: data.supervisorScore,
        calibrationScore,
        supervisorComment: data.supervisorComment || '',
        status: '已评分',
      },
    });

    // 通知员工评分完成
    const periodLabel = fields['周期名称'] || fields['周期ID'] || '未指定周期';
    const finalScore = calibrationScore;
    await this.messageService.sendScoreCompletedNotification(
      fields['用户ID'],
      periodLabel,
      finalScore,
    );

    return {
      completionId,
      status: '已评分',
    };
  }

  /**
   * 归档完成情况
   * @param completionId 完成ID
   */
  async archiveCompletion(completionId: string, actorId: string) {
    this.logger.log(`归档完成情况: completionId=${completionId}`);

    // 查询完成情况
    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${this.escapeFilterValue(completionId)}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = completions[0];
    const fields = completion.fields || {};

    if (fields['状态'] !== '已评分') {
      throw new ForbiddenException('只能归档已评分状态的完成情况');
    }

    // 更新状态
    await this.bitableService.updateRecord(
      this.tableId,
      completion.record_id,
      {
        '状态': '已归档',
        '更新时间': new Date().toISOString(),
      },
    );

    this.logger.log(`完成情况已归档: ${completionId}`);

    await this.operationLogService.logOperation({
      userId: actorId,
      operationType: '归档',
      resourceType: '完成情况',
      resourceId: completionId,
      oldValue: fields,
      newValue: { status: '已归档' },
    });

    return {
      completionId,
      status: '已归档',
    };
  }

  /**
   * 删除完成情况（仅草稿）
   */
  async deleteCompletion(userId: string, completionId: string) {
    this.logger.log(`删除完成情况: completionId=${completionId}`);

    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${this.escapeFilterValue(completionId)}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = completions[0];
    const fields = completion.fields || {};

    if (fields['用户ID'] !== userId) {
      throw new ForbiddenException('无权删除此完成情况');
    }

    if (fields['状态'] !== '草稿') {
      throw new ForbiddenException('只能删除草稿状态的完成情况');
    }

    await this.bitableService.deleteRecord(this.tableId, completion.record_id);

    await this.operationLogService.logOperation({
      userId,
      operationType: '删除',
      resourceType: '完成情况',
      resourceId: completionId,
      oldValue: fields,
    });

    return { completionId };
  }

  /**
   * 获取用户的完成情况列表
   * @param userId 用户ID
   * @param status 状态筛选
   */
  async getUserCompletions(userId: string, query: QueryCompletionsDto = {}) {
    const { status, periodId, page = 1, pageSize = 50 } = query;
    this.logger.log(`获取用户完成情况列表: userId=${userId}, status=${status}`);

    const filters: string[] = [`CurrentValue.[用户ID] = "${this.escapeFilterValue(userId)}"`];
    if (status) filters.push(`CurrentValue.[状态] = "${this.escapeFilterValue(status)}"`);
    if (periodId) filters.push(`CurrentValue.[周期ID] = "${this.escapeFilterValue(periodId)}"`);

    const filter = filters.join(' AND ');
    const completions = await this.bitableService.findRecords(this.tableId, filter);

    const list = completions.map((record) => this.formatCompletion(record));
    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paged = list.slice(startIndex, endIndex);

    return {
      total,
      page,
      pageSize,
      list: paged,
    };
  }

  /**
   * 获取待评分的完成情况列表（主管使用）
   * @param supervisorId 主管ID
   */
  async getPendingScores(supervisorId: string) {
    this.logger.log(`获取待评分完成情况: supervisorId=${supervisorId}`);

    const subordinatesResult = await this.userService.getSubordinates(supervisorId);
    const subordinates = subordinatesResult.list || [];
    const subordinateIds = new Set(subordinates.map((item: any) => item.userId));

    if (subordinateIds.size === 0) {
      return {
        total: 0,
        list: [],
      };
    }

    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[状态] = "已提交"`,
    );

    const list = completions
      .filter((record) => subordinateIds.has(record.fields?.['用户ID']))
      .map((record) => this.formatCompletion(record));

    return {
      total: list.length,
      list,
    };
  }

  /**
   * 获取单个完成情况详情
   * @param completionId 完成ID
   */
  async getCompletionDetail(completionId: string) {
    this.logger.log(`获取完成情况详情: completionId=${completionId}`);

    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${this.escapeFilterValue(completionId)}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = this.formatCompletion(completions[0]);

    return completion;
  }

  /**
   * 格式化完成情况数据
   * @param record 飞书记录
   */
  private formatCompletion(record: any) {
    const fields = record.fields || {};
    return {
      recordId: record.record_id,
      completionId: fields['完成ID'] || '',
      objectiveId: fields['目标ID'] || '',
      userId: fields['用户ID'] || '',
      userName: fields['姓名'] || '',
      periodId: fields['周期ID'] || '',
      periodName: fields['周期名称'] || '',
      selfAssessment: fields['自评内容'] || '',
      actualValue: fields['实际完成值'] || '',
      completionRate: fields['完成率'] || 0,
      selfScore: fields['自评分'] || 0,
      supervisorScore: fields['主管评分'] || 0,
      calibrationScore: fields['校准分'] || 0,
      supervisorComment: fields['主管评语'] || '',
      evidence: fields['证明材料'] || '',
      status: fields['状态'] || '',
      submittedAt: fields['提交时间'] || '',
      scoredAt: fields['评分时间'] || '',
      createdAt: fields['创建时间'] || '',
      updatedAt: fields['更新时间'] || '',
    };
  }

  private escapeFilterValue(value: string) {
    return value.replace(/"/g, '\\"');
  }
}
