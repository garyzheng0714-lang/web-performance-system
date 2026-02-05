import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 飞书登录 - 重定向到飞书授权页面
   */
  @Get('login')
  async login(@Res() res: Response) {
    const url = this.authService.getAuthUrl();
    res.redirect(url);
  }

  /**
   * 飞书OAuth回调
   */
  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      const { token, user } = await this.authService.login(code);
      // 重定向到前端，携带token
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=${error.message}`);
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
}
