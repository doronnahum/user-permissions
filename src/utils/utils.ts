import {
  UserContext,
  Roles,
  Conditions,
  Context,
  ParseConditions,
  IAbilityCanResponse,
  ValidateData,
} from '../types';
import tinytim from './tinytim';
import sift from 'sift';

export const getAsArray = (value: string | string[]) => {
  if (typeof value === 'string') return value.split(',');
  return value;
};

export const checkInArray = (value: string, values: string | string[]) => {
  return values.includes(value) || values.includes('*');
};

export const matchRoles = (abilityRoles?: Roles, roles?: Roles) => {
  if (!abilityRoles || !abilityRoles.length) {
    return true;
  }
  if (!roles) {
    return false;
  }
  return getAsArray(abilityRoles).some(role => roles.includes(role));
};

export const parseTemplate = (stringify: string, data: object) => {
  return JSON.parse(tinytim(stringify, data));
};

export const checkUserContext = (userContext?: UserContext, user?: object) => {
  if (!userContext) {
    return true;
  }
  if (!user) {
    return false;
  }
  if (userContext === true) {
    return true;
  }
  return sift(userContext)(user);
};

export const getParseConditions = (
  conditions: Conditions,
  context?: Context
): ParseConditions | null => {
  const user = context && context.user;
  const data = context && context.data;
  const parseConditions =
    typeof conditions === 'string'
      ? parseTemplate(conditions as string, { user, data })
      : conditions;
  return parseConditions;
};
export const checkConditions = (
  parseConditions: ParseConditions,
  context?: Context
) => {
  const data = context && context.data;
  const isArray = Array.isArray(data);
  if (isArray) {
    return (data as object[]).some(dataInArray =>
      sift(parseConditions)(dataInArray)
    );
  } else {
    return sift(parseConditions)(data);
  }
};

export const validateData = ({
  context,
  parseConditions,
  allowOne,
}: {
  context?: Context;
  parseConditions?: ParseConditions;
  allowOne?: boolean;
}) => {
  return (data: object | object[]) => {
    if (!data) return false;
    const isArray = Array.isArray(data);
    if (isArray && allowOne) return false;
    if (parseConditions) {
      const contextWithData = context ? { ...context, data } : { data };
      return checkConditions(parseConditions, contextWithData);
    }
    return true;
  };
};

const defaultValidateData = () => false;
export const getResponse = (
  can: boolean,
  message: string,
  where?: object,
  validateData?: ValidateData
): IAbilityCanResponse => {
  return {
    can,
    message,
    where,
    validateData: validateData || (defaultValidateData as ValidateData),
  };
};
