import {
  Conditions,
  Context,
  IAbility,
  IAbilitiesCanResponse
} from '../types';

import { filterData } from './filterData';
import { validateData } from './validateData';
import { renderMessageByTypes as getMessage, messageTypes } from '../messages';
import { isConditionEmpty, parseConditions, isFieldsEmpty } from './utils';
import can from './can';

const validateDataWithTrueResponse = (_data: object | object[]) => ({ valid: true });
const validateDataWithFalseResponse = (_data: object | object[]) => ({ valid: false });

const onAllowFullAccess = (response: IAbilitiesCanResponse, subject: string, action: string) => {
  response.message = getMessage(messageTypes.VALID, subject, action);
  response.filterDataIsRequired = false;
  response.fields = null;
  response.fieldsWithConditions = null;
  response.$select = null;
  response.conditions = undefined;
  response.validateData = validateDataWithTrueResponse;
  return response;
};

const onAllowLimitAccess = (response: IAbilitiesCanResponse, subject: string, action: string, conditions: object[] = []) => {
  response.message = getMessage(messageTypes.VALID, subject, action);
  response.conditions = conditions;

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

const onUserNotAllow = (response: IAbilitiesCanResponse, subject: string, action: string) => {
  response.validateData = validateDataWithFalseResponse;
  response.message = getMessage(messageTypes.NOT_ABLE_BY_ACTION, action, subject);
  return response;
};

export default (
  abilities: IAbility[],
  action: string,
  subject: string,
  context?: Context
): IAbilitiesCanResponse => {
  let allowFullAccess = false; // When one of the rules is free from fields&conditions
  let allowAllFields = false; // When one of the rules is free from fields;
  let conditions: object[] = [];

  const response: IAbilitiesCanResponse = {
    can: false,
    message: '',
    $select: null,
    fields: null,
    fieldsWithConditions: null,
    validateData: validateDataWithFalseResponse,
    filterData: () => null,
    filterDataIsRequired: false
  };

  /*
  |-----------------------------------------------------------------
  | Check abilities
  |-----------------------------------------------------------------
  |
  | Validate if one or more of the rules let the user the right
  | permission to make this request
  |
  | collect all the fields, conditions, meta from the rules
  |
  | The result will saved directly on the response object
  |
  */
  abilities.forEach((ability: IAbility) => {
    if (!can(ability, action, subject, context)) return;
    response.can = true; // User can [action] the [subject]

    /**
     * ## ability.conditions
     * ---------------------
     * Rule can allow [action] in a [subject] with a condition,
     * - for Example:
     *    - allow to create only unPublish posts be
     *       ```{actions: ['create'], subject: ['posts'], conditions: { when: true }} ```
     *
     */
    const hasConditions = !isConditionEmpty(ability.conditions);
    const hasFields = ability.fields && ability.fields.length > 0;

    /**
     * allowFullAccess -
     * When rule was free from conditions and fields then all the other conditions
     * are not relevant any more
     */
    allowFullAccess = allowFullAccess || (!hasConditions && !hasFields);

    /**
     * allowAllFields -
     * When one of the rules not include a fields limitation
     * Then response.$select will be null
     */
    allowAllFields = allowAllFields || !hasFields;

    if (!allowFullAccess) {
      let parsingCondition;
      if (hasConditions) {
        /**
         * parseConditions -
         * Conditions can be a template like ``` { id: {{ user.id }} } ```
         * parseConditions will parse template with the context
         */
        parsingCondition = parseConditions((ability.conditions as Conditions), context);
        conditions.push(parsingCondition);
      }
      if (hasFields) {
        if (parsingCondition) {
          response.fieldsWithConditions = response.fieldsWithConditions || [];
          response.fieldsWithConditions.push({
            fields: ability.fields as string[],
            conditions: parsingCondition
          });
        } else {
          response.fields = response.fields || [];
          response.fields.push(...(ability.fields as string[]));
        }
      } else {
        if (parsingCondition) {
          response.filterDataIsRequired = true;
          response.fieldsWithConditions = response.fieldsWithConditions || [];
          response.fieldsWithConditions.push({
            fields: ['*'],
            conditions: parsingCondition
          });
        }
      }
    }
  });

  if (response.can) {
    if (allowFullAccess) {
      return onAllowFullAccess(response, subject, action);
    } else {
      return onAllowLimitAccess(response, subject, action, conditions);
    }
  } else {
    return onUserNotAllow(response, subject, action);
  }

};
