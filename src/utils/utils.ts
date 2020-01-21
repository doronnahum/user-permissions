import {
  UserContext,
  Roles,
  Conditions,
  Context,
  ParseConditions,
  IAbility,
  Actions,
  Subjects,
  IAbilitiesCanResponse,
  IAbilityOptions,
} from '../types';
import tinytim from './tinytim';
import sift from 'sift';
import { renderMessageByTypes as getMessage, messageTypes } from '../messages';

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

export const getParseConditions = (
  conditions: Conditions,
  context?: Context
): ParseConditions | null => {
  const user = context && context.user;
  const parseConditions =
    typeof conditions === 'string'
      ? parseTemplate(conditions as string, { user })
      : conditions;
  return parseConditions;
};
export const checkConditions = (
  parseConditions: ParseConditions,
  data?: object | object[]
) => {
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
      return checkConditions(parseConditions, data);
    }
    return true;
  };
};

const defaultValidateData = () => false;

const abilityCanCheck = (
  ability: IAbility,
  action: string,
  subject: string,
  context?: Context
) => {
  const userData = context ? context.user : undefined;
  const roles = context ? context.roles : undefined;
  return (
    checkInArray(action, ability.actions) &&
    checkInArray(subject, ability.subjects) &&
    (!ability.when || ability.when(context)) &&
    checkUserContext(ability.user, userData) &&
    matchRoles(ability.roles, roles)
  );
};

const checkAbilitiesResponseHelpers = {
  onEmptyFieldsAndConditions: (response: IAbilitiesCanResponse) => {
    response.$select = null;
    response.fields = null;
    response.fieldsWithConditions = null;
  },
  addFieldsWithConditions: (
    response: IAbilitiesCanResponse,
    ability: IAbility,
    parseConditions: {}
  ) => {
    response.fieldsWithConditions = response.fieldsWithConditions || [];
    response.$select = response.$select || [];
    response.fieldsWithConditions.push({
      fields: ability.fields as string[],
      conditions: parseConditions,
    });
  },
  addFields: (response: IAbilitiesCanResponse, ability: IAbility) => {
    response.fields = response.fields || [];
    response.fields.push(...(ability.fields as string[]));
  },
  buildSelectFieldsAndFilterFieldsWithConditions: (
    response: IAbilitiesCanResponse
  ) => {
    if (response.fields || response.fieldsWithConditions) {
      response.$select = [];
      if (response.fields) {
        response.$select.push(...response.fields);
      }
      if (response.fieldsWithConditions) {
        if (response.fields) {
          const fieldsWithConditions = [];
          response.fieldsWithConditions.forEach(item => {
            const fields = item.fields.filter(
              field => !(response.fields as string[]).includes(field)
            );
            if (fields.length) {
              fieldsWithConditions.push({
                fields: fields,
                conditions: item.conditions,
              });
            }
          });
        } else {
          response.fieldsWithConditions.forEach(item => {
            (response.$select as string[]).push(...item.fields);
          });
        }
      }
    }
  },
};

export const checkAbilities = (
  abilities: IAbility[],
  action: string,
  subject: string,
  context?: Context
): IAbilitiesCanResponse => {
  let allowAllFields = false;
  let allowWithoutConditions = false;
  let allParseConditione: null | object[] = null;
  let allowMany = false;

  const response: IAbilitiesCanResponse = {
    can: false,
    message: getMessage(messageTypes.NOT_ABLE_BY_ACTION, action, subject),
    $select: null,
    fields: null,
    fieldsWithConditions: null,
    validateData: defaultValidateData,
    allowOne: false,
    filterData: res => res,
  };

  abilities.forEach(ability => {
    const can = abilityCanCheck(ability, action, subject, context);

    if (!can) return;

    response.can = true;

    if (ability.allowOne) {
      if (!allowMany) {
        response.allowOne = true;
      }
    } else {
      allowMany = true;
    }
    let parseConditions;
    if (ability.conditions && !allParseConditione) {
      parseConditions = getParseConditions(ability.conditions, context);
    } else {
      allowWithoutConditions = true;
    }
    if (!ability.conditions && !ability.fields) {
      allowAllFields = true;
      checkAbilitiesResponseHelpers.onEmptyFieldsAndConditions(response);
    }

    if (!allowWithoutConditions && parseConditions) {
      allParseConditione = allParseConditione || [];
      allParseConditione.push(parseConditions);
    }

    if (!allowAllFields) {
      if (parseConditions && ability.fields) {
        checkAbilitiesResponseHelpers.addFieldsWithConditions(
          response,
          ability,
          parseConditions
        );
      } else if (!parseConditions && ability.fields) {
        checkAbilitiesResponseHelpers.addFields(response, ability);
      }
    }
  });
  if (response.can) {
    response.message = getMessage(messageTypes.VALID, subject, action);
    checkAbilitiesResponseHelpers.buildSelectFieldsAndFilterFieldsWithConditions(
      response
    );
    if (
      !allowWithoutConditions &&
      allParseConditione &&
      (allParseConditione as []).length > 0
    ) {
      response.where = { $or: allParseConditione };
    }
  }
  return response as IAbilitiesCanResponse;
};

export const deletePropertyPath = (obj: {}, path: string) => {
  if (!obj || !path) {
    return;
  }
  let splitPath: string[] = path.split('.');

  for (var i = 0; i < splitPath.length - 1; i++) {
    obj = (obj as any)[splitPath[i]];

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

const optionsValidKeys = 'allowOne,fields,user,when';
const validateOptions = (options?: IAbilityOptions) => {
  if (options) {
    if (typeof options !== 'object') {
      throw new Error('options must be type of object');
    }
    if (options.allowOne && typeof options.allowOne !== 'boolean') {
      throw new Error('options.allowOne must be type of boolean');
    }
    if (
      options.fields &&
      (!Array.isArray(options.fields) ||
        options.fields.some(field => typeof field !== 'string'))
    ) {
      throw new Error('options.fields must be type of string[]');
    }
    if (
      options.user &&
      typeof options.user !== 'boolean' &&
      typeof options.user !== 'object'
    ) {
      throw new Error('options.fields must be type of boolean | object');
    }
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
