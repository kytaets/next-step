import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserWithoutPassword } from './types/user-without-password.type';
import { MessageResponse } from '@common/responses';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  getMe(@CurrentUser() user: UserWithoutPassword): UserWithoutPassword {
    return user;
  }

  @Delete('me')
  @UseGuards(SessionAuthGuard)
  async delete(
    @CurrentUser() user: UserWithoutPassword,
  ): Promise<MessageResponse> {
    await this.service.delete(user.id);
    return { message: 'User deleted successfully' };
  }
}
