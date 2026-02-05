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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前登录用户信息
   */
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getCurrentUser(@Request() req) {
    const userId = req.user.user_id;
    return this.userService.getCurrentUser(userId);
  }

  /**
   * 获取指定用户信息
   */
  @Get(':userId')
  @ApiOperation({ summary: '获取指定用户信息' })
  async getUserById(@Param('userId') userId: string) {
    return this.userService.getUserById(userId);
  }

  /**
   * 获取当前用户的下属列表
   */
  @Get('me/subordinates')
  @ApiOperation({ summary: '获取我的下属列表' })
  async getMySubordinates(@Request() req) {
    const userId = req.user.user_id;
    return this.userService.getSubordinates(userId);
  }

  /**
   * 获取指定用户的下属列表
   */
  @Get(':userId/subordinates')
  @ApiOperation({ summary: '获取指定用户的下属列表' })
  async getUserSubordinates(@Param('userId') userId: string) {
    return this.userService.getSubordinates(userId);
  }

  /**
   * 获取所有员工列表（管理员权限）
   */
  @Get()
  @ApiOperation({ summary: '获取所有员工列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize: number,
  ) {
    return this.userService.getAllUsers(page, pageSize);
  }

  /**
   * 根据部门获取员工列表
   */
  @Get('department/:department')
  @ApiOperation({ summary: '根据部门获取员工列表' })
  async getUsersByDepartment(@Param('department') department: string) {
    return this.userService.getUsersByDepartment(department);
  }

  /**
   * 获取用户的历史考核记录
   */
  @Get(':userId/history')
  @ApiOperation({ summary: '获取用户的历史考核记录' })
  async getUserHistory(@Param('userId') userId: string) {
    return this.userService.getUserHistory(userId);
  }
}
