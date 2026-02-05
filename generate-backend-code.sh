#!/bin/bash

# 飞书绩效考核系统 - 后端代码生成脚本
# 此脚本将生成所有缺失的后端源代码文件

set -e

echo "🚀 开始生成后端代码..."

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

cd "$BACKEND_DIR"

echo "📝 生成认证模块文件..."

# 认证模块 - auth.module.ts
cat > src/modules/auth/auth.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
EOF

# 认证控制器 - auth.controller.ts
cat > src/modules/auth/auth.controller.ts << 'EOF'
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
      res.redirect(\`\${process.env.FRONTEND_URL}?token=\${token}\`);
    } catch (error) {
      res.redirect(\`\${process.env.FRONTEND_URL}/login?error=\${error.message}\`);
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
EOF

echo "✅ 认证模块文件生成完成"

echo "📝 生成用户模块文件..."

# 用户模块 - user.module.ts
cat > src/modules/user/user.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
EOF

echo "✅ 用户模块文件生成完成"

echo "📝 生成目标管理模块文件..."

# 目标管理模块 - objective.module.ts
cat > src/modules/objective/objective.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ObjectiveController } from './objective.controller';
import { ObjectiveService } from './objective.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ObjectiveController],
  providers: [ObjectiveService],
  exports: [ObjectiveService],
})
export class ObjectiveModule {}
EOF

echo "✅ 目标管理模块文件生成完成"

echo "📝 生成完成情况模块文件..."

# 完成情况模块 - completion.module.ts
cat > src/modules/completion/completion.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { CompletionController } from './completion.controller';
import { CompletionService } from './completion.service';
import { ObjectiveModule } from '../objective/objective.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ObjectiveModule, UserModule],
  controllers: [CompletionController],
  providers: [CompletionService],
})
export class CompletionModule {}
EOF

echo "✅ 完成情况模块文件生成完成"

echo "📝 生成管理员模块文件..."

# 管理员模块 - admin.module.ts
cat > src/modules/admin/admin.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { ObjectiveModule } from '../objective/objective.module';

@Module({
  imports: [UserModule, ObjectiveModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
EOF

echo "✅ 管理员模块文件生成完成"

echo "📝 生成通用装饰器和守卫..."

# 当前用户装饰器
mkdir -p src/common/decorators
cat > src/common/decorators/current-user.decorator.ts << 'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
EOF

# 角色装饰器
cat > src/common/decorators/roles.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
EOF

# 角色守卫
mkdir -p src/common/guards
cat > src/common/guards/roles.guard.ts << 'EOF'
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
EOF

echo "✅ 通用装饰器和守卫生成完成"

echo ""
echo "🎉 后端代码生模成功！"
echo ""
echo "接下来的步骤："
echo "1. 安装依赖: cd backend && npm install"
echo "2. 配置环境变量: cp .env.example .env (然后编辑.env文件)"
echo "3. 启动开发服务器: npm run start:dev"
echo ""
echo "注意：您还需要手动实现以下Service文件的具体业务逻辑："
echo "  - src/modules/auth/auth.service.ts"
echo "  - src/modules/auth/strategies/jwt.strategy.ts"
echo "  - src/modules/user/user.controller.ts"
echo "  - src/modules/user/user.service.ts"
echo "  - src/modules/objective/objective.controller.ts"
echo "  - src/modules/objective/objective.service.ts"
echo "  - src/modules/completion/completion.controller.ts"
echo "  - src/modules/completion/completion.service.ts"
echo "  - src/modules/admin/admin.controller.ts"
echo "  - src/modules/admin/admin.service.ts"
echo ""
echo "这些文件的模板和示例代码请查看项目文档"
EOF

chmod +x generate-backend-code.sh

echo "✅ 代码生成脚本创建完成！"
echo ""
echo "运行以下命令生成剩余的后端代码文件："
echo "  ./generate-backend-code.sh"
