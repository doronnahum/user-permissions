import {UserContext} from './types';
import sift from 'sift';
import doT from 'dot';
import {
  USER_ROLE_FIELD
} from './config';

export const checkInArray = (value: string, values: string | string[]) => {

  if (typeof values === 'string') {
    if (values === '*') { 
      return true;
    }
    if (values === value) {
      return true;
    }
  } else {
    if (values.some(s => s === value)) {
      return true;
    }
  }
  return false;
}

export const matchRoles = (userRoles?: string[], ruleRoles?: string[]) => {

  if (!ruleRoles || !ruleRoles.length) {
    return true;
  }
  if (!userRoles) {
    return false;
  }
  return ruleRoles.some(role => userRoles.some(item => item === role));
}


export const parseTemplate = (stringify: string, data: object) => {
  return JSON.parse(doT.template(stringify)(data));

}

export const checkUserContext = async (userContext?: UserContext ,user?: object) => {
  if (!userContext) {
    return true;
  }
  if (typeof userContext === 'function') {
    return userContext(user);
  }
  if (!user) {
    return false;
  }
  if (userContext === true) {
    return true;
  }
  const isStringify = typeof userContext === 'string';
  const context = isStringify ? parseTemplate((userContext as string), user) : userContext;
  return sift(context)(user);
}

export const checkConditions = (data: object | object[], conditions?: object | string ,user?: object) => {
  if (!conditions) {
    return true;
  }


  const isStringify = typeof conditions === 'string';
  const conditionsToCheck = isStringify ? parseTemplate((conditions as string), user || {}) : conditions;
  const isArray = Array.isArray(data);
  if(isArray){
    return (data as object[]).some(obj => sift(conditionsToCheck)(obj))
  }else{
    return sift(conditionsToCheck)(data)
  }
}

export const getRolesFromUser = (user?: object) => user && (user as any)[USER_ROLE_FIELD];