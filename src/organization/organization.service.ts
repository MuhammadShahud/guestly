import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPackage } from 'src/package/interface/package.interface';
import { IUser } from 'src/user/interfaces/user.interface';
import { IOrganization } from './interface/organization.interface';
// import * as moment from 'moment';
@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel('Organization')
    private readonly Organization: Model<IOrganization>,
  ) {}

  async createOrganization(userId: string): Promise<[Error, IOrganization]> {
    try {
      const data: IOrganization = await this.Organization.create({
        owner: userId,
      });
      return [null, data as IOrganization];
    } catch (error) {
      return [error, null];
    }
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    return await this.Organization.findByIdAndDelete(organizationId);
  }

  async updateOrganizationSubscription(
    _package: IPackage,
    user: IUser,
    _endDate: number,
    _startDate: number,
    subscriptionId: string,
  ) {
    try {
      const subStartDate = new Date(_startDate * 1000);
      const subEndDate = new Date(_endDate * 1000);
      const updateData = {
        active: 'active',
        subscription: {
          subscriptionId: subscriptionId,
          plan: _package?.planId,
          packageId: _package?._id,
          subscription: _package?.title,
          totalUsers: _package?.totalUsers,
          totalBuisnessAccount: _package?.totalBuisnessAccount,
          totalBuisness: _package?.totalBuisness,
          startDate: subStartDate,
          endDate: subEndDate,
        },
      };
      const result = await this.Organization.findOneAndUpdate(
        {
          _id: user?.organization[0]._id,
        },
        {
          $set: updateData,
        },
        {
          new: true,
        },
      );
      console.log('Update successful:', result);
    } catch (error) {
      console.error('Error updating organization subscription:', error);
    }
  }

  async updateOrganizationPlan(
    _package: IPackage,
    user: IUser,
    cancel: boolean,
    _endDate: number,
    _startDate: number,
    subscriptionId: string,
  ) {
    try {
      const updateData = {
        'subscription.subscriptionId': subscriptionId,
        ...(cancel ? { active: 'package-cancelled' } : { active: 'active' }),
        'subscription.plan': _package?.planId,
        'subscription.packageId': _package?._id,
        'subscription.subscription': _package?.title,
        'subscription.totalUsers': _package?.totalUsers,
        'subscription.totalBuisnessAccount': _package?.totalBuisnessAccount,
        'subscription.totalBuisness': _package?.totalBuisness,
        'subscription.startDate': new Date(_startDate * 1000),
        'subscription.endDate': new Date(_endDate * 1000),
      };

      console.log(updateData, 'updateData');
      await this.Organization.findOneAndUpdate(
        {
          _id: user?.organization[0]._id,
        },
        {
          $set: updateData,
        },
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async cancelSubscription(user: IUser) {
    try {
      await this.Organization.findOneAndUpdate(
        {
          _id: user?.organization[0]._id,
        },
        {
          active: 'package-cancelled',
        },
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async renewSubscription(user: IUser) {
    try {
      await this.Organization.findOneAndUpdate(
        {
          _id: user?.organization[0]._id,
        },
        {
          active: 'active',
        },
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async addBuisnessInOrganization(buisnessId: string, organizationId: string) {
    await this.Organization.updateOne(
      { _id: organizationId },
      {
        $addToSet: {
          buisness: buisnessId,
        },
      },
    );
  }

  async organizationHelperFn(search: Object) {
    return await this.Organization.findOne(search);
  }
}
