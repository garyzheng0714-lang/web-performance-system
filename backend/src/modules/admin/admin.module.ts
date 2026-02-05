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
