import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { FeishuModule } from './modules/feishu/feishu.module';
import { UserModule } from './modules/user/user.module';
import { ObjectiveModule } from './modules/objective/objective.module';
import { CompletionModule } from './modules/completion/completion.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { OperationLogModule } from './modules/operation-log/operation-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FeishuModule,
    AuthModule,
    UserModule,
    ObjectiveModule,
    CompletionModule,
    AdminModule,
    HealthModule,
    OperationLogModule,
  ],
})
export class AppModule {}
