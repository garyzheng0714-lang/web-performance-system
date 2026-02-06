import { Injectable, Logger } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { BitableRecord } from '../../types';

@Injectable()
export class BitableService {
  private readonly logger = new Logger(BitableService.name);
  private readonly baseToken = process.env.BITABLE_APP_TOKEN;

  constructor(private readonly feishuService: FeishuService) {
    if (!this.baseToken) {
      throw new Error('BITABLE_APP_TOKEN 未配置');
    }
  }

  /**
   * 查询记录
   * @param tableId 表格ID
   * @param filter 过滤条件
   */
  async findRecords(
    tableId: string,
    filter?: string,
    pageSize: number = 100,
  ): Promise<BitableRecord[]> {
    try {
      const client = this.feishuService.getClient();
      let allRecords: BitableRecord[] = [];
      let hasMore = true;
      let pageToken: string | undefined;

      while (hasMore) {
        const params: any = {
          page_size: pageSize,
        };

        if (filter) {
          params.filter = filter;
        }

        if (pageToken) {
          params.page_token = pageToken;
        }

        const res = await client.bitable.appTableRecord.list({
          path: {
            app_token: this.baseToken,
            table_id: tableId,
          },
          params,
        });
        this.ensureSuccess(res, '查询记录');

        if (res.data?.items) {
          allRecords = allRecords.concat(res.data.items as BitableRecord[]);
        }

        hasMore = res.data?.has_more || false;
        pageToken = res.data?.page_token;
      }

      return allRecords;
    } catch (error) {
      this.logger.error(`查询记录失败: ${tableId}`, error);
      throw error;
    }
  }

  /**
   * 根据ID获取单条记录
   */
  async findRecordById(
    tableId: string,
    recordId: string,
  ): Promise<BitableRecord> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.get({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
          record_id: recordId,
        },
      });
      this.ensureSuccess(res, '获取记录');

      return res.data?.record as BitableRecord;
    } catch (error) {
      this.logger.error(`获取记录失败: ${recordId}`, error);
      throw error;
    }
  }

  /**
   * 创建记录
   */
  async createRecord(
    tableId: string,
    fields: Record<string, any>,
  ): Promise<BitableRecord> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.create({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
        },
        data: {
          fields,
        },
      });
      this.ensureSuccess(res, '创建记录');

      return res.data?.record as BitableRecord;
    } catch (error) {
      this.logger.error('创建记录失败', error);
      throw error;
    }
  }

  /**
   * 批量创建记录
   */
  async batchCreateRecords(
    tableId: string,
    records: Array<{ fields: Record<string, any> }>,
  ): Promise<BitableRecord[]> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.batchCreate({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
        },
        data: {
          records,
        },
      });
      this.ensureSuccess(res, '批量创建记录');

      return (res.data?.records as BitableRecord[]) || [];
    } catch (error) {
      this.logger.error('批量创建记录失败', error);
      throw error;
    }
  }

  /**
   * 更新记录
   */
  async updateRecord(
    tableId: string,
    recordId: string,
    fields: Record<string, any>,
  ): Promise<BitableRecord> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.update({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
          record_id: recordId,
        },
        data: {
          fields,
        },
      });
      this.ensureSuccess(res, '更新记录');

      return res.data?.record as BitableRecord;
    } catch (error) {
      this.logger.error(`更新记录失败: ${recordId}`, error);
      throw error;
    }
  }

  /**
   * 批量更新记录
   */
  async batchUpdateRecords(
    tableId: string,
    records: Array<{ record_id: string; fields: Record<string, any> }>,
  ): Promise<BitableRecord[]> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.batchUpdate({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
        },
        data: {
          records,
        },
      });
      this.ensureSuccess(res, '批量更新记录');

      return (res.data?.records as BitableRecord[]) || [];
    } catch (error) {
      this.logger.error('批量更新记录失败', error);
      throw error;
    }
  }

  /**
   * 删除记录
   */
  async deleteRecord(tableId: string, recordId: string): Promise<void> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.delete({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
          record_id: recordId,
        },
      });
      this.ensureSuccess(res, '删除记录');
    } catch (error) {
      this.logger.error(`删除记录失败: ${recordId}`, error);
      throw error;
    }
  }

  /**
   * 批量删除记录
   */
  async batchDeleteRecords(
    tableId: string,
    recordIds: string[],
  ): Promise<void> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.batchDelete({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
        },
        data: {
          records: recordIds,
        },
      });
      this.ensureSuccess(res, '批量删除记录');
    } catch (error) {
      this.logger.error('批量删除记录失败', error);
      throw error;
    }
  }

  /**
   * 搜索记录
   */
  async searchRecords(
    tableId: string,
    filter: any,
  ): Promise<BitableRecord[]> {
    try {
      const client = this.feishuService.getClient();
      const res = await client.bitable.appTableRecord.search({
        path: {
          app_token: this.baseToken,
          table_id: tableId,
        },
        data: {
          filter: filter as any,
        },
      });
      this.ensureSuccess(res, '搜索记录');

      return (res.data?.items as BitableRecord[]) || [];
    } catch (error) {
      this.logger.error('搜索记录失败', error);
      throw error;
    }
  }

  private ensureSuccess(res: any, action: string) {
    if (res?.code && res.code !== 0) {
      this.logger.error(`${action}失败: ${res.msg || 'unknown error'}`);
      throw new Error(`${action}失败: ${res.msg || 'unknown error'}`);
    }
  }
}
