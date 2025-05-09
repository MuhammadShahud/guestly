import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsRequiredIf(
  condition: (object: any) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRequiredIf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, condition] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return condition(args.object)
            ? value !== undefined && value !== null && value !== ''
            : true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is required when ${args.constraints[0]} satisfies the condition`;
        },
      },
      constraints: [propertyName, condition],
    });
  };
}
