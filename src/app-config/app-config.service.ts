import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IAppConfig } from './interface/app-config.interface';
import { Model } from 'mongoose';

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel('AppConfig') private readonly AppConfig: Model<IAppConfig>,
  ) {}

  async getAppCongigData(param: object): Promise<IAppConfig> {
    const data = await this.AppConfig.findOne(param);

    return data as IAppConfig;
  }
}
