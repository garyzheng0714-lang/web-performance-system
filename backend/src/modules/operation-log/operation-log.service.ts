import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BitableService } from '../feishu/bitable.service';

@Injectable()
export class OperationLogService {
  private readonly logger = new Logger(OperationLogService.name);
  private readonly tableId = process.env.BITABLE_TABLE_OPERATION_LOGS;

  constructor(private readonly bitableService: BitableService) {}

  async logOperation(params: {
    userId: string;
    operationType: string;
    resourceType: string;
    resourceId: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    if (!this.tableId) {
      this.logger.warn('BITABLE_TABLE_OPERATION_LOGS 未配置，跳过日志记录');
      return;
    }

    const {
      userId,
      operationType,
      resourceType,
      resourceId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    } = params;

    const fields = {
      '日志ID': uuidv4(),
      '用户ID': userId,
      '操作类型': operationType,
      '资源类型': resourceType,
      '资源ID': resourceId,
      '旧值': oldValue ? JSON.stringify(oldValue) : '',
      '新值': newValue ? JSON.stringify(newValue) : '',
      'IP地址': ipAddress || '',
      '用户代理': userAgent || '',
      '操作时间': new Date().toISOString(),
    };

    try {
      await this.bitableService.createRecord(this.tableId, fields);
    } catch (error) {
      this.logger.error('记录操作日志失败', error);
    }
  }
}
