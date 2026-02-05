import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BitableService } from '../feishu/bitable.service';
import { MessageService } from '../feishu/message.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CompletionService {
  private readonly logger = new Logger(CompletionService.name);
  private readonly tableId = process.env.BITABLE_TABLE_COMPLETIONS;

  constructor(
    private readonly bitableService: BitableService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * 创建完成情况记录
   * @param userId 用户ID
   * @param data 完成情况数据
   */
  async createCompletion(userId: string, data: any) {
    this.logger.log(`创建完成情况: userId=${userId}`);

    // 验证用户是否存在
    const userResult = await this.userService.getUserById(userId);
    const user = userResult.data;

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

    return {
      success: true,
      message: '完成情况创建成功',
      data: {
        completionId,
        recordId: record.record_id,
      },
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
      `CurrentValue.[完成ID] = "${completionId}"`,
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

    return {
      success: true,
      message: '完成情况更新成功',
      data: {
        completionId,
      },
    };
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
      `CurrentValue.[完成ID] = "${completionId}"`,
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

    // 发送通知给主管
    const userResult = await this.userService.getUserById(userId);
    const user = userResult.data;
    if (user.supervisorId) {
      const periodLabel = fields['周期名称'] || fields['周期ID'] || '未指定周期';
      await this.messageService.sendScoreNotification(
        user.supervisorId,
        user.name,
        periodLabel,
      );
    }

    return {
      success: true,
      message: '完成情况提交成功，等待评分',
      data: {
        completionId,
        status: '已提交',
      },
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
      `CurrentValue.[完成ID] = "${completionId}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = completions[0];
    const fields = completion.fields || {};

    // 获取员工的主管ID
    const userResult = await this.userService.getUserById(fields['用户ID']);
    const user = userResult.data;

    // 检查权限
    if (user.supervisorId !== supervisorId) {
      throw new ForbiddenException('无权评分此完成情况');
    }

    if (fields['状态'] !== '已提交') {
      throw new ForbiddenException('只能评分已提交状态的完成情况');
    }

    // 更新评分
    await this.bitableService.updateRecord(
      this.tableId,
      completion.record_id,
      {
        '主管评分': data.supervisorScore,
        '校准分': data.calibrationScore || data.supervisorScore,
        '主管评语': data.supervisorComment || '',
        '状态': '已评分',
        '评分时间': new Date().toISOString(),
        '更新时间': new Date().toISOString(),
      },
    );

    this.logger.log(`评分完成: ${completionId}`);

    // 通知员工评分完成
    const periodLabel = fields['周期名称'] || fields['周期ID'] || '未指定周期';
    const finalScore = data.calibrationScore || data.supervisorScore;
    await this.messageService.sendScoreCompletedNotification(
      fields['用户ID'],
      periodLabel,
      finalScore,
    );

    return {
      success: true,
      message: '评分成功',
      data: {
        completionId,
        status: '已评分',
      },
    };
  }

  /**
   * 归档完成情况
   * @param completionId 完成ID
   */
  async archiveCompletion(completionId: string) {
    this.logger.log(`归档完成情况: completionId=${completionId}`);

    // 查询完成情况
    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[完成ID] = "${completionId}"`,
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

    return {
      success: true,
      message: '完成情况已归档',
      data: {
        completionId,
        status: '已归档',
      },
    };
  }

  /**
   * 获取用户的完成情况列表
   * @param userId 用户ID
   * @param status 状态筛选
   */
  async getUserCompletions(userId: string, status?: string) {
    this.logger.log(`获取用户完成情况列表: userId=${userId}, status=${status}`);

    let filter = `CurrentValue.[用户ID] = "${userId}"`;
    if (status) {
      filter += ` AND CurrentValue.[状态] = "${status}"`;
    }

    const completions = await this.bitableService.findRecords(this.tableId, filter);

    const list = completions.map((record) => this.formatCompletion(record));

    return {
      success: true,
      data: {
        total: list.length,
        list,
      },
    };
  }

  /**
   * 获取待评分的完成情况列表（主管使用）
   * @param supervisorId 主管ID
   */
  async getPendingScores(supervisorId: string) {
    this.logger.log(`获取待评分完成情况: supervisorId=${supervisorId}`);

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

    const completions = await this.bitableService.findRecords(
      this.tableId,
      `CurrentValue.[状态] = "已提交"`,
    );

    const list = completions
      .filter((record) => subordinateIds.has(record.fields?.['用户ID']))
      .map((record) => this.formatCompletion(record));

    return {
      success: true,
      data: {
        total: list.length,
        list,
      },
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
      `CurrentValue.[完成ID] = "${completionId}"`,
    );

    if (completions.length === 0) {
      throw new NotFoundException('完成情况不存在');
    }

    const completion = this.formatCompletion(completions[0]);

    return {
      success: true,
      data: completion,
    };
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
}
