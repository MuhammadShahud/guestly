import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateChatIn, UpdateChatInDto } from './dto/chat-in-dto';
import { ToolsIntegrationsService } from './tools-integrations.service';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDecorator } from 'src/common/decorators/api-decorater';
import { AuthDecorator } from 'src/common/decorators/auth-decorater';
import { USER_ROLE } from 'src/auth/enums/enums';
import { GetUser } from 'src/common/decorators/user.decorater';
import { IUser } from 'src/user/interfaces/user.interface';
import { CreateWhatsAppDetailsDto } from './dto/create-whatsapp-details.dto';

@ApiTags('Tools-Integrations')
@Controller('tools-integrations')
export class ToolsIntegrationsController {
  constructor(
    private readonly toolsIntegrationsService: ToolsIntegrationsService,
  ) {}

  @SwaggerDecorator('use this api to get all tool and integration ', true)
  @AuthDecorator(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN)
  @Get('getAll')
  getToolsAndIntegration(
    @Query('filter') filter: string,
    @GetUser() user: IUser,
  ) {
    return this.toolsIntegrationsService.getToolsAndIntegration(filter, user);
  }

  @SwaggerDecorator('use this api to get single tool and integration ', true)
  @AuthDecorator(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN)
  @Get(':id')
  getSingleItem(@Param('id') id: string) {
    return this.toolsIntegrationsService.getSingleItem(id);
  }

  @SwaggerDecorator('use this api to update chat in ', true)
  @AuthDecorator(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN)
  @Post('update-chatIn')
  updateChatIn(@Body() chatInDto: UpdateChatInDto, @GetUser() user: IUser) {
    return this.toolsIntegrationsService.updateChatIn(chatInDto);
  }

  @SwaggerDecorator('use this api to connect chat in ', true)
  @AuthDecorator(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN)
  @Post('connect-chatIn')
  connectChatin(@Body() chatInDto: CreateChatIn, @GetUser() user: IUser) {
    return this.toolsIntegrationsService.connectChatin(chatInDto, user);
  }

  @SwaggerDecorator('use this api to update whatsapp details ', true)
  @AuthDecorator(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN)
  @Patch('update-whatsapp-details')
  updateWhatsappDetails(@Body() whatsappdto: CreateWhatsAppDetailsDto, @GetUser() user: IUser) {
    return this.toolsIntegrationsService.updateWhatsappDetails(whatsappdto, user);
  }






}
