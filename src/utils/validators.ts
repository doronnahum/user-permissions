import { UserContext, Roles, Actions, Resources, When, Fields } from '../types';

const isStringOrArrayOfString = (res: any) =>
  typeof res === 'string' ||
  (Array.isArray(res) && !res.some(item => typeof item !== 'string'));
export const validateActions = (actions: Actions) => {
  if (!isStringOrArrayOfString(actions)) {
    throw new Error(
      'check-abilities: actions is required and must be string | string[]'
    );
  }
  return true;
};

export const validateResource = (resources: Resources) => {
  if (!isStringOrArrayOfString(resources)) {
    throw new Error(
      'check-abilities: resources is required and must be string | string[]'
    );
  }
  return true;
};

export const validateRoles = (roles: string | Roles) => {
  if (!isStringOrArrayOfString(roles)) {
    throw new Error('check-abilities: roles must be type of string[]');
  }
  return true;
};

export const validateConditions = (conditions: object | string) => {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof conditions !== 'object' && typeof conditions !== 'string') {
    throw new Error(
      'check-abilities: conditions must be type of string | object'
    );
  }
  return true;
};

export const validateFields = (fields: string | Fields) => {
  if (!isStringOrArrayOfString(fields)) {
    throw new Error(
      'check-abilities: fields must be type of string[] or string'
    );
  }
  return true;
};

export const validateUser = (user: UserContext) => {
  if (
    user &&
    typeof user !== 'boolean' &&
    // tslint:disable-next-line: strict-type-predicates
    typeof user !== 'object'
  ) {
    throw new Error('check-abilities: user must be type of boolean | object');
  }
  return true;
};

export const validateWhen = (when: When) => {
  // tslint:disable-next-line: strict-type-predicates
  if (when && typeof when !== 'function') {
    throw new Error(
      'check-abilities: when must be type of function/ async function'
    );
  }
  return true;
};
