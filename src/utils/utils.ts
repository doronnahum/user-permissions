import {
  UserContext,
  Roles,
  Conditions,
  Context,
  ParseConditions,
  FieldsWithConditions,
  Config,
  ConfigFull,
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
  return abilityRoles.some(role => roles.includes(role));
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
    // tslint:disable-next-line: prefer-type-cast
    return parseTemplate(conditions as string, context ?? {});
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

export const isFieldsEmpty = (
  fields: [] | string[] | FieldsWithConditions[] | undefined | null
) => {
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
    // tslint:disable-next-line: prefer-type-cast
    obj = (obj as any)[splitPath[i]];

    // tslint:disable-next-line: strict-type-predicates
    if (obj === undefined) {
      return;
    }
  }

  const pathToDelete = splitPath.pop();
  // tslint:disable-next-line: prefer-type-cast
  if (typeof pathToDelete === 'string') delete (obj as any)[pathToDelete];
};

export const isObject = (item: any) => {
  return typeof item === 'object' && !Array.isArray(item) && item !== null;
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
    negativeFields,
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

export const asyncForEach = async (
  array: any[],
  callback: (item: any, index: number, array: any[]) => Promise<any>
) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const onNotAllowed = (action: string, resources: string) =>
  `You are not authorized to ${action} ${resources}`;

export const mergeConfigWithDefaults = (config?: Config): ConfigFull => {
  return {
    abortEarly: config?.abortEarly ?? true,
    validateData: {
      throwErr: config?.validateData?.throwErr ?? false,
    },
    throwErr: config?.throwErr ?? false,
    onNotAllowed: config?.onNotAllowed ?? onNotAllowed,
  };
};
