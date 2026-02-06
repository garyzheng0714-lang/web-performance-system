import { Module, Global } from '@nestjs/common';
import { OperationLogService } from './operation-log.service';
import { FeishuModule } from '../feishu/feishu.module';

@Global()
@Module({
  imports: [FeishuModule],
  providers: [OperationLogService],
  exports: [OperationLogService],
})
export class OperationLogModule {}
