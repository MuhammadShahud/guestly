import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import slugify from 'slugify';
import moment from 'moment';

import { pagination } from 'src/common/interface/pagination';

// http error handling helper
export const httpErrorHandlingFn = (
  err: any,
): {
  error: { status: 'fail'; message: { error: string[] } };
  httpStatusCode: number;
  data?: any;
} => {
  let error: any = {};
  let httpStatusCode: number = 400;
  let data: Object = null;

  console.log(err);
  if ('BadRequestException' == err.name) {
    error = { status: 'fail', message: { error: [err.message] } };
    httpStatusCode = HttpStatus.BAD_REQUEST;
  } else if ('NotFoundException' == err.name) {
    error = { status: 'fail', message: { error: [err.message] } };
    httpStatusCode = HttpStatus.NOT_FOUND;
  } else if (err.statusCode == 401) {
    error = { status: 'fail', message: { error: [err.message] } };
    httpStatusCode = HttpStatus.UNAUTHORIZED;
  } else if (err.statusCode == 409) {
    error = { status: 'fail', message: { error: [err.message] } };
    httpStatusCode = HttpStatus.CONFLICT;
  } else if (err.statusCode == 403) {
    error = { status: 'fail', message: { error: [err.message] } };
    httpStatusCode = HttpStatus.FORBIDDEN;
  } else if (err.statusCode == 402) {
    error = { status: 'fail', message: { error: [err.message] } };
    httpStatusCode = HttpStatus.PAYMENT_REQUIRED;
    data = !!err['data'] ? err['data'] : null;
  } else {
    error = {
      status: 'fail',
      message: {
        error: Array.isArray(err.message) ? err.message : [err.message],
      },
    };
    httpStatusCode = err.status || HttpStatus.BAD_REQUEST;
  }

  return {
    error,
    httpStatusCode,
    ...(!!HttpStatus.PAYMENT_REQUIRED && { data }),
  };
};

// mongoose error handling helper
const normalWord = (word?: string) =>
  word.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, '$1');

const handleCastErrorDb = (err: any) => [`Invalid ${err.path} : ${err.name}`];

const handleDuplicateFieldsDb = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = Object.keys(err?.keyValue).map(
    (e) =>
      `Duplicate field ${normalWord(e) || 'value'} : ${value}.Please use another ${normalWord(e) || 'value'}`,
  );

  return message;
};
const handleValidationErrorDb = (err: any) => {
  const errors = Object.values(err.errors).map(
    (ele: any) => `Invalid Input ${ele?.message}`,
  );

  return errors;
};
export const mongoErrorHandlingFn = (
  err: any,
): {
  error: { status: 'fail'; message: { error: string[] } };
  httpStatusCode: number;
} => {
  console.log(err);
  let error: any = {};

  let httpStatusCode: number = 400;
  if (err.code == 11000) {
    error = {
      status: 'fail',
      message: { error: handleDuplicateFieldsDb(err) },
    };
    httpStatusCode = HttpStatus.CONFLICT;
  } else if (err.name == 'ValidationError') {
    error = {
      status: 'fail',
      message: { error: handleValidationErrorDb(err) },
    };
    httpStatusCode = HttpStatus.BAD_REQUEST;
  } else if (err.name == 'CastError') {
    error = { status: 'fail', message: { error: handleCastErrorDb(err) } };
    httpStatusCode = HttpStatus.NOT_FOUND;
  } else {
    error = {
      status: 'fail',
      message: {
        error: Array.isArray(err?.message) ? err?.message : [err?.message],
      },
    };
    httpStatusCode = err.status || HttpStatus.BAD_REQUEST;
  }

  return { error, httpStatusCode };
};

// guard helper
export const matchRoles = (
  requiredRoles: string[],
  userRoles: { role: string }[],
) => {
  return userRoles.some((userRole) => requiredRoles.includes(userRole.role));
};

export const matchPermissions = (
  roles: string[] = [],
  userRoles: string[] = [],
) => roles.some((role) => userRoles.includes(role));

