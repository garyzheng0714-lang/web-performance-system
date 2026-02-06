import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as lark from '@larksuiteoapi/node-sdk';

@Injectable()
export class FeishuService {
  private readonly logger = new Logger(FeishuService.name);
  private client: lark.Client;
  private appId: string;
  private appSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get('FEISHU_APP_ID') || '';
    this.appSecret = this.configService.get('FEISHU_APP_SECRET') || '';

    this.client = new lark.Client({
      appId: this.appId,
      appSecret: this.appSecret,
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
   * 使用授权码换取用户访问凭证并返回用户信息
   */
  async exchangeCodeForUser(code: string): Promise<{ accessToken: string; user: any }> {
    try {
      this.logger.log(`[OAuth] 使用code换取access_token, code前10位: ${code.substring(0, 10)}...`);

      const res = await this.client.authen.v1.accessToken.create({
        data: {
          grant_type: 'authorization_code',
          code,
        },
      });

      if (res.code && res.code !== 0) {
        this.logger.error(`获取访问令牌失败: ${res.msg || 'unknown error'}`);
        this.logger.error(`完整响应: ${JSON.stringify(res)}`);
        throw new Error(res.msg || '获取访问令牌失败');
      }

      const data = res.data;
      if (!data?.access_token) {
        this.logger.error('响应中没有access_token');
        throw new Error('获取访问令牌失败');
      }

      const user = {
        ...data,
        user_id: data.user_id || data.open_id,
      };

      if (!user.user_id) {
        this.logger.error('响应中没有user_id或open_id');
        throw new Error('获取用户信息失败');
      }

      this.logger.log(`[OAuth] ✅ 成功获取用户信息, user_id: ${user.user_id}, name: ${user.name}`);

      return { accessToken: data.access_token, user };
    } catch (error) {
      this.logger.error('获取用户访问令牌失败', error);
      throw error;
    }
  }

  /**
   * 获取租户访问令牌（用于调用飞书API）
   */
  async getTenantAccessToken(): Promise<string> {
    try {
      const res = await this.client.auth.appAccessToken.internal({
        data: {
          app_id: this.appId,
          app_secret: this.appSecret,
        },
      });

      if (res.code && res.code !== 0) {
        this.logger.error(`获取租户访问令牌失败: ${res.msg || 'unknown error'}`);
        throw new Error(res.msg || '获取租户访问令牌失败');
      }

      const token = (res as any).data?.app_access_token;
      if (!token) {
        throw new Error('获取租户访问令牌失败');
      }

      return token;
    } catch (error) {
      this.logger.error('获取租户访问令牌失败', error);
      throw error;
    }
  }
}
