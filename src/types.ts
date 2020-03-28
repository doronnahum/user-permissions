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
  onAccessDeny?: (action: string, resource: string) => string;
  throwErr?: boolean;
}
export interface ConfigFull {
  abortEarly: boolean;
  onAccessDeny: (action: string, resource: string) => string;
  throwErr: boolean;
}
export type When = (context?: Context) => Promise<boolean> | boolean;
export type UserContext = boolean | object;

export interface ValidateDataResponse {
  valid: boolean;
  message?: string;
}
export type ValidateData = (data: object | object[]) => ValidateDataResponse;

export interface FieldsWithConditions {
  conditions: object;
  fields: string[];
}

export interface IPermissionConstructor {
  actions?: Actions;
  resources?: Resources;

  roles?: string | Roles;
  conditions?: Conditions;
  fields?: string | Fields;
  user?: UserContext;
  when?: When;
  meta?: any;
}
