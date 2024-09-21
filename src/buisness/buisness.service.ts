import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CreateBuisnessDto } from './dto/create-buisness.dto';
import { UpdateBuisnessDto } from './dto/update-buisness.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { IBuisness } from './interface/buisness.interface';
import { IUser } from 'src/user/interfaces/user.interface';
import { S3Storage } from 'src/utils/utils.s3';
import { OrganizationService } from 'src/organization/organization.service';
import { UpdateOnBoardingDto } from './dto/update-on-boarding-flag.dto';
import { UpdateCompleteBussinessDto } from './dto/update-complete-bussiness.dto';
import { UserService } from 'src/user/user.service';
import { pagination } from 'src/common/interface/pagination';
import { ToolsIntegrationsService } from 'src/tools-integrations/tools-integrations.service';

@Injectable()
export class BuisnessService {
  constructor(
    @InjectModel('Buisness') private readonly Buisness: Model<IBuisness>,
    private readonly s3Storage: S3Storage,
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => ToolsIntegrationsService))
    private readonly toolsIntegrationService: ToolsIntegrationsService,
  ) {}

  async getBuisnessById(buisnessId: string): Promise<IBuisness> {
    const buisness = await this.Buisness.findById(buisnessId);

    if (!buisness)
      throw new BadRequestException({
        message: 'No buisness found',
        code: 'not_found_bussiness',
      });
    return buisness;
  }

  async getMyBuisness(user: IUser) {
    const data = await this.Buisness.find({
      users: { $in: [user?._id] },
    });

    return data;
  }
  async create(
    createBuisnessDto: CreateBuisnessDto,
    user: IUser,
    image: Express.Multer.File[],
  ) {
    const uploadFiles = await this.s3Storage.uploadFiles(image);

    if (!!uploadFiles?.image)
      createBuisnessDto.image = uploadFiles?.image[0].Key;

    createBuisnessDto.organization = user.currentOrganization._id;

    const data = await this.Buisness.create({
      ...createBuisnessDto,
      users: [user?._id],
    });

    await this.organizationService.addBuisnessInOrganization(
      data?._id,
      user?.currentOrganization._id,
    );

    if (user?.currentOrganization.buisness.length === 0)
      await this.userService.setCurrentBuisness(user, data._id);

    await this.toolsIntegrationService.createTAndI(data._id);
    return { data };
  }

  async getTeam(user: IUser, query: pagination, flag: string, search: string) {
    const buisness = await this.Buisness.findOne({
      _id: user.currentBuisness._id,
    });

    let userIds = [];
    if (flag == 'all') userIds = [...buisness.users, ...buisness.invitedUser];
    if (flag == 'accepted') userIds = buisness.users;
    if (flag == 'invited') userIds = buisness.invitedUser;
    if (flag == 'removed') userIds = buisness.removedUser;

    const _users = buisness.users.map((e) => e._id);
    const invitedUser = buisness.invitedUser.map((e) => e._id);
    const removedUser = buisness.removedUser.map((e) => e._id);
    const {
      users,
      count,
      invitedUsercount,
      totalInvitedUser,
      totalUser,
      totalUserCount,
      totalremovedUser,
      removedUsercount,
    } = await this.userService.findUers(
      userIds,
      query,
      search,
      _users,
      invitedUser,
      removedUser,
    );

    return {
      data: users,
      totalCount: count,
      invitedUsercount,
      totalInvitedUser,
      totalUser,
      totalUserCount,
      totalremovedUser,
      removedUsercount,
    };
  }
  findAll() {
    return `This action returns all buisness`;
  }

  findOne(id: number) {
    return `This action returns a #${id} buisness`;
  }

  async bussinessMemberCheck(bussinessId: string, userId: string) {
    const bussniess = await this.Buisness.findOne({ _id: bussinessId });
    console.log(bussniess, 'bussniess');
    // if (!bussniess.users.includes(userId))
    //   throw new BadRequestException(
    //     'You are not authorize to perform this action',
    //   );
    return bussniess;
  }

  async update(updateBuisnessDto: UpdateBuisnessDto) {
    const { buisnessId } = updateBuisnessDto;
    const buisness = await this.Buisness.findById(buisnessId);

    if (!buisness)
      throw new BadRequestException({
        message: 'No buisness found',
        code: 'not_found_bussiness',
      });

    const data = await this.Buisness.findOneAndUpdate(
      { _id: buisnessId },
      {
        $set: updateBuisnessDto,
      },
      { new: true },
    );

    return { data };
  }

  async updateIsOnBoardingFlag(updateOnBoardingDto: UpdateOnBoardingDto) {
    const { buisnessId, ...dto } = updateOnBoardingDto;

    const buisness = await this.Buisness.findById(buisnessId);

    if (!buisness)
      throw new BadRequestException({
        message: 'No buisness found',
        code: 'not_found_bussiness',
      });

    const data = await this.Buisness.findOneAndUpdate(
      { _id: buisnessId },
      {
        $set: dto,
      },
      { new: true },
    );

    return { data };
  }

  async updateCompleteBussiness(
    updateCompleteBussinessDto: UpdateCompleteBussinessDto,
    image: Express.Multer.File[],
  ) {
    const uploadFiles = await this.s3Storage.uploadFiles(image);

    if (!!uploadFiles?.image)
      updateCompleteBussinessDto.image = uploadFiles?.image[0].Key;

    const { buisnessId } = updateCompleteBussinessDto;
    const buisness = await this.Buisness.findById(buisnessId);

    if (!buisness)
      throw new BadRequestException({
        message: 'No buisness found',
        code: 'not_found_bussiness',
      });

    const data = await this.Buisness.findOneAndUpdate(
      { _id: buisnessId },
      {
        $set: updateCompleteBussinessDto,
      },
      { new: true },
    );

    return { data };
  }

  async addOrDeleteInvitedUser(
    user: IUser,
    admin: IUser,
    flag?: boolean,
  ): Promise<void> {
    await this.Buisness.findOneAndUpdate(
      { _id: admin?.currentBuisness._id },
      {
        [flag ? '$addToSet' : 'pull']: { invitedUser: user?._id },
      },
    );
  }
  async addOrDeleteUser(user: IUser, admin: IUser): Promise<void> {
    await this.Buisness.findOneAndUpdate(
      { _id: admin.currentBuisness._id },
      {
        $pull: { users: user?._id },
        // [flag ? '$addToSet' : 'pull']: { users: user?._id },
      },
    );
  }

  async addOrDeleteBuisnessUser(
    user: string,
    admin: IUser,
    flag?: boolean,
  ): Promise<void> {
    const updateQuery: any = flag
      ? { $addToSet: { users: new mongoose.Types.ObjectId(user) } }
      : {
          $pull: {
            users: new mongoose.Types.ObjectId(user),
            invitedUser: new mongoose.Types.ObjectId(user),
          },
          $addToSet: { removedUser: new mongoose.Types.ObjectId(user) },
        };
    return await this.Buisness.findOneAndUpdate(
      { _id: admin.currentBuisness._id },
      updateQuery,
      { new: true },
    );
  }
  async invitingRemovedUserInBusiness(userId: string, businessId: string) {
    const business = await this.Buisness.findOneAndUpdate(
      { _id: businessId },
      {
        $addToSet: { invitedUser: userId },
        $pull: { removedUser: userId },
      },
      { new: true },
    );

    return business;
  }

  async acceptingUserInBusiness(params: {
    id: string;
    businessId: string;
    orgaizationId: string;
  }) {
    const { businessId, id, orgaizationId } = params;
    const business = await this.Buisness.findOneAndUpdate(
      { _id: businessId },
      {
        $addToSet: { users: id },
        $pull: { invitedUser: id },
      },
      { new: true },
    );
    console.log(business);
    await this.userService.updateUserhelper(
      { _id: id },
      { currentBuisness: business._id, currentOrganization: orgaizationId },
    );

    return business;
  }

  async remove(buisnessId: string, user: IUser) {
    const _buisness = await this.Buisness.findById(buisnessId);

    if (!_buisness) throw new BadRequestException('No buisness found');

    await this.Buisness.deleteOne({ _id: buisnessId });

    const newBuisness = await this.Buisness.find({
      users: { $in: [user?._id] },
    });
    console.log('NEWBUSSINESS', newBuisness);

    let updateParams: any = {};

    if (newBuisness[0]) {
      updateParams = {
        currentBuisness: newBuisness[0]?._id,
        currentOrganization: newBuisness[0]?.organization._id,
      };
    } else {
      updateParams = {
        currentBuisness: null,
      };
    }
    console.log(updateParams);
    const updatedUser = await this.userService.updateUserhelper(
      { _id: user?._id },
      updateParams,
    );
    return updatedUser;
  }

  async updateBuisnessHelper(search: Object, params: Object) {
    return await this.Buisness.findOneAndUpdate(search, params, { new: true });
  }

  async getBuisnessHelper(search: Object) {
    return await this.Buisness.findOne(search).populate('organization');
  }
}
