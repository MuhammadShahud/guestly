// src/pms/pms.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { PMS } from './interfaces/pms.interface';

@Injectable()
export class PMSService {
  constructor(@InjectModel('pms') private pmsModel: Model<PMS>) {}

  async generateCredentials(business: string): Promise<PMS> {
    const username = `user${Math.random().toString(36).substring(7)}`;
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({ business, username, password: password, status: 'active' });

    const newPMS = new this.pmsModel({
      business,
      username,
      password: password,
      status: 'active',
    });
    return newPMS.save();
  }

  async updateStatus(business: string, status: string): Promise<PMS> {
    return this.pmsModel.findOneAndUpdate(
      { business },
      { status },
      { new: true },
    );
  }

  async getCredentials(business: string): Promise<PMS> {
    const pms = await this.pmsModel.findOne({ business });
    if (!pms) {
      throw new NotFoundException(`business ${business} not found`);
    }
    return pms;
  }

  async findByApiUsername(username: string): Promise<PMS> {
    console.log(username)
    return this.pmsModel.findOne({ username, status: 'active' });
  }
}
