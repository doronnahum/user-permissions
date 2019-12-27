import {
  UserContext,
  Roles,
  Conditions,
  Context,
  ParseConditions,
  IAbilityCanResponse,
  ValidateData,
  IAbility,
  Actions,
  IAbilitiesCanResponse,
  FieldsWithConditions
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

const abilityCanCheck = (
  ability: IAbility,
  subject: string,
  action: Actions,
  context?: Context
) => {
  return (
    checkInArray(subject, ability.subjects) &&
    checkInArray(action, ability.actions) &&
    (!ability.when || ability.when(context)) &&
    checkUserContext(ability.user, context && context.user) &&
    matchRoles(ability.roles, context && context.roles)
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
  subject: string,
  action: Actions,
  context?: Context
): IAbilitiesCanResponse => {
  let allowAllFields = false;
  let allowWithoutConditions = false;
  let allParseConditione: null | object[] = null;
  let allowMany = false;

  const response: IAbilitiesCanResponse = {
    can: false,
    message: getMessage(messageTypes.NOT_ABLE_BY_ACTION, subject, action),
    $select: null,
    fields: null,
    fieldsWithConditions: null,
    validateData: defaultValidateData,
    allowOne: false,
    filterData: res => res,
  };

  abilities.forEach(ability => {
    const can = abilityCanCheck(ability, subject, action, context);

    if (!can) return;

    response.can = true;
    
    if(ability.allowOne){
      if(!allowMany){
        response.allowOne = true;
      }
    }else{
      allowMany = true;
    }
    const parseConditions =
      ability.conditions && getParseConditions(ability.conditions, context);

    if (!parseConditions && !ability.fields) {
      allowAllFields = true;
      allowWithoutConditions = true;
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
    if(!allowWithoutConditions && allParseConditione && (allParseConditione as []).length > 0){
      response.where = {'$or': allParseConditione};
    }
  }
  return (response as IAbilitiesCanResponse);
};


export const filterData = (fields :null | string[], fieldsWithConditions: null | FieldsWithConditions[]) => {
  return (data: {} | {}[]) => {
    const isArray = Array.isArray(data);
    if(isArray){

    }else{
      const allowedFields = fields ? [...fields] : [];
      if(fieldsWithConditions){
        fieldsWithConditions.forEach(item => {
          if(checkConditions(item.conditions)){
            allowedFields.push(...item.fields);
          }
        })
      }
      
    }

  }
}