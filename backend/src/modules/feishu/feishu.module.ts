import { Module, Global } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { BitableService } from './bitable.service';
import { MessageService } from './message.service';

@Global()
@Module({
  providers: [FeishuService, BitableService, MessageService],
  exports: [FeishuService, BitableService, MessageService],
})
export class FeishuModule {}
