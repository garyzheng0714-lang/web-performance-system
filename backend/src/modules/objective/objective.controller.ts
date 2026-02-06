import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ObjectiveService } from './objective.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateObjectiveDto, UpdateObjectiveDto, SubmitObjectiveDto, ApproveObjectiveDto, QueryObjectivesDto } from './dto';

@ApiTags('目标管理')
@Controller('objectives')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ObjectiveController {
  constructor(private readonly objectiveService: ObjectiveService) {}

  /**
   * 创建目标
   */
  @Post()
  @ApiOperation({ summary: '创建目标' })
  async createObjective(
    @Request() req,
    @Body() data: CreateObjectiveDto,
  ) {
    const userId = req.user.user_id;
    return this.objectiveService.createObjective(userId, data);
  }

  /**
   * 更新目标
   */
  @Put(':objectiveId')
  @ApiOperation({ summary: '更新目标' })
  async updateObjective(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Body() data: UpdateObjectiveDto,
  ) {
    const userId = req.user.user_id;
    return this.objectiveService.updateObjective(userId, objectiveId, data);
  }

  /**
   * 删除目标
   */
  @Delete(':objectiveId')
  @ApiOperation({ summary: '删除目标' })
  async deleteObjective(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
  ) {
    const userId = req.user.user_id;
    return this.objectiveService.deleteObjective(userId, objectiveId);
  }

  /**
   * 提交目标审批
   */
  @Post(':objectiveId/submit')
  @ApiOperation({ summary: '提交目标审批' })
  async submitObjective(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Body() data: SubmitObjectiveDto,
  ) {
    const userId = req.user.user_id;
    return this.objectiveService.submitObjective(userId, objectiveId, data);
  }

  /**
   * 审批目标
   */
  @Post(':objectiveId/approve')
  @ApiOperation({ summary: '审批目标' })
  async approveObjective(
    @Request() req,
    @Param('objectiveId') objectiveId: string,
    @Body() data: ApproveObjectiveDto,
  ) {
    const approverId = req.user.user_id;
    return this.objectiveService.approveObjective(approverId, objectiveId, data);
  }

  /**
   * 获取当前用户的目标列表
   */
  @Get('my/list')
  @ApiOperation({ summary: '获取我的目标列表' })
  async getMyObjectives(
    @Request() req,
    @Query() query: QueryObjectivesDto,
  ) {
    const userId = req.user.user_id;
    return this.objectiveService.getUserObjectives(userId, query);
  }

  /**
   * 获取目标详情
   */
  @Get(':objectiveId')
  @ApiOperation({ summary: '获取目标详情' })
  async getObjectiveDetail(
    @Param('objectiveId') objectiveId: string,
  ) {
    return this.objectiveService.getObjectiveDetail(objectiveId);
  }

  /**
   * 获取下属的目标列表（主管使用）
   */
  @Get('subordinates/list')
  @ApiOperation({ summary: '获取下属的目标列表' })
  async getSubordinateObjectives(
    @Request() req,
    @Query('userId') userId?: string,
    @Query() query?: QueryObjectivesDto,
  ) {
    const supervisorId = req.user.user_id;

    // 如果指定了userId，查询该用户的目标；否则查询所有下属的目标
    if (userId) {
      return this.objectiveService.getUserObjectives(userId, query || {});
    } else {
      // 获取所有下属
      const subordinatesResult = await this.objectiveService.getSubordinates(supervisorId);
      const subordinates = subordinatesResult.list || [];

      // 获取所有下属的目标
      const allObjectives = [];
      for (const subordinate of subordinates) {
        const objectivesResult = await this.objectiveService.getUserObjectives(subordinate.userId, query || {});
        allObjectives.push(...objectivesResult.list);
      }

      return {
        total: allObjectives.length,
        list: allObjectives,
      };
    }
  }

  /**
   * 获取待审批的目标列表（主管使用）
   */
  @Get('pending/approvals')
  @ApiOperation({ summary: '获取待审批的目标列表' })
  async getPendingApprovals(@Request() req) {
    const supervisorId = req.user.user_id;
    return this.objectiveService.getPendingApprovals(supervisorId);
  }
}
