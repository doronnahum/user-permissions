import {
  IAbility,
  Context,
  Conditions,
  Fields,
} from '../types';

import { parseConditions } from './utils';
import {AbilitiesResponse} from '../AbilitiesResponse';

/**
 * @function onAllowFullAccess
 * @description return AbilitiesResponse with full access
 * full access is ability to make the request without conditions/fields limits
 * @param response
 */
export const onAllowFullAccess = (response: AbilitiesResponse) => {
  response.allowFullAccess()
  return response;
};

export const onUserNotAllow = (response: AbilitiesResponse) => {
  response.onUserNotAllow();
  return response;
};

export const updateResponseWithAbilityFieldsAndConditons = (response: AbilitiesResponse, ability: IAbility, hasFields: boolean, hasConditions: boolean, context?: Context) => {
  // tslint:disable-next-line: prefer-type-cast
  const parsingCondition = hasConditions ? parseConditions((ability.conditions as Conditions), context) : undefined;
  if (parsingCondition) {
    response.pushConditions(parsingCondition);
  }
  if (hasFields && parsingCondition) {
    response.pushFieldsWithConditions({
      // tslint:disable-next-line: prefer-type-cast
      fields: ability.fields as string[],
      conditions: parsingCondition
    });
  } else if (!hasFields && parsingCondition) {
    response.pushFieldsWithConditions({
      fields: ['*'],
      conditions: parsingCondition
    });
  } else if (hasFields && !parsingCondition) {
    response.pushFields(<Fields>ability.fields);
  }
};

