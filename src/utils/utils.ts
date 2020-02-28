import {
  UserContext,
  Roles,
  Conditions,
  Context,
  ParseConditions,
  Actions,
  Subjects,
  IAbilityOptions,
  FieldsWithConditions
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

export const checkUserContext = (user?: UserContext, userData?: object) => {
  if (!user) {
    return true;
  }
  if (!userData) {
    return false;
  }
  if (user === true) {
    return true;
  }
  return sift(user)(userData);
};

export const parseConditions = (
  conditions: Conditions,
  context?: Context
): ParseConditions => {
  const isTemplate = typeof conditions === 'string';
  if (isTemplate) {
    return parseTemplate((conditions as string), context || {});
  }
  return conditions;
};
export const checkConditions = (
  parseConditions: ParseConditions,
  data?: object | object[]
) => sift(parseConditions)(data);

export const isConditionEmpty = (conditions: Conditions | undefined) => {
  if (!conditions) return true;
  if (typeof conditions === 'string') {
    return conditions.length < 6; // '{"a":1}'
  }
  return Object.keys(conditions).length < 1;
};

export const isFieldsEmpty = (fields: [] | string[] | FieldsWithConditions[] | undefined | null) => {
  if (!fields) return true;
  if (fields.length < 1) return true;
  return false;
};

export const deletePropertyPath = (obj: {}, path: string) => {
  if (!obj || !path) {
    return;
  }
  const splitPath: string[] = path.split('.');

  for (let i = 0; i < splitPath.length - 1; i++) {
    obj = (obj as any)[splitPath[i]];

    // tslint:disable-next-line: strict-type-predicates
    if (typeof obj === 'undefined') {
      return;
    }
  }

  const pathToDelete = splitPath.pop();
  if (typeof pathToDelete === 'string') delete (obj as any)[pathToDelete];
};

const validateActions = (actions: Actions) => {
  if (typeof actions !== 'string' && !Array.isArray(actions)) {
    throw new Error('actions is required and must be string | string[]');
  }
};

const validateSubject = (subjects: Subjects) => {
  if (typeof subjects !== 'string' && !Array.isArray(subjects)) {
    throw new Error('subjects is required and must be string | string[]');
  }
};

const validateRoles = (roles?: Roles) => {
  if (
    roles &&
    // tslint:disable-next-line: strict-type-predicates
    (!Array.isArray(roles) || roles.some(role => typeof role !== 'string'))
  ) {
    throw new Error('roles must be type of string[]');
  }
};

const validateConditions = (conditions?: object | string) => {
  if (conditions) {
    if (typeof conditions !== 'object' && typeof conditions !== 'string') {
      throw new Error('conditions must be type of string | object');
    }
  }
};

const optionsValidKeys = 'fields,user,when';
const validateOptions = (options?: IAbilityOptions) => {
  if (options) {
    // tslint:disable-next-line: strict-type-predicates
    if (typeof options !== 'object') {
      throw new Error('options must be type of object');
    }
    if (
      options.fields &&
      (!Array.isArray(options.fields) ||
        // tslint:disable-next-line: strict-type-predicates
        options.fields.some(field => typeof field !== 'string'))
    ) {
      throw new Error('options.fields must be type of string[]');
    }
    if (
      options.user &&
      typeof options.user !== 'boolean' &&
      // tslint:disable-next-line: strict-type-predicates
      typeof options.user !== 'object'
    ) {
      throw new Error('options.fields must be type of boolean | object');
    }
    // tslint:disable-next-line: strict-type-predicates
    if (options.when && typeof options.when !== 'function') {
      throw new Error('options.when must be type of function');
    }
    if (Object.keys(options).some(key => !optionsValidKeys.includes(key))) {
      console.warn('options can be include one of ' + optionsValidKeys);
    }
  }
};

export const validateAbilityArguments = (
  actions: Actions,
  subjects: Subjects,
  roles?: Roles,
  conditions?: object | string,
  options?: IAbilityOptions
) => {
  validateActions(actions);
  validateSubject(subjects);
  validateRoles(roles);
  validateConditions(conditions);
  validateOptions(options);
};

export const isObject = (item: any) => {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null);
};

export const splitFields = (allowedFields: string[]) => {
  const positiveFields: string[] = [];
  const negativeFields: string[] = [];
  allowedFields.forEach(field => {
    if (field.startsWith('-')) {
      negativeFields.push(field.substr(1));
    } else {
      positiveFields.push(field);
    }
  });
  return {
    positiveFields,
    negativeFields
  };
};

export const getAllowedFields = (
  data: {},
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
) => {
  const allowedFields = fields ? [...fields] : [];
  if (fieldsWithConditions) {
    fieldsWithConditions.forEach(item => {
      if (checkConditions(item.conditions, data)) {
        allowedFields.push(...item.fields);
      }
    });
  }
  return allowedFields;
};