import {
  IAbility, Context, Config,
} from '../types';

import { isConditionEmpty, isFieldsEmpty, asyncForEach } from './utils';
import { isAllowed } from './isAllowed';
import {
  onAllowFullAccess,
  onUserNotAllow,
  updateResponseWithAbilityFieldsAndConditons
} from './checkAbilities.response';
import {AbilitiesResponse} from '../AbilitiesResponse'

const defaultConfig = {
  abortEarly: true,
};

const checkAbilities = async (abilities: IAbility[], action: string, resource: string, context?: Context, _config?: Config) => {
  const response = new AbilitiesResponse(action, resource);
  const config = Object.assign({}, defaultConfig, _config);

  let allowFullAccess = false; // When at least one ability is allow all fields without any condition
  let allowAllFields = false; // When at least one ability is allow all fields

  /*
  |-----------------------------------------------------------------
  | Check abilities
  |-----------------------------------------------------------------
  | Pass over all abilities and collect fields, condition, meta
  |
  */
  await asyncForEach(abilities, async (ability: IAbility) => {
    const isAbleByCurrentAbility = allowFullAccess || await isAllowed(ability, action, resource, context);

    // Return When The ability is not allowed the request
    if (!isAbleByCurrentAbility && config.abortEarly) {
      return;
    }

    response.setAllow(true); // User allow [action] the [resource]
    if (ability.meta) response.pushMeta(ability.meta);
    const hasFields = !isFieldsEmpty(ability.fields);
    const hasConditions = !isConditionEmpty(ability.conditions);
    allowFullAccess = allowFullAccess || (!hasConditions && !hasFields);
    allowAllFields = allowAllFields || !hasFields;
    if (!allowFullAccess) updateResponseWithAbilityFieldsAndConditons(response, ability, hasFields, hasConditions, context);
  });

  /**
   * Return
   */
  if (response.isAllow()) {
    if (allowFullAccess) {
      return onAllowFullAccess(response);
    } else {
      return response;
    }
  } else {
    return onUserNotAllow(response);
  }
};

export default checkAbilities;
