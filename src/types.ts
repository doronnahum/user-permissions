export type Actions = string | string[];
export type Resources = string | string[];

export type Fields = string[];

export type Conditions = string | {}; // stringify or object;
export interface ParseConditions {}
export type Roles = string[];
export interface Context {
  user?: object;
  roles?: Roles;
  [key: string]: any;
}
export interface Config {
  abortEarly?: boolean;
  onNotAllowed? : (action: string, resource: string)=> string;
  validateData?: {
    throwErr?: boolean;
  };
  throwErr?: boolean
}
export interface ConfigFull {
  abortEarly: boolean;
  onNotAllowed : (action: string, resource: string)=> string;
  validateData: {
    throwErr: boolean;
  };
  throwErr: boolean
}
export type When = (context?: Context) => Promise<boolean> | boolean;
export type IsAllowed = (action: string,
  resource: string,
  context?: Context) => Promise<boolean>;
export type UserContext = boolean | object;


export interface ValidateDataResponse {valid: boolean; message?: string;}
export type ValidateData = (data: object | object[]) => ValidateDataResponse;

export interface FieldsWithConditions {
  conditions: object;
  fields: string[];
}

export interface IAbilitiesCheckResponse {
  allow: boolean;
  message: string;
  conditions?: null | object[];
  validateData: ValidateData;
  fields: {
    allowAll: boolean,
    allowed: null | string[],
    allowedByCondition: null | FieldsWithConditions[],
    all: null | string[]
  },

  filterData: (data: object | object[]) => object | object[] | null;
  filterDataIsRequired: boolean;
  meta: any[];
}
