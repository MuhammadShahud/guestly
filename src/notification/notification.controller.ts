import { Controller, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
// import { IUser } from 'src/user/interfaces/user.interface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // @Get()
  // async findAll() {
  //   return await this.notificationService.findAll(user);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
