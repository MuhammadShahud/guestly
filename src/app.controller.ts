import { Request } from 'express';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import sgMail from '@sendgrid/mail';
import { UtilsWhatsAppService } from './utils/utils.whatsapp';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3Storage } from './utils/utils.s3';
@Controller('/')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly whatsAppService: UtilsWhatsAppService,
    private readonly s3Service: S3Storage,
  ) {}
  @Get()
  getHello(@Req() request: Request): string {
    console.log('Hello Controller');
    return this.appService.getHello(request);
  }
  @Get('whatsapp')
  async whatsappTesting(@Req() request: Request) {
    // const [err , res] =  await this.whatsAppService.getWhatsAppBusinessAccounts('EAADGrQDEWDoBO53RXiIUS3zq0ARaWSbkjJOc9aYBA1U2fGt9nFxfMOwFi36b3aA3DON8eXhsNCbbEtyUuobFfWgripYTy43O9TJVmIraDVGyIgg9QmsLvk9ZAUPkiuLjir33ZCp48H8ne8Sml0zjuZA5xqUn7bhvCxDh0QZACjrF3Ml6jF9VRTbj0C6bhiPaJDyNTvLE67ysYMXYOMslzJ9xCs5Gl6xiGKdw7swSVvRg')
    const [err, res] = await this.whatsAppService.getMetaAccountPhoneNumber(
      'EAADGrQDEWDoBO53RXiIUS3zq0ARaWSbkjJOc9aYBA1U2fGt9nFxfMOwFi36b3aA3DON8eXhsNCbbEtyUuobFfWgripYTy43O9TJVmIraDVGyIgg9QmsLvk9ZAUPkiuLjir33ZCp48H8ne8Sml0zjuZA5xqUn7bhvCxDh0QZACjrF3Ml6jF9VRTbj0C6bhiPaJDyNTvLE67ysYMXYOMslzJ9xCs5Gl6xiGKdw7swSVvRg',
      '109777618875691',
    );
    if (err) throw new BadRequestException(err);

    return res;
  }
  @Post('imagetest')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 1 }]),
  )
  async imagetest(
    @Req() request: Request,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    console.log(attachments, 'attachments');
    const uploadFile = await this.s3Service.uploadFiles(attachments)
  }
}
