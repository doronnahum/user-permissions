import {
  IAbility,
  CheckAbilitiesParams
} from '../types';

import { isConditionEmpty, isFieldsEmpty, asyncForEach } from './utils';
import can from './can';
import {
  getInitialResponse,
  onAllowFullAccess,
  onAllowLimitAccess,
  onUserNotAllow,
  updateResponseWithAbilityFieldsAndConditons
} from './checkAbilities.response';

const checkAbilities = async (params: CheckAbilitiesParams) => {
  const { abilities, action, subject, context } = params;

  /*
  |-----------------------------------------------------------------
  | response
  |-----------------------------------------------------------------
  | {
  |   can: boolean; - User able/not able to make this request
  |   message: string; // 'Valid' or `You are not able to ${action} ${subjects}`
  |   conditions?: object[]; // Collection of all abilities conditions
  |   $select: null | string[]; // List of all possible fields, can be uses as query select
  |   fields: null | string[]; // List of all allowed fields without any condition
  |   fieldsWithConditions: null | {conditions,fields}[]; // List of fields that allow with condition
  |   filterDataIsRequired: boolean; // When user is allowed to make the request with a condition/s
  |   filterData: function; // filters data by abilities (data: object | object[]) => object | object[] | null;
  |   validateData: function; // Validate data fields and and by conditions (data) => ({valid: boolean})
  |   meta: []
  | }
  |
  */
  const response = getInitialResponse();

  /*
  |-----------------------------------------------------------------
  | allowFullAccess
  |-----------------------------------------------------------------
  | When at least one ability is allow all fields without any condition
  |
  */
  let allowFullAccess = false;

  /*
  |-----------------------------------------------------------------
  | allowAllFields
  |-----------------------------------------------------------------
  | When at least one ability is allow all fields
  |
  */
  let allowAllFields = false;

  /*
  |-----------------------------------------------------------------
  | Check abilities
  |-----------------------------------------------------------------
  | Pass over all abilities and collect fields, condition, meta
  |
  */
  await asyncForEach(abilities, async (ability: IAbility) => {
    const isAbleByCurrentAbility = await can(ability, action, subject, context);

    // Return When The ability is not allowed the request
    if (!isAbleByCurrentAbility) {
      return;
    }

    response.can = true; // User can [action] the [subject]
    if (ability.meta) response.meta.push(ability.meta);
    const hasFields = !isFieldsEmpty(ability.fields);
    const hasConditions = !isConditionEmpty(ability.conditions);
    allowFullAccess = allowFullAccess || (!hasConditions && !hasFields);
    allowAllFields = allowAllFields || !hasFields;
    if (!allowFullAccess) updateResponseWithAbilityFieldsAndConditons(response, ability, hasFields, hasConditions, context);
  });

  /**
   * Return
   */
  if (response.can) {
    if (allowFullAccess) {
      return onAllowFullAccess(response, subject, action);
    } else {
      return onAllowLimitAccess(response, subject, action);
    }
  } else {
    return onUserNotAllow(response, subject, action);
  }
};

export default checkAbilities;
