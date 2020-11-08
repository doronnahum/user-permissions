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

export interface ICheckResponse {
  action: string;
  resource: string;
  allow: boolean;
  message: string | null | undefined;
  conditions: object[] | null | undefined;
  fields: {
    allowAll: boolean;
    allow: string[] | null;
    allowedByCondition: FieldsWithConditions[] | null;
    getFieldsToSelect: () => string[];
  };
  meta: any[] | null;
  filterData: (data: object | object[]) => object | object[] | null;
  validateData: ValidateData;
  filterDataIsRequired: boolean;
}
