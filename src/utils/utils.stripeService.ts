import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationPerYear } from 'src/package/interface/package.interface';
import { PackagesService } from 'src/package/package.service';
import Stripe from 'stripe';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class UtilsStripeService {
  private stripeReturnUrl = this.configService.get('STRIPE_RETURN_URL');
  private secretKey = this.configService.get('STRIPE_SECRET_KEY');
  private webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
  private configurationId = this.configService.get('CONFIGURATION_ID');
  private stripe: Stripe;
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => PackagesService))
    private readonly packageService: PackagesService,
  ) {
    this.stripe = new Stripe(this.secretKey, { apiVersion: '2023-10-16' });
  }

  // creating customer account on signup
  async getCustomerKey(
    email: string,
    description: string = null,
  ): Promise<[Error, Partial<Stripe.Customer>]> {
    try {
      const cus = await this.stripe.customers.create({
        email,
        description,
      });

      return [null, cus as Partial<Stripe.Customer>];
    } catch (error) {
      return [error, null];
    }
  }

  // get stripe customer
  async getStripeCustomer(
    customerId: string,
  ): Promise<[Error, Partial<Stripe.Customer>]> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return [null, customer as Stripe.Customer];
    } catch (error) {
      return [error, null];
    }
  }

  // set customer card as default
  setDefaultPaymentMethod = async (user: IUser, pmId: string) => {
    try {
      await this.stripe.customers.update(user.cus, {
        invoice_settings: {
          default_payment_method: pmId,
        },
      });

      const [error, data] = await this.getPaymentMethods(user);

      if (!!error) return [error.message, null];

      return [null, data];
    } catch (error) {
      return [error, null];
    }
  };

  //   delete a stripe customer
  async deleteStripeUser(cusId: string) {
    return await this.stripe.customers.del(cusId);
  }

  // CONTROLLER returns all attached(saved) payment cards including new one
  async attachPaymentMethod(cus: string, pmId: string) {
    try {
      await this.stripe.paymentMethods.attach(pmId, { customer: cus });
      const list = await this.paymentMethodList(cus);
      return [null, list?.data];
    } catch (error) {
      return [error, null];
    }
  }

  // CONTROLLER returns all attached(saved) payment cards after removing the desired one
  async detachPaymentMethod(user: IUser, pmId: string) {
    await this.stripe.paymentMethods.detach(pmId);
    const list = await this.paymentMethodList(user?.cus);
    return list?.data;
  }

  // CONTROLLER returns all attached(saved) payment cards
  async getPaymentMethods(user: IUser): Promise<[Error, any]> {
    try {
      const list = await this.paymentMethodList(user?.cus);
      return [null, list?.data];
    } catch (error) {
      return [error, null];
    }
  }

  getproduct = (prodId: string) => this.stripe.products.retrieve(prodId);

  // Stripe payment methods list
  async paymentMethodList(cus: string) {
    return await this.stripe.paymentMethods.list({
      customer: cus,
      type: 'card',
    });
  }

  // 1) create a stripe product
  async createStripeProduct(params: {
    title: string;
    users: number;
    buisnessAccount: number;
    buisness: number;
    conversation: ConversationPerYear;
  }): Promise<Stripe.Product> {
    // Create a new product for the package
    const product: Stripe.Product = await this.stripe.products.create({
      name: params.title,
      type: 'service',
      active: true,
      metadata: {
        users: params.users,
        buisnessAccount: params.buisnessAccount,
        buisness: params.buisness,
        ...(params?.conversation.monthly > 0 && params?.conversation?.yearly > 0
          ? {
              monthlyconversation: params.conversation.monthly,
              yearlyConversation: params.conversation.yearly,
              conversation: null,
            }
          : {
              conversation: 'unlimited',
            }),
      },
    });
    return product as Stripe.Product;
  }

  // 2) create a stripe product Price
  async createStripePrice(
    product: Stripe.Product,
    amount: number,
    recurring: string,
  ): Promise<Stripe.Price> {
    const stripeQuery = {
      product: product.id,
      unit_amount: amount * 100, // Stripe uses cents
      currency: 'usd',
    };
    if (recurring !== 'none')
      stripeQuery['recurring'] = { interval: recurring };
    // Create a new price for this package
    const price: Stripe.Price = await this.stripe.prices.create({
      ...stripeQuery,
      nickname: product.name,
    });
    // await this.stripe.products.update(price.id, {});
    return price as Stripe.Price;
  }

  // 3) create a stripe product Price
  async createStripePlan(product: Stripe.Product, price: Stripe.Price) {
    // Create a new plan for this package
    const plan = await this.stripe.plans.create({
      nickname: product.name,
      product: product.id,
      amount: price.unit_amount,
      currency: 'usd',
      interval: price.recurring.interval,
      usage_type: 'licensed',
    });
    return plan;
  }

  async createStripeCoupon(params: {
    type: string;
    value: number;
  }): Promise<Stripe.Coupon> {
    const { type, value } = params;
    return await this.stripe.coupons.create({
      duration: 'forever',
      ...(type == 'percentage'
        ? { percent_off: value }
        : { amount_off: value }),
      currency: 'usd',
    });
  }

  // megring all step of stripe product, price and plan creation with Db package creation
  async createStripeCompletePlan(params: {
    title: string;
    users: number;
    buisnessAccount: number;
    buisness: number;
    conversation: ConversationPerYear;
    amount: number;
    recurring: string;
  }): Promise<[Error, { planId: string; packageId: string }]> {
    const {
      users,
      title,
      amount,
      recurring,
      buisness,
      buisnessAccount,
      conversation,
    } = params;
    try {
      const prod: Stripe.Product = await this.createStripeProduct({
        users,
        title,
        buisnessAccount,
        buisness,
        conversation,
      });
      const price: Stripe.Price = await this.createStripePrice(
        prod,
        amount,
        recurring,
      );
      return [null, { planId: price.id, packageId: prod.id }];
    } catch (error) {
      return [error, null];
    }
  }

  // buy Subscrption using stripe payment method
  //  through stripe form
  async buyPackage(
    planId: string,
    user: IUser,
    taxId: string,
    lang: string,
  ): Promise<[Error, Stripe.Response<Stripe.Checkout.Session>]> {
    try {
      const subscription: Stripe.Response<Stripe.Checkout.Session> =
        await this.stripe.checkout.sessions.create({
          mode: 'subscription',
          allow_promotion_codes: true,
          tax_id_collection: {
            enabled: true,
          },
          line_items: [
            {
              price: planId,
              quantity: 1,
              // tax_rates: [taxId],
              dynamic_tax_rates: [
                'txr_1PMGKOF7tSH4lDimPU3Ws6Av',
                'txr_1PMGJQF7tSH4lDimtFhL2NLP',
                'txr_1PC5PAF7tSH4lDimuKpShJ49',
              ],
            },
          ],
          customer: user?.cus,
          customer_update: {
            name: 'auto',
            address: 'auto',
          },
          success_url: `https://dev.guestly.ai/${lang}/payments-status/success`,
          cancel_url: `https://dev.guestly.ai/${lang}/payments-status/failed`,
          billing_address_collection: 'required',
        });
      console.log('SUBSCRIBED', subscription);

      return [null, subscription as Stripe.Response<Stripe.Checkout.Session>];
    } catch (error) {
      console.log(error);

      return [error, null];
    }
  }

  async billingPortal(user: IUser, products: any) {
    const configuration = await this.stripe.billingPortal.configurations.create(
      {
        features: {
          customer_update: {
            allowed_updates: ['name', 'address', 'tax_id'],
            enabled: true,
          },
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },

          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            proration_behavior: 'none',
          },
          subscription_pause: { enabled: false },

          subscription_update: {
            default_allowed_updates: ['price', 'promotion_code'],
            enabled: true,
            proration_behavior: 'none',
            products: products,
          },
        },

        default_return_url: 'https://dev.guestly.ai/dashboard',

        business_profile: {
          headline: 'Manage your Guestly subscription with this portal.',
          privacy_policy_url: 'https://dev.guestly.ai/',
          terms_of_service_url: 'https://dev.guestly.ai/',
        },
      },
    );
    const session = await this.stripe.billingPortal.sessions.create({
      customer: user?.cus,
      return_url: 'https://dev.guestly.ai/en/dashboard',
      configuration: configuration.id,
    });

    return {
      sessionUrl: session.url,
      subscriptionId: user.currentOrganization?.subscription?.subscriptionId,
    };
  }
  async check3dSecure(paymentIntent: string): Promise<[Error, boolean]> {
    const _paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntent);
    const paymentErrors = [
      'payment_intent_authentication_failure',
      'card_declined',
    ];
    const error = _paymentIntent?.last_payment_error?.code;
    if (paymentErrors.includes(error)) {
      return [
        new InternalServerErrorException(
          '3D Secure authentication failed. Please try again.',
        ),
        null,
      ];
    }
    return [null, true];
  }

  async subscriptionWebhook(req: any) {
    try {
      const signature = req.headers['stripe-signature'];

      const data = null;

      const event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        this.webhookSecret,
      );

      switch (event.type) {
        case 'customer.subscription.created':
          const data = event.data.object;

          await this.packageService.subscriptionCreation(
            data.customer.toString(),
            data.items.data[0].plan.product.toString(),
            data['current_period_end'],
            data['current_period_start'],
            data.id,
          );

          break;
        case 'customer.subscription.updated':
          const updatedData = event.data.object;

          await this.packageService.updateSubscription(
            updatedData.customer.toString(),
            updatedData.items.data[0].plan.product.toString(),
            updatedData['cancel_at_period_end'],
            updatedData['current_period_end'],
            updatedData['current_period_start'],
            updatedData.id,
          );

          break;
        case 'invoice.created':
          const invoiceDate = event.data.object;
          await this.packageService.subscriptionCreation(
            invoiceDate.customer.toString(),
            invoiceDate.lines.data[0].price.product.toString(),
            invoiceDate.lines.data[0].period.end,
            invoiceDate.lines.data[0].period.start,
            invoiceDate.id,
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // subscription webhook
  // async subscriptionWebHook(req: RawBodyRequest<Request>) {
  //   const signature = req.headers['stripe-signature'];

  //   const data = null;

  //   const event = this.stripe.webhooks.constructEvent(
  //     req.body,
  //     signature,
  //     this.webhookSecret,
  //   );

  //   const { subscription, customer_email } = event.data.object as any;
  //   data.email = customer_email;

  //   if (!subscription || !customer_email)
  //     return [
  //       new BadRequestException('subscription or customer email is missing'),
  //     ];

  //   const _subscription =
  //     await this.stripe.subscriptions.retrieve(subscription);

  //   const priceId = _subscription.items.data[0].price.id;

  //   const _package = await this.Package.findOne({ planId: priceId }).lean();

  //   const user = await this.User.findOne({ email: customer_email }).lean();

  //   let updateQuery = {};
  //   let findQuery: any = { _id: user?.organization._id };

  //   if (event.type === 'invoice.payment_succeeded') {
  //     const totalUser: number = _package.totalUsers;

  //     updateQuery = {
  //       'subscription.startDate': moment().toDate() as Date,
  //       'subscription.endDate': moment()
  //         .add(1, 'month')
  //         .endOf('day')
  //         .toDate() as Date,
  //       'subscription.totalAgent': totalUser,
  //     };

  //     findQuery = { ...findQuery, 'subscription.packageId': _package._id };
  //   }

  //   if (event.type === 'invoice.payment_failed') {
  //     updateQuery = {
  //       $set: { 'subscription.startDate': null, 'subscription.endDate': null },
  //       active: 'package-expired',
  //     };

  //     findQuery = { ...findQuery, 'subscription.packageId': _package._id };
  //   }

  //   await this.Organization.findOneAndUpdate(findQuery, updateQuery).lean();

  //   return [null, data];
  // }

  // update subscription
  // async updateSubscription(params: {
  //   user: IUser;
  //   packageData: IPackage;
  // }): Promise<[Error, any]> {
  //   const { user, packageData } = params;

  //   //   check if user has already subscribed to any package
  //   if (!user?.organization?.subscription?.packageId)
  //     return [
  //       new BadRequestException('sorry you have not subscribed to any package'),
  //       null,
  //     ];

  //   //check if user has already subscribed to the same package
  //   if (
  //     user?.organization?.subscription?.packageId.toString() ===
  //     packageData._id.toString()
  //   ) {
  //     return [
  //       new BadRequestException(
  //         'sorry you have already subscribed to this package',
  //       ),
  //       null,
  //     ];
  //   }

  //   //   check if user have more empoyee then the package he is trying to buy
  //   const totlaUser: IUser[] = user?.organization?.users;

  //   if (totlaUser.length > packageData.totalUsers)
  //     return [
  //       new BadRequestException(
  //         'sorry you can not downgrade your package as you have more users then the package you are trying to subscribe to',
  //       ),
  //       null,
  //     ];

  //   //   for updating subscription
  //   const subscription = await this.stripe.subscriptions.retrieve(
  //     user.organization.subscription.subscription,
  //   );

  //   if (!subscription)
  //     return [
  //       new BadRequestException('Sorry facing error purchasing subscription'),
  //       null,
  //     ];

  //   const newSubscription = await this.stripe.subscriptions.update(
  //     subscription.id,
  //     {
  //       cancel_at_period_end: false,
  //       proration_behavior: 'create_prorations',
  //       items: [
  //         { id: subscription.items.data[0].id, price: packageData.planId },
  //       ],
  //     },
  //   );

  //   const prevTotalUser = user?.organization?.subscription?.totalUsers || 0;

  //   const availableUser = Math.abs(
  //     user?.organization.subscription.availableUsers +
  //       packageData.totalUsers -
  //       prevTotalUser,
  //   );

  //   const data = {
  //     active: 'active',
  //     $set: {
  //       'subscription.plan': packageData.planId,
  //       'subscription.packageId': packageData.packageId,
  //       'subscription.subscription': newSubscription.id,
  //       'subscription.totlaUser': packageData.totalUsers,
  //       'subscription.startDate': moment().toDate() as Date,
  //       'subscription.endDate': moment()
  //         .add(1, 'month')
  //         .endOf('day')
  //         .toDate() as Date,
  //       'subscription.dueDate': null,
  //       'subscription.availableUsers': availableUser,
  //     },
  //   };

  //   return [null, data];
  // }

  // async cancelSubscription(params: { user: IUser }): Promise<[Error, any]> {
  //   const { user } = params;

  //   //   check if the user has already subscribed to any package
  //   if (!user?.organization?.subscription?.packageId)
  //     return [
  //       new BadRequestException('sorry you have not subscribed to any package'),
  //       null,
  //     ];

  //   //cancel the subscription
  //   await this.stripe.subscriptions.update(
  //     user?.organization?.subscription?.subscription,
  //     { cancel_at_period_end: true },
  //   );

  //   const data = {
  //     $set: {
  //       'subscription.duaDate': moment(
  //         user?.organization?.subscription?.endDate,
  //       )
  //         .endOf('day')
  //         .toDate() as Date,
  //     },
  //   };

  //   return [null, data];
  // }

  async fetchAllTaxRates(): Promise<[Error, any]> {
    try {
      const taxRates = await this.stripe.taxRates.list({
        active: true,
      });
      return [null, taxRates];
    } catch (error) {
      return [error, null];
    }
  }
}
