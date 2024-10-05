import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'OneDefaultTemplate', async: false })
export class OneDefaultTemplateValidator
  implements ValidatorConstraintInterface
{
  validate(templates: any[], args: ValidationArguments) {
    if (!Array.isArray(templates)) return false;

    // Check if exactly one template has is_default set to true
    const defaultCount = templates.filter(
      (template) => template.is_default === true,
    ).length;

    return defaultCount === 1; // True if exactly one is_default === true
  }

  defaultMessage(args: ValidationArguments) {
    return 'Exactly one template must have is_default set to true';
  }
}
