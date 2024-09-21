import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RawBodyRequest,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/user/interfaces/user.interface';
import { UtilsStripeService } from 'src/utils/utils.stripeService';
import { IPackage } from './interface/package.interface';
import { IOrganization } from 'src/organization/interface/organization.interface';
import { pagination } from 'src/common/interface/pagination';
import { _pagination, taxIdExtractor } from 'src/utils/utils.helper';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { UserService } from 'src/user/user.service';
import { OrganizationService } from 'src/organization/organization.service';
@Injectable()
export class PackagesService {
  constructor(
    @InjectModel('Package') private readonly Package: Model<IPackage>,
    @Inject(forwardRef(() => UtilsStripeService))
    private readonly stripeService: UtilsStripeService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
  ) {}
  // if there is any trial package requirnment other wise delete the function
  async getTrialPackage(): Promise<IPackage> {
    const data = await this.Package.findOne({ type: 'trial' }).lean();
    if (!data)
      throw new NotFoundException({
        message: 'Package not found!',
        code: 'not_fount_pakage',
      });
    return data as IPackage;
  }

  // get all active packages
  async getPackages(
    query: pagination,
    type: string,
  ): Promise<{
    packages: IPackage[];
    totalCount: number;
  }> {
    const { limit, skip } = _pagination(query);
    const dbQuery = {
      active: true,
      type: 'standard',
      ...(!!type && type !== 'all' && { recurringType: type }),
    };
    const [packages, totalCount] = await Promise.all([
      this.Package.find(dbQuery)
        .select('-__v -active -createdAt -updatedAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.Package.countDocuments(dbQuery),

      // if trial package is required un comment it
      // this.getTrialPackage(),
    ]);
    return { packages: packages as IPackage[], totalCount };
  }

  // // get single package
  async getSinglePackage(search: object): Promise<[Error, IPackage]> {
    const packageData = await this.Package.findOne(search).lean();
    if (!packageData)
      [
        new NotFoundException({
          message: 'Package not found!',
          code: 'not_fount_pakage',
        }),
        null,
      ];
    return [null, packageData as IPackage];
  }

  // subscribe
  async subscribe(
    planId: string,
    user: IUser,
    countryCode: string,
    lang: string,
  ) {
    const taxId = await this.getTaxId(countryCode);
    const [error, subscription] = await this.stripeService.buyPackage(
      planId,
      user,
      taxId,
      lang,
    );
    if (!!error) throw new InternalServerErrorException(error.message);
    delete user.password;
    return { url: subscription.url, user };
  }

  async subscriptionWeebhook(params: {
    req: RawBodyRequest<Request>;
  }): Promise<{ message: 'Subscription renewed successfully.' }> {
    const { req } = params;
    const hookResult = await this.stripeService.subscriptionWebhook(req);

    return { message: 'Subscription renewed successfully.' };
  }

  async subscriptionCreation(
    customer: string,
    planId: string,
    endDate: number,
    startDate: number,
    subscriptionId: string,
  ) {
    const subscribedPack = await this.Package.findOne({ packageId: planId });
    console.log(subscriptionId);
    if (!subscribedPack)
      throw new BadRequestException({
        message: 'Package not found!',
        code: 'not_fount_pakage',
      });

    const user = await this.userService.getUserforstripe(customer);

    await this.organizationService.updateOrganizationSubscription(
      subscribedPack,
      user,
      endDate,
      startDate,
      subscriptionId,
    );
  }

  async updateSubscription(
    customer: string,
    planId: string,
    cancel: boolean,
    endDate: number,
    startDate: number,
    subscriptionId: string,
  ) {
    const subscribedPack = await this.Package.findOne({ packageId: planId });

    console.log(subscriptionId);

    if (!subscribedPack)
      throw new BadRequestException({
        message: 'Package not found!',
        code: 'not_fount_pakage',
      });

    const user = await this.userService.getUserforstripe(customer);

    await this.organizationService.updateOrganizationPlan(
      subscribedPack,
      user,
      cancel,
      endDate,
      startDate,
      subscriptionId,
    );
  }

  async cancelSubscription(customer: string, planId: string) {
    const user = await this.userService.getUserforstripe(customer);

    await this.organizationService.cancelSubscription(user);
  }

  async renewSubscription(customer: string, planId: string) {
    const user = await this.userService.getUserforstripe(customer);

    await this.organizationService.renewSubscription(user);
  }
  // // =================== AUTH USER ONLY ===================
  // async buyPackage(params: {
  //   user: IUser;
  //   packageId: string;
  //   pmid: string;
  // }): Promise<[Error, { package: IPackage; subscription: string }]> {
  //   const { user, pmid, packageId } = params;
  //   if (!pmid || !packageId)
  //     return [new BadRequestException('Invalid request'), null];
  //   const [error, packageData] = await this.getSinglePackage({
  //     _id: packageId,
  //   });
  //   if (error) return [error, null];
  //   if (
  //     ['package-expired', 'package-cancelled'].includes(
  //       user?.organization?.active,
  //     )
  //   ) {
  //     // check if the user has more employees than the package he is trying to subscribe to
  //     const totalUsers = user?.organization?.users?.length;
  //     if (totalUsers > packageData.totalUsers)
  //       return [
  //         new BadRequestException(
  //           'Sorry, you cannot downgrade your package as you have more users than the package you are trying to subscribe to.',
  //         ),
  //         null,
  //       ];
  //   }
  //   // if (packageData?.type === 'trial')
  //   //   return [null, { package: packageData, subscription: null }];
  //   const [err, stripeSubscription] = await this.stripeService.buyPackage({
  //     cus: user.cus,
  //     paymentMethodId: pmid,
  //     packagePlan: packageData,
  //   });
  //   //
  //   if (err) throw [new InternalServerErrorException(err.message), null];
  //   // transaction successfull here
  //   return [null, stripeSubscription];
  // }
  // async userBuyPackage(
  //   user: IUser,
  //   packageId: string,
  //   pmid: string,
  // ): Promise<IUser> {
  //   await this.stripeService.attachPaymentMethod(user.cus, pmid);
  //   const [err, updatedUserObject] = await this.buyPackage({
  //     user,
  //     packageId,
  //     pmid,
  //   });
  //   if (err) throw err;
  //   let availableUsers = updatedUserObject?.package?.totalUsers;
  //   if (
  //     ['package-expired', 'package-cancelled'].includes(
  //       user?.organization?.active,
  //     )
  //   )
  //     availableUsers -= user?.organization?.subscription?.totalUsers;
  //   const [organization] = await Promise.all([
  //     this.Organization.findByIdAndUpdate(
  //       user.organization._id,
  //       {
  //         active: 'active',
  //         pmId: pmid,
  //         'subscription.plan': updatedUserObject?.package?.planId,
  //         'subscription.packageId': updatedUserObject?.package?._id,
  //         'subscription.subscription': updatedUserObject?.subscription,
  //         'subscription.totalUsers': updatedUserObject?.package?.totalUsers,
  //         'subscription.availableUsers': availableUsers,
  //         'subscription.startDate': moment().toDate(),
  //         'subscription.endDate': moment().add(1, 'month').toDate(),
  //         'subscription.dueDate': null,
  //       },
  //       { new: true },
  //     )
  //       .populate(
  //         'subscription.packageId',
  //         '-__v -active -createdAt -updatedAt',
  //       )
  //       .lean(),
  //   ]);
  //   user.organization = organization as IOrganization;
  //   return user as IUser;
  // }
  // // subscriptionRenew

  // // company-admin update the subscription plan
  // async updateSubscription(params: {
  //   user: IUser;
  //   updateSubs: UpdateSubscriptionPackageDto;
  // }): Promise<IUser> {
  //   const {
  //     user,
  //     updateSubs: { packageId },
  //   } = params;
  //   const [error, packageData] = await this.getSinglePackage({
  //     _id: packageId,
  //   });
  //   let updatedUserObject = {};
  //   if (error) throw error;
  //   if (!!user?.organization?.subscription?.subscription) {
  //     const [err, updatedObjeect] = await this.stripeService.updateSubscription(
  //       { user, packageData },
  //     );
  //     if (err) throw err;
  //     updatedUserObject = updatedObjeect;
  //   } else {
  //     const [err, stripeSubscription] = await this.stripeService.buyPackage({
  //       paymentMethodId: user.organization.pmId,
  //       cus: user.cus,
  //       packagePlan: packageData,
  //     });
  //     if (err) throw err;
  //     const availableUsers = Math.abs(
  //       packageData?.totalUsers - user?.organization?.subscription?.totalUsers,
  //     );
  //     updatedUserObject = {
  //       active: 'active',
  //       $set: {
  //         'subscription.plan': stripeSubscription?.package?.planId,
  //         'subscription.packageId': stripeSubscription?.package?._id,
  //         'subscription.subscription': stripeSubscription?.subscription,
  //         'subscription.totalUsers': stripeSubscription?.package?.totalUsers,
  //         'subscription.availableUsers': availableUsers,
  //         'subscription.startDate': moment().toDate(),
  //         'subscription.endDate': moment().add(1, 'month').toDate(),
  //         'subscription.dueDate': null,
  //       },
  //     };
  //   }
  //   const [updatedOrganization] = await Promise.all([
  //     this.Organization.findByIdAndUpdate(
  //       user.organization._id,
  //       { permissions: packageData.permissions, ...updatedUserObject },
  //       { new: true },
  //     )
  //       .populate(
  //         'subscription.packageId',
  //         '-__v -active -createdAt -updatedAt',
  //       )
  //       .lean(),
  //     // transaction successfull here
  //     this.transactionService.createTransaction({
  //       plan: packageData._id,
  //       amount: packageData.price,
  //       user: user._id,
  //     }),
  //   ]);
  //   user.organization = updatedOrganization as IOrganization;
  //   return user as IUser;
  // }
  // // cancel subscription
  // async cancelSubscription(user: IUser): Promise<IUser> {
  //   const [err, updatedUserObject] =
  //     await this.stripeService.cancelSubscription({ user });
  //   if (err) throw err;
  //   const [organization] = await Promise.all([
  //     this.Organization.findByIdAndUpdate(
  //       user.organization._id,
  //       { ...updatedUserObject },
  //       { new: true },
  //     )
  //       .populate(
  //         'subscription.packageId',
  //         '-__v -active -createdAt -updatedAt',
  //       )
  //       .lean(),
  //   ]);
  //   user.organization = organization as IOrganization;
  //   return user as IUser;
  // }
  // =================== ADMIN ONLY ======================

  // // TODO: update package with stripe plan
  // async updatePackage(updatePackageDto: UpdatePackageDto): Promise<IPackage> {
  //   const { id, permissions } = updatePackageDto;
  //   const _data = await this.Package.findById(id).lean();
  //   if (!_data) throw new BadRequestException('Package not found!');
  //   if (updatePackageDto?.totalUsers < _data?.totalUsers)
  //     throw new BadRequestException('You can not downgrade the package!');
  //   const promises = [];
  //   if (permissions?.length > 0) {
  //   }
  //   const [data] = await Promise.all([
  //     this.Package.findByIdAndUpdate(id, updatePackageDto, {
  //       new: true,
  //     }).lean(),
  //     ...promises,
  //   ]);
  //   return data as IPackage;
  // }
  // async getPackagesAdmin(
  //   type: string,
  //   search: string,
  // ): Promise<{ packages: IPackage[]; totalCount: number }> {
  //   const dbQuery = {
  //     type: { $in: ['trial', 'standard'] },
  //     ...(search && {
  //       $or: [
  //         { title: { $regex: search, $options: 'i' } },
  //         { description: { $regex: search, $options: 'i' } },
  //       ],
  //     }),
  //     ...(type && type !== 'all' && { recurringType: type }),
  //   };

  //   const [packages, totalCount] = await Promise.all([
  //     this.Package.find(dbQuery).lean(),
  //     this.Package.countDocuments(dbQuery),
  //   ]);
  //   return { packages: packages as IPackage[], totalCount };
  // }
  // async deletePackage(packageId: string): Promise<{ message: string }> {
  //   const data = await this.Package.findById(packageId).lean();
  //   if (!data) throw new NotFoundException('Package not found!');
  //   // check if there are any orgnizations that have subscribed to that package
  //   const orgs = await this.Organization.countDocuments({
  //     'subscription.packageId': packageId,
  //   }).lean();
  //   if (orgs > 0)
  //     throw new BadRequestException(
  //       'You cannot delete a package that has been subscribed by any organization.',
  //     );
  //   await this.Package.findByIdAndDelete(packageId).lean();
  //   return { message: 'Package has been deleted successfully!' };
  // }

  // =================== PLATFORM ADMIN  ONLY ======================

  async createPackage(createPackageDto: CreatePackageDto): Promise<IPackage> {
    const [error, stripePlan]: [Error, { planId: string; packageId: string }] =
      await this.stripeService.createStripeCompletePlan({
        title: createPackageDto?.title,
        users: createPackageDto?.totalUsers,
        buisnessAccount: createPackageDto?.totalBuisnessAccount,
        buisness: createPackageDto?.totalBuisness,
        conversation: createPackageDto?.conversationPerYear,
        amount: createPackageDto?.price,
        recurring: createPackageDto?.recurringType,
      });

    if (error) throw new InternalServerErrorException(error.message);

    createPackageDto.planId = stripePlan.planId;
    createPackageDto.packageId = stripePlan.packageId;

    const data = await this.Package.create(createPackageDto);

    return data as IPackage;
  }

  async updatePackage(updatePackageDto: UpdatePackageDto): Promise<IPackage> {
    const { id, permissions } = updatePackageDto;

    const _data = await this.Package.findById(id).lean();

    if (!_data)
      throw new BadRequestException({
        message: 'Package not found!',
        code: 'not_fount_pakage',
      });

    if (updatePackageDto?.totalUsers < _data?.totalUsers)
      throw new BadRequestException({
        message: 'You can not downgrade the package!',
        code: 'cannot_downgrade',
      });
    const promises = [];

    const [data] = await Promise.all([
      this.Package.findByIdAndUpdate(id, updatePackageDto, {
        new: true,
      }).lean(),
      ...promises,
    ]);
    return data as IPackage;
  }

  // =================== PLATFORM ADMIN  ONLY ======================

  async buyPackkage(
    user: IUser,
    countryCode: string,
    planId: string,
    lang: string,
  ) {
    const taxId = await this.getTaxId(countryCode);
    const [error, subscription] = await this.stripeService.buyPackage(
      planId,
      user,
      taxId,
      lang,
    );

    if (!!error) throw new InternalServerErrorException(error.message);

    return { url: subscription.url };
  }
  async getTaxId(country: string) {
    const [error, taxRates] = await this.stripeService.fetchAllTaxRates();
    if (!!error) throw new InternalServerErrorException(error.message);

    const taxId = await taxIdExtractor(country, taxRates.data);
    return taxId;
  }

  async managePlan(user: IUser) {
    const products = [];
    let inCondition = [];

    if (user.currentOrganization.subscription.subscription == 'starter')
      inCondition = ['Enterprise', 'Business', 'starter'];

    if (user.currentOrganization.subscription.subscription == 'Business')
      inCondition = ['Enterprise', 'Business'];

    if (user.currentOrganization.subscription.subscription == 'Enterprise')
      inCondition = ['Enterprise'];

    const packages = await this.Package.find({ title: { $in: inCondition } });

    for (const pack of packages) {
      let existingPackage = products.find((p) => p.product === pack.packageId);

      existingPackage
        ? existingPackage.prices.push(pack.planId)
        : products.push({
            product: pack.packageId,
            prices: [pack.planId],
          });
    }
    return await this.stripeService.billingPortal(user, products);
  }
}
