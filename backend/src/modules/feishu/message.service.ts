import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeishuService } from './feishu.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly feishuService: FeishuService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * 发送文本消息
   */
  async sendTextMessage(userId: string, content: string): Promise<void> {
    try {
      const client = this.feishuService.getClient();
      await client.im.message.create({
        params: {
          receive_id_type: 'user_id',
        },
        data: {
          receive_id: userId,
          msg_type: 'text',
          content: JSON.stringify({ text: content }),
        },
      });

      this.logger.log(`发送文本消息成功: ${userId}`);
    } catch (error) {
      this.logger.error('发送文本消息失败', error);
      throw error;
    }
  }

  /**
   * 发送卡片消息
   */
  async sendCardMessage(userId: string, card: any): Promise<void> {
    try {
      const client = this.feishuService.getClient();
      await client.im.message.create({
        params: {
          receive_id_type: 'user_id',
        },
        data: {
          receive_id: userId,
          msg_type: 'interactive',
          content: JSON.stringify(card),
        },
      });

      this.logger.log(`发送卡片消息成功: ${userId}`);
    } catch (error) {
      this.logger.error('发送卡片消息失败', error);
      throw error;
    }
  }

  /**
   * 发送目标审批通知（给主管）
   */
  async sendObjectiveApprovalNotification(
    supervisorId: string,
    employeeName: string,
    period: string,
    objectiveCount: number,
    objectiveId: string,
  ): Promise<void> {
    const card = {
      header: {
        title: {
          content: '📋 新的考核目标待审批',
          tag: 'plain_text',
        },
        template: 'blue',
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**员工**: ${employeeName}\n**周期**: ${period}\n**目标数**: ${objectiveCount}个`,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '立即审批',
                tag: 'plain_text',
              },
              url: `${this.frontendUrl}/approvals?objectiveId=${objectiveId}`,
              type: 'primary',
            },
          ],
        },
      ],
    };

    await this.sendCardMessage(supervisorId, card);
  }

  /**
   * 发送审批结果通知（给员工）
   */
  async sendApprovalResultNotification(
    userId: string,
    period: string,
    approved: boolean,
    comment?: string,
  ): Promise<void> {
    const card = {
      header: {
        title: {
          content: approved ? '✅ 考核目标已批准' : '❌ 考核目标被拒绝',
          tag: 'plain_text',
        },
        template: approved ? 'green' : 'red',
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**考核周期**: ${period}\n**审批结果**: ${approved ? '已批准' : '已拒绝'}${comment ? `\n**主管意见**: ${comment}` : ''}`,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看详情',
                tag: 'plain_text',
              },
              url: `${this.frontendUrl}/objectives`,
              type: 'default',
            },
          ],
        },
      ],
    };

    await this.sendCardMessage(userId, card);
  }

  /**
   * 发送完成情况提醒
   */
  async sendCompletionReminder(
    userId: string,
    userName: string,
    period: string,
  ): Promise<void> {
    const card = {
      header: {
        title: {
          content: '⏰ 考核周期结束，请填写完成情况',
          tag: 'plain_text',
        },
        template: 'orange',
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `${userName}，您好！\n\n**${period}** 考核周期已结束，请尽快填写目标完成情况和自评。`,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '立即填写',
                tag: 'plain_text',
              },
              url: `${this.frontendUrl}/completions?create=1`,
              type: 'primary',
            },
          ],
        },
      ],
    };

    await this.sendCardMessage(userId, card);
  }

  /**
   * 发送评分通知（给主管）
   */
  async sendScoreNotification(
    supervisorId: string,
    employeeName: string,
    period: string,
  ): Promise<void> {
    const card = {
      header: {
        title: {
          content: '📝 下属已提交完成情况，待评分',
          tag: 'plain_text',
        },
        template: 'blue',
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**员工**: ${employeeName}\n**周期**: ${period}\n\n员工已提交完成情况和自评，请尽快查看并评分。`,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '立即评分',
                tag: 'plain_text',
              },
              url: `${this.frontendUrl}/scoring`,
              type: 'primary',
            },
          ],
        },
      ],
    };

    await this.sendCardMessage(supervisorId, card);
  }

  /**
   * 发送评分完成通知（给员工）
   */
  async sendScoreCompletedNotification(
    userId: string,
    period: string,
    score: number,
  ): Promise<void> {
    const card = {
      header: {
        title: {
          content: '🎉 考核评分已完成',
          tag: 'plain_text',
        },
        template: 'green',
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**考核周期**: ${period}\n**最终得分**: ${score}分\n\n主管已完成评分，您可以查看详细的评价和评语。`,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '查看详情',
                tag: 'plain_text',
              },
              url: `${this.frontendUrl}/completions`,
              type: 'default',
            },
          ],
        },
      ],
    };

    await this.sendCardMessage(userId, card);
  }

  /**
   * 发送解锁申请通知（给管理员）
   */
  async sendUnlockRequestNotification(
    adminId: string,
    employeeName: string,
    period: string,
    reason: string,
  ): Promise<void> {
    const card = {
      header: {
        title: {
          content: '🔓 归档数据解锁申请',
          tag: 'plain_text',
        },
        template: 'yellow',
      },
      elements: [
        {
          tag: 'div',
          text: {
            content: `**申请人**: ${employeeName}\n**周期**: ${period}\n**申请原因**: ${reason}`,
            tag: 'lark_md',
          },
        },
        {
          tag: 'hr',
        },
        {
          tag: 'action',
          actions: [
            {
              tag: 'button',
              text: {
                content: '处理申请',
                tag: 'plain_text',
              },
              url: `${this.frontendUrl}/admin`,
              type: 'primary',
            },
          ],
        },
      ],
    };

    await this.sendCardMessage(adminId, card);
  }
}
