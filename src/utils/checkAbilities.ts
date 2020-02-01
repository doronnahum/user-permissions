import {
  Conditions,
  Context,
  IAbility,
  IAbilitiesCanResponse
} from '../types';

import { filterObject } from './filterData';
import { renderMessageByTypes as getMessage, messageTypes } from '../messages';
import { checkConditions, isConditionEmpty, parseConditions, isFieldsEmpty } from './utils';
import can from './can';

/**
 * @function checkAbilities
 * --------------
 * ### pass over all the abilities and test them by
 *     action, subject, roles, when, userContext.
 * ### Return an object with a test result:
 * - response = {
 *      - can: boolean,
 *      - messages: string, // 'Valid' or 'You are not allowed to...'
 *      - where: object[] // array of conditions to use as request query
 *      - validateData: function, // (data) => true/false, Validate that data is valid by abilities
 *      - filterData: function // (data) => filteredData, Remove fields thats not allowed
 *      - $select: string[] //includes all the possible fields, empty when all fields are allowed
 * }
 */
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
    validateData: () => false,
    filterData: () => null,
    filterDataIsRequired: false
  };

  const checkAbility = (ability: IAbility) => {
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
  };

  /**
   * Pass over all the abilities
   *  1. check that user can [action] the [subject]
   *  2. collect all the fields & conditions
   */
  abilities.forEach(checkAbility);

  if (!response.can) {
    response.message = getMessage(messageTypes.NOT_ABLE_BY_ACTION, action, subject);
  } else {
    response.message = getMessage(messageTypes.VALID, subject, action);
    if (allowFullAccess) {
      response.filterDataIsRequired = false;
      response.fields = null;
      response.fieldsWithConditions = null;
      response.$select = null;
      response.conditions = undefined;
    } else {
      response.conditions = conditions;

    /**
     * validateData
     * -------------------
     * Validate data is valid by the abilities conditions
     * @example ```
     * Abilities.check('create', 'posts').validateData({title: 'Hi'}) === true
     * ```
     */
      response.validateData = (data: object | object[]) => {
        const mongooseWhere = response.conditions ? { $or:  response.conditions } : undefined;
        if (!data) return false;
        if (mongooseWhere) {
          return checkConditions(mongooseWhere, data);
        }
        return true;
      };
    /**
     * filterData
     * -------------------
     * When one or more of the rules includes a fields then filterData
     * can handle this check(...).filterData(data) : filteredData
     */
      const hasField = !isFieldsEmpty(response.fields) || !isFieldsEmpty(response.fieldsWithConditions);
      if (hasField) {
        response.filterData = (data: object[] | object) => {
          const isArray = Array.isArray(data);
          if (isArray) {
            return (data as Array<{}>).map(item =>
              filterObject(item, response.fields, response.fieldsWithConditions)
            );
          }
          return filterObject(data, response.fields, response.fieldsWithConditions);
        };
      }
    }
  }
  return response;
};
