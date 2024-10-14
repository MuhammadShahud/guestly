import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import chalk from 'chalk';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (conffigService: ConfigService) => {
        const uri: string = String(conffigService.get('MONGODB_URI')).replace(
          '<PASSWORD>',
          conffigService.get('DATABSE_PASSWORD'),
        );
        console.log(chalk.yellow('DATABSE IS CONNECTED'));
        return { uri };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
