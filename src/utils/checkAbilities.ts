import {
  IAbility, Context, Config,
} from '../types';

import { isConditionEmpty, isFieldsEmpty, asyncForEach } from './utils';
import { isAllowed } from './isAllowed';
import {
  getInitialResponse,
  onAllowFullAccess,
  onAllowLimitAccess,
  onUserNotAllow,
  updateResponseWithAbilityFieldsAndConditons
} from './checkAbilities.response';


const checkAbilities = async (abilities: IAbility[], action: string, resource: string, context?: Context, config?: Config) => {

  /*
  |-----------------------------------------------------------------
  | response
  |-----------------------------------------------------------------
  | {
  |   allow: boolean; - User able/not able to make this request
  |   message: string; // 'Valid' or `You are not able to ${action} ${resources}`
  |   conditions?: object[]; // Collection of all abilities conditions
  |   $select: null | string[]; // List of all possible fields, allow be uses as query select
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
    const isAbleByCurrentAbility = await isAllowed(ability, action, resource, context);

    // Return When The ability is not allowed the request
    if (!isAbleByCurrentAbility) {
      return;
    }

    response.allow = true; // User allow [action] the [resource]
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
  if (response.allow) {
    if (allowFullAccess) {
      return onAllowFullAccess(response);
    } else {
      return onAllowLimitAccess(response);
    }
  } else {
    return onUserNotAllow(response, resource, action, config);
  }
};

export default checkAbilities;
