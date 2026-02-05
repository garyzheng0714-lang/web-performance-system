import { Injectable, Logger } from '@nestjs/common';
import * as lark from '@larksuiteoapi/node-sdk';

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);
  private client: lark.Client;

  constructor() {
    this.client = new lark.Client({
      appId: process.env.FEISHU_APP_ID,
      appSecret: process.env.FEISHU_APP_SECRET,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });

    this.logger.log('飞书SDK客户端已初始化');
  }

  /**
   * 获取飞书客户端实例
   */
  getClient(): lark.Client {
    return this.client;
  }

  /**
   * 获取用户访问令牌
   */
  async getUserAccessToken(code: string): Promise<string> {
    try {
      const res = await this.client.authen.oidcAccessToken.create({
        data: {
          grant_type: 'authorization_code',
          code,
        },
      });

      if (!res.data?.access_token) {
        throw new Error('获取访问令牌失败');
      }

      return res.data.access_token;
    } catch (error) {
      this.logger.error('获取用户访问令牌失败', error);
      throw error;
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const res = await this.client.authen.userInfo.get({
        params: {
          user_access_token: accessToken,
        },
      });

      return res.data;
    } catch (error) {
      this.logger.error('获取用户信息失败', error);
      throw error;
    }
  }

  /**
   * 获取租户访问令牌（用于调用飞书API）
   */
  async getTenantAccessToken(): Promise<string> {
    try {
      const res: { data?: { app_access_token?: string } } =
        await this.client.auth.appAccessToken.internal({
          data: {
            app_id: process.env.FEISHU_APP_ID,
            app_secret: process.env.FEISHU_APP_SECRET,
          },
        });

      if (!res.data?.app_access_token) {
        throw new Error('获取租户访问令牌失败');
      }

      return res.data.app_access_token;
    } catch (error) {
      this.logger.error('获取租户访问令牌失败', error);
      throw error;
    }
  }
}
