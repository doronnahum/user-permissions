import {
  IAbilitiesCanResponse,
  IAbility,
  Context,
  Conditions
} from '../types';

import { filterData } from './filterData';
import { validateData } from './validateData';
import { renderMessageByTypes as getMessage, messageTypes } from '../messages';
import { parseConditions, isFieldsEmpty } from './utils';

export const getInitialResponse = (): IAbilitiesCanResponse => ({
  can: false,
  message: '',
  $select: null,
  fields: null,
  fieldsWithConditions: null,
  conditions: null,
  meta: [],
  validateData: validateDataWithFalseResponse,
  filterData: () => null,
  filterDataIsRequired: false
});

/**
 * @function validateDataWithTrueResponse
 * @description Use to confirm data by default
 * @param _data
 * @return { valid: true }
 */
export const validateDataWithTrueResponse = (_data: object | object[]) => ({ valid: true });

/**
 * @function validateDataWithFalseResponse
 * @description Use to reject data by default
 * @param _data
 * @return { valid: false }
 */
export const validateDataWithFalseResponse = (_data: object | object[]) => ({ valid: false });

/**
 * @function onAllowFullAccess
 * @description return IAbilitiesCanResponse with full access
 * full access is ability to make the request without conditions/fields limits
 * @param response
 * @param subject
 * @param action
 */
export const onAllowFullAccess = (response: IAbilitiesCanResponse, subject: string, action: string) => {
  response.message = getMessage(messageTypes.VALID, subject, action);
  response.filterDataIsRequired = false;
  response.fields = null;
  response.fieldsWithConditions = null;
  response.$select = null;
  response.conditions = null;
  response.validateData = validateDataWithTrueResponse;
  return response;
};

export const onUserNotAllow = (response: IAbilitiesCanResponse, subject: string, action: string) => {
  response.conditions = null;
  response.fields = null;
  response.validateData = validateDataWithFalseResponse;
  response.message = getMessage(messageTypes.NOT_ABLE_BY_ACTION, action, subject);
  return response;
};

export const updateResponseWithAbilityFieldsAndConditons = (response: IAbilitiesCanResponse, ability: IAbility, hasFields: boolean, hasConditions: boolean, context?: Context) => {
  const parsingCondition = hasConditions ? parseConditions((ability.conditions as Conditions), context) : undefined;
  if (parsingCondition) {
    response.conditions = response.conditions || [];
    response.filterDataIsRequired = true;
    response.conditions.push(parsingCondition);
  }
  if (hasFields && parsingCondition) {
    response.fieldsWithConditions = response.fieldsWithConditions || [];
    response.filterDataIsRequired = true;
    response.fieldsWithConditions.push({
      fields: ability.fields as string[],
      conditions: parsingCondition
    });
  } else if (!hasFields && parsingCondition) {
    response.fieldsWithConditions = response.fieldsWithConditions || [];
    response.filterDataIsRequired = true;
    response.fieldsWithConditions.push({
      fields: ['*'],
      conditions: parsingCondition
    });
  } else if (hasFields && !parsingCondition) {
    response.fields = response.fields || [];
    response.filterDataIsRequired = true;
    response.fields.push(...(ability.fields as string[]));
  }
};

/**
 * @function onAllowFullAccess
 * @description return IAbilitiesCanResponse with limit access
 * limit access is ability to make the request with some conditions/fields limits
 * @param response
 * @param subject
 * @param action
 * @param conditions
 */
export const onAllowLimitAccess = (response: IAbilitiesCanResponse, subject: string, action: string) => {
  response.message = getMessage(messageTypes.VALID, subject, action);
// When one or more of the rules includes fields then filterData is added to the response
  const hasField = !isFieldsEmpty(response.fields) || !isFieldsEmpty(response.fieldsWithConditions);
  if (hasField) {
    response.filterData = (data: object[] | object) => filterData(data, response.fields, response.fieldsWithConditions);
  }

// When one or more of the rules includes fields and\or conditions then add validateData to the response
  if (hasField || response.conditions) {
    const mongooseWhere = response.conditions ? { $or:  response.conditions } : undefined;
    response.validateData = (data: object[] | object) => validateData(data, response.fields, response.fieldsWithConditions, mongooseWhere);
  }
  return response;
};
