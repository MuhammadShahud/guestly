import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

export const SwaggerDecorator = (
  summary: string,
  isProtected: boolean = false,
  param: boolean = false,
  paramName?: string,
) => {
  const decorators = [ApiOperation({ summary })];

  if (isProtected) {
    decorators.push(ApiBearerAuth('access-token'));
  }

  if (param) {
    decorators.push(ApiParam({ name: paramName }));
  }

  return applyDecorators(...decorators);
};
