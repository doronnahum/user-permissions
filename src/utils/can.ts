import {
  Context,
  IAbility
} from '../types';

import { checkInArray, checkUserContext, matchRoles } from './utils';

export const can = async (
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
    (!ability.when || await ability.when(context)) &&
    checkUserContext(ability.user, userData) &&
    matchRoles(ability.roles, roles)
  );
};