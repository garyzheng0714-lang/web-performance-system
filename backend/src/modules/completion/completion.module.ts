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