// uploads helper
export const manageNewAttachment = (
  oldAttach: string[] = [],
  newAttach: string[] = [],
  deletableAttach: string[] = [],
): string[] => {
  const uniqueNewAttach = [...new Set(oldAttach.concat(newAttach))];
  return uniqueNewAttach.filter((el) => !deletableAttach.includes(el));
};

// pagination helper
export const _pagination = (
  query: pagination,
): { limit: number; skip: number } => {
  const page = query?.page * 1 || 1;
  const limit = query?.limit * 1 || 400;
  const skip = (page - 1) * limit;

  return { limit, skip };
};

// role helper
export const validateRole = (userRoles: string[], role: string): boolean => {
  return userRoles.includes(role);
};

// random number genrator
export const generateSixDigitRandomNumber = (): number => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// auth helper

export const checkAfterConditon = (iat: number, property: number): boolean => {
  if (property) {
    const changedTimestamp = parseInt(
      new Date(property).getTime() / 1000 + '',
      10,
    );
    console.log(iat);
    console.log(changedTimestamp);
    return iat < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

export const expireAtHandler = (): Date => {
  //  setting expire time for otp for 3 minutes
  const currentTime = new Date();

  return new Date(currentTime.getTime() + 3 * 60000);
};

export const checkOtpExpiry = (expiresAt: Date): Boolean => {
  const currentTime = new Date();
  if (currentTime > expiresAt) {
    return false;
  } else {
    return true;
  }
};

export const comparePassword = (
  password: string,
  confirmPassword: string,
): string => {
  if (password !== confirmPassword)
    throw new BadRequestException(
      'The password and confirm password fields do not match',
    );

  return confirmPassword;
};

// slug generator
export const slugGenerator = async (
  model: any,
  key: string,
): Promise<string> => {
  const totalUsers = await model.countDocuments({}).lean();
  const slug = slugify(`${key}-${totalUsers}`, {
    lower: true,
    remove: /[!@#$%^&*()\_+={}\[\]|;:'"<>,?/]/g,
  });
  return slug;
};

// TaxId extractor from Tax List
export const taxIdExtractor = (country: string, taxdetailArray: any[]) => {
  const TaxId = taxdetailArray.find((taxdetail) => {
    return taxdetail?.country === country ? taxdetail.id : undefined;
  })?.id;

  return TaxId;
};

export const generateRandomPassword = (length: number): string => {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialCharacters = '!@#$%^&*()-_=+[]{}|;:",.<>?/~`';

  const allCharacters =
    uppercaseLetters + lowercaseLetters + numbers + specialCharacters;
  let password = '';

  password +=
    uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];
  password +=
    lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password +=
    specialCharacters[Math.floor(Math.random() * specialCharacters.length)];
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters[randomIndex];
  }

  password = password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');

  return password;
};

export const dateRange = () => {
  const startOfMonth = Math.floor(moment().startOf('month').unix());
  const endOfMonth = Math.floor(moment().endOf('month').unix());
  return { startOfMonth, endOfMonth };
};

export const buisnessFilter = (filter: string) => {
  filter = String(filter).toLowerCase()
  if (
    ![
      'confirmed',
      'cancelled',
      'in-house',
      'checked-out',
      'checked-out',
      'arriving-soon',
      'upcoming',
      'cancelled',
    ].includes(filter)
  )
    throw new BadRequestException('the provided filter value is not supported');

  let condition = {};
  const currentDate = moment().startOf('day').toDate();

  if (filter == 'in-house')
    condition = {
      checkIn: { $lte: currentDate },
      checkOut: { $gt: currentDate },
    };

  if (filter == 'checked-out')
    condition = {
      checkOut: {
        $gte: currentDate,
      },
    };

  if (filter == 'arriving-soon')
    condition = {
      checkIn: { $gte: currentDate },
    };

  if (filter == 'upcoming')
    condition = {
      checkIn: {
        $gte: moment().add(2, 'days').toDate(),
      },
    };

  if (filter == 'cancelled')
    condition = {
      status: 'cancelled',
    };

  return condition;
};


export const monthValue = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
}