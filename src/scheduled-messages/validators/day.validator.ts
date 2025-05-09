import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ScheduleMessageAction } from '../enum/schedule-message.enum';
import { SchedulingDto } from '../dto/create-scheduled-message.dto';

@ValidatorConstraint({ async: false })
export class IsValidDayConstraint implements ValidatorConstraintInterface {
  validate(day: any, args: ValidationArguments) {
    const action = (args.object as SchedulingDto).action;
    const daysBeforeAfter = Array.from({ length: 14 }, (_, i) =>
      (i + 1).toString(),
    );

    if (
      action === ScheduleMessageAction.CHECKIN ||
      action === ScheduleMessageAction.CHECKOUT
    ) {
      return daysBeforeAfter.includes(day) || day === 'Day of';
    } else if (action === ScheduleMessageAction.DURING_STAY) {
      return [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ].includes(day);
    } else if (action === ScheduleMessageAction.BIRTHDATE) {
      return day === undefined || day === '';
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const action = (args.object as SchedulingDto).action;
    if (
      action === ScheduleMessageAction.CHECKIN ||
      action === ScheduleMessageAction.CHECKOUT
    ) {
      return `Day must be one of {1-14 days before, Day of, 1-14 days after} for action ${action}`;
    } else if (action === ScheduleMessageAction.DURING_STAY) {
      return 'Day must be one of {Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday} for action during';
    } else if (action === ScheduleMessageAction.BIRTHDATE) {
      return 'Day must be empty for action birthdate';
    }

    return 'Invalid day';
  }
}

export function IsValidDay(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDayConstraint,
    });
  };
}
