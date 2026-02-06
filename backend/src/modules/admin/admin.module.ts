import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../user/user.module';
import { ObjectiveModule } from '../objective/objective.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [UserModule, ObjectiveModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
