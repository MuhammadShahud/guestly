import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ConditionDto,
  ConditionGroupDto,
  CreateContactSegmentDto,
} from './dto/create-contact-segment.dto';
import { UpdateContactSegmentDto } from './dto/update-contact-segment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { IContactSegment } from './interface/contact-segment.interface';
import mongoose, { Model } from 'mongoose';
import { IUser } from 'src/user/interfaces/user.interface';
import { pagination } from 'src/common/interface/pagination';
import { _pagination, monthValue } from 'src/utils/utils.helper';
import { ContactsService } from 'src/contacts/contacts.service';

@Injectable()
export class ContactSegmentsService {
  constructor(
    @InjectModel('ContactSegment')
    private readonly contactSegmentModel: Model<IContactSegment>,
    private readonly contactService: ContactsService,
  ) {}
  async create(createContactSegmentDto: CreateContactSegmentDto, user: IUser) {
    const result = await this.contactSegmentModel.create({
      ...createContactSegmentDto,
      business: user?.currentBuisness.id,
    });
    let orArray = [];
    createContactSegmentDto.conditions.forEach((condition, index) => {
      orArray.push({ ['$and']: [] });
      condition.conditions.forEach((condition: ConditionDto) => {
        const { attribute, operator, value } = condition;
        const query = this.queryBuilder(attribute, operator, value);
        orArray[index]['$and'].push(query);
      });
    });
    console.log(orArray);
    return result;
  }

  async findAll(query: pagination, search: string, user: IUser) {
    console.log(user);
    const page = query?.page * 1 || 1;
    const limit = query?.limit * 1 || 400;
    const skip = (page - 1) * limit;
    const dbquery = {
      ...(search && {
        name: { $regex: search, $options: 'i' },
      }),
      business: user.currentBuisness._id,
    };

    const [result, segmentCount, totalCount] = await Promise.all([
      this.contactSegmentModel.find(dbquery).skip(skip).limit(limit),
      this.contactSegmentModel.countDocuments(dbquery),
      this.contactSegmentModel.countDocuments(),
    ]);

    return { result, segmentCount };
  }

  async findOne(id: string) {
    const data = await this.contactSegmentModel
      .findById(id)
      .populate('business');
    if (!data) throw new NotFoundException('Segment doesnt exist');
    return data;
  }

  async update(updateContactSegmentDto: UpdateContactSegmentDto) {
    const { contactSegmentId, ...dto } = updateContactSegmentDto;

    const contactSegment = await this.contactSegmentModel.findOne({
      _id: contactSegmentId,
    });

    if (!contactSegment)
      throw new BadRequestException('No contact segment found');

    const updatedContactSegment =
      await this.contactSegmentModel.findOneAndUpdate(
        { _id: contactSegmentId },
        dto,
        {
          new: true,
        },
      );

    return { data: updatedContactSegment as IContactSegment };
  }

  async remove(id: string) {
    await this.contactSegmentModel.findByIdAndDelete(id);
    return {
      message: 'Contact Segment deleted successfully',
    };
  }

  queryBuilder(attribute: string, operator: string, value: string) {
    if (operator === 'month is') {
      const numericMonth = monthValue[`${value}`];
      const mongocondtion = {
        $expr: {
          $eq: [{ $month: '$birthDate' }, numericMonth],
        },
      };
      return mongocondtion;
    }

    if (operator === 'day is') {
      const mongocondtion = {
        $expr: {
          $eq: [{ $dayOfMonth: '$birthDate' }, +value],
        },
      };
      return mongocondtion;
    }

    if (operator === 'contains') {
      const mongocondtion = { [attribute]: { $regex: value, $options: 'i' } };
      return mongocondtion;
    }

    if (operator === 'does not contain') {
      const mongocondtion = {
        [attribute]: { $not: { $regex: value, $options: 'i' } },
      };
      return mongocondtion;
    }

    const mongoOperator = this.operatorSelector(operator);
    if (
      mongoOperator === '$exists: true' ||
      mongoOperator === '$exists: false'
    ) {
      const [prop_1, prop_2] = mongoOperator.split(':');

      const mongocondtion = {
        [attribute]: { [prop_1]: prop_2.trim() === 'true' ? true : false },
      };
      return mongocondtion;
    }

    const exactMatchAttr = ['gender'];

    if (mongoOperator == '$eq') {
      if (exactMatchAttr.includes(attribute)) {
        return { [attribute]: { [mongoOperator]: value } };
      }

      const mongocondtion = {
        $or: [
          { [attribute]: { $regex: value, $options: 'i' } },
          { [attribute]: { [mongoOperator]: value } },
        ],
      };
      return mongocondtion;
    }

    const mongocondtion = {
      [attribute]: { [mongoOperator]: value },
    };
    // console.log(mongocondtion, '=========');
    return mongocondtion;
  }

  operatorSelector(operator: string) {
    switch (operator) {
      case 'is':
        return '$eq';
      case 'is not':
        return '$ne';
      case 'is greater than':
        return '$gt';
      case 'is less than':
        return '$lt';
      case 'is blank':
        return '$exists: false';
      case 'is not blank':
        return '$exists: true';
      default:
        return null;
    }
  }

  async getContactsForSegements(
    filters: Partial<CreateContactSegmentDto>,
    user: IUser,
  ) {
    const orArray = [];
    filters.conditions.forEach((condition, index) => {
      orArray.push({ ['$and']: [] });
      condition.conditions.forEach((condition: ConditionDto) => {
        const { attribute, operator, value } = condition;
        const query = this.queryBuilder(attribute, operator, value);
        orArray[index]['$and'].push(query);
      });
    });
    const business_id = new mongoose.Types.ObjectId(user?.currentBuisness.id);

    const result = await this.contactService.getContactForSegment(orArray, {
      buisness: business_id,
    });

    return result;
  }

  async getContactsBySegementId(segmentId: string, user: IUser) {
    const segment = await this.contactSegmentModel.findById(segmentId);
    // console.log('this is segment', segment);
    const orArray = [];
    segment.conditions.forEach((condition, index) => {
      orArray.push({ ['$and']: [] });
      condition.conditions.forEach((condition: ConditionDto) => {
        const { attribute, operator, value } = condition;
        const query = this.queryBuilder(attribute, operator, value);
        orArray[index]['$and'].push(query);
      });
    });
    const business_id = new mongoose.Types.ObjectId(user?.currentBuisness.id);
    // console.log(orArray, 'this is the or array', business_id);
    const result = await this.contactService.getContactForSegment(orArray, {
      buisness: business_id,
    });
    // console.log('this is result', result);
    return result;
  }
}
