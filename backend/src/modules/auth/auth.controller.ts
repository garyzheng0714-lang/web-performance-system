import { Controller, Get, Query, Res, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../types';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 飞书登录 - 重定向到飞书授权页面
   */
  @Get('login')
  async login(@Res() res: Response) {
    const state = randomUUID();
    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 10 * 60 * 1000,
    });
    const url = this.authService.getAuthUrl(state);
    res.redirect(url);
  }

  /**
   * 飞书OAuth回调
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    try {
      if (!code) {
        throw new Error('未获取到授权码，请重试登录');
      }
      const cookieState = this.getCookie(req, 'oauth_state');
      if (!state || !cookieState || state !== cookieState) {
        throw new Error('OAuth state 校验失败，请重试登录');
      }
      res.clearCookie('oauth_state');

      const { token } = await this.authService.login(code);
      // 重定向到前端，携带token
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (error) {
      // 登录失败，显示详细错误信息
      const errorMsg = encodeURIComponent(error.message);
      res.redirect(`${frontendUrl}/login?error=${errorMsg}`);
    }
  }

  /**
   * 获取当前用户信息
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.user_id);
  }

  /**
   * 刷新Token
   */
  @Get('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(@CurrentUser() user: JwtPayload) {
    return this.authService.refreshToken(user);
  }

  /**
   * 登出
   */
  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@CurrentUser() user: JwtPayload) {
    // 可以在这里清除Redis中的用户会话
    return { message: '登出成功' };
  }

  private getCookie(req: Request, name: string): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;
    const cookies = cookieHeader.split(';').map((item) => item.trim());
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.split('=');
      if (key === name) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return undefined;
  }
}
