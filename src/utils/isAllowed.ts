import {
  Context,
  IAbility
} from '../types';

import { checkInArray, checkUserContext, matchRoles } from './utils';

export const isAllowed = async (
  ability: IAbility,
  action: string,
  resource: string,
  context?: Context
) => {
  const userData = context ? context.user : undefined;
  const roles = context ? context.roles : undefined;
  return (
    checkInArray(action, ability.actions) &&
    checkInArray(resource, ability.resources) &&
    (!ability.when || await ability.when(context)) &&
    checkUserContext(ability.user, userData) &&
    matchRoles(ability.roles, roles)
  );
};