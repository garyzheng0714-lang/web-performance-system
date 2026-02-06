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
import { CompletionService } from './completion.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCompletionDto, UpdateCompletionDto, ScoreCompletionDto, QueryCompletionsDto } from './dto';

@ApiTags('完成情况管理')
@Controller('completions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CompletionController {
  constructor(private readonly completionService: CompletionService) {}

  /**
   * 创建完成情况
   */
  @Post()
  @ApiOperation({ summary: '创建完成情况' })
  async createCompletion(
    @Request() req,
    @Body() data: CreateCompletionDto,
  ) {
    const userId = req.user.user_id;
    return this.completionService.createCompletion(userId, data);
  }

  /**
   * 更新完成情况（员工自评）
   */
  @Put(':completionId')
  @ApiOperation({ summary: '更新完成情况' })
  async updateCompletion(
    @Request() req,
    @Param('completionId') completionId: string,
    @Body() data: UpdateCompletionDto,
  ) {
    const userId = req.user.user_id;
    return this.completionService.updateCompletion(userId, completionId, data);
  }

  /**
   * 提交完成情况
   */
  @Post(':completionId/submit')
  @ApiOperation({ summary: '提交完成情况' })
  async submitCompletion(
    @Request() req,
    @Param('completionId') completionId: string,
  ) {
    const userId = req.user.user_id;
    return this.completionService.submitCompletion(userId, completionId);
  }

  /**
   * 主管评分
   */
  @Post(':completionId/score')
  @ApiOperation({ summary: '主管评分' })
  async scoreCompletion(
    @Request() req,
    @Param('completionId') completionId: string,
    @Body() data: ScoreCompletionDto,
  ) {
    const supervisorId = req.user.user_id;
    return this.completionService.scoreCompletion(supervisorId, completionId, data);
  }

  /**
   * 获取我的完成情况列表
   */
  @Get('my/list')
  @ApiOperation({ summary: '获取我的完成情况列表' })
  async getMyCompletions(
    @Request() req,
    @Query() query: QueryCompletionsDto,
  ) {
    const userId = req.user.user_id;
    return this.completionService.getUserCompletions(userId, query);
  }

  /**
   * 获取完成情况详情
   */
  @Get(':completionId')
  @ApiOperation({ summary: '获取完成情况详情' })
  async getCompletionDetail(
    @Param('completionId') completionId: string,
  ) {
    return this.completionService.getCompletionDetail(completionId);
  }

  /**
   * 获取待评分的完成情况列表（主管使用）
   */
  @Get('pending/scores')
  @ApiOperation({ summary: '获取待评分的完成情况列表' })
  async getPendingScores(@Request() req) {
    const supervisorId = req.user.user_id;
    return this.completionService.getPendingScores(supervisorId);
  }

  /**
   * 归档完成情况
   */
  @Post(':completionId/archive')
  @ApiOperation({ summary: '归档完成情况' })
  async archiveCompletion(
    @Request() req,
    @Param('completionId') completionId: string,
  ) {
    return this.completionService.archiveCompletion(completionId, req.user.user_id);
  }

  /**
   * 删除完成情况（仅草稿）
   */
  @Delete(':completionId')
  @ApiOperation({ summary: '删除完成情况' })
  async deleteCompletion(
    @Request() req,
    @Param('completionId') completionId: string,
  ) {
    const userId = req.user.user_id;
    return this.completionService.deleteCompletion(userId, completionId);
  }
}
