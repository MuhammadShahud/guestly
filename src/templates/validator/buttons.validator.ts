import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { TemplateButtonTypeEnum } from '../enums/template.enum';
@ValidatorConstraint({ async: false })
export class TemplateButtonsArrayValidator
  implements ValidatorConstraintInterface
{
  validate(buttons: any[], args: ValidationArguments) {
    const typeCounts = buttons.reduce((acc, button) => {
      acc[button.type] = (acc[button.type] || 0) + 1;
      return acc;
    }, {});

    // Check if any type count is greater than 1
    for (const type in typeCounts) {
      if (typeCounts[type] > 1) {
        return false;
      }
    }

    // Ensure only one QUICK_REPLY or CALL_TO_ACTION can exist
    const quickReplyCount = typeCounts[TemplateButtonTypeEnum.QUICK_REPLY] || 0;
    const callToActionCount =
      typeCounts[TemplateButtonTypeEnum.CALL_TO_ACTION] || 0;

    return quickReplyCount <= 1 && callToActionCount <= 1;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Only one object of each type and only one of QUICK_REPLY or CALL_TO_ACTION can exist in the buttons array.';
  }
}

export function IsTemplateButtonsArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: TemplateButtonsArrayValidator,
    });
  };
}
