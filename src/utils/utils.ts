import {
  UserContext,
  Roles,
  Conditions,
  Context,
  ParseConditions,
  IAbilityCanResponse,
  ValidateData,
  IAbility,
  Actions
} from '../types';
import tinytim from './tinytim';
import sift from 'sift';

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

export const filterAbilities = (abilities: IAbility[], subject: string, action: Actions, context?: Context) => {
  return abilities.filter(ability => {
    return (
      checkInArray(subject, ability.subjects)
      && checkInArray(action, ability.actions)
      && (!ability.when || ability.when(context))
      && checkUserContext(ability.user, context && context.user)
      && matchRoles(ability.roles, context && context.roles)
    )
  })
}