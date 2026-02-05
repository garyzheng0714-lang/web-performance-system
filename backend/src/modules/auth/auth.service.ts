import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FeishuService } from '../feishu/feishu.service';
import { BitableService } from '../feishu/bitable.service';
import { JwtPayload } from '../../types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly redirectUri = process.env.FEISHU_REDIRECT_URI;
  private readonly appId = process.env.FEISHU_APP_ID;
  private readonly employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES;

  constructor(
    private readonly feishuService: FeishuService,
    private readonly bitableService: BitableService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 获取飞书授权URL
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      state: 'STATE',
    });

    return `https://open.feishu.cn/open-apis/authen/v1/authorize?${params.toString()}`;
  }

  /**
   * 处理飞书OAuth登录
   */
  async login(code: string): Promise<{ token: string; user: any }> {
    try {
      // 1. 获取用户访问令牌
      const accessToken = await this.feishuService.getUserAccessToken(code);

      // 2. 获取用户信息
      const feishuUser = await this.feishuService.getUserInfo(accessToken);
      const userId = feishuUser.user_id;

      // 3. 从多维表格查询用户信息
      const records = await this.bitableService.findRecords(
        this.employeesTableId,
        `CurrentValue.[用户ID] = "${userId}"`,
      );

      if (!records || records.length === 0) {
        throw new UnauthorizedException('用户不存在，请联系管理员添加');
      }

      const employee = this.mapEmployeeRecord(records[0]);

      // 4. 生成JWT Token
      const payload: JwtPayload = {
        user_id: employee.userId,
        email: employee.email,
        role: employee.role,
      };

      const token = this.jwtService.sign(payload);

      this.logger.log(`用户登录成功: ${employee.name} (${employee.userId})`);

      return { token, user: employee };
    } catch (error) {
      this.logger.error('登录失败', error);
      throw error;
    }
  }

  /**
   * 验证JWT Token
   */
  async validateToken(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: string): Promise<any> {
    const records = await this.bitableService.findRecords(
      this.employeesTableId,
      `CurrentValue.[用户ID] = "${userId}"`,
    );

    if (!records || records.length === 0) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.mapEmployeeRecord(records[0]);
  }

  /**
   * 刷新Token
   */
  async refreshToken(user: JwtPayload): Promise<{ token: string }> {
    const payload: JwtPayload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }

  /**
   * 格式化员工记录（中文字段 -> API字段）
   */
  private mapEmployeeRecord(record: any) {
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
