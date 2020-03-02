export type Actions = string | string[];
export type Subjects = string | string[];

export type Fields = string[];

export type Conditions = string | {}; // stringify or object;
export interface ParseConditions {}
export type Roles = string[];
export interface Context {
  user?: object;
  roles?: Roles;
  [key: string]: any;
}
export type When = (context?: Context) => Promise<boolean> | boolean;
export type UserContext = boolean | object;

export interface IAbility {
  actions: Actions;
  subjects: string | string[];
  roles?: Roles;
  conditions?: Conditions;
  fields?: string[];
  user?: UserContext;
  when?: When;
  meta?: any;
}

export type ValidateDataResponse = {valid: boolean, message?: string};
export type ValidateData = (data: object | object[]) => ValidateDataResponse;


export interface FieldsWithConditions {
  conditions: object;
  fields: string[];
}

export interface CheckAbilitiesParams {
  abilities: IAbility[]; action: string; subject: string; context?: Context;
}

export interface IAbilitiesCanResponse {
  can: boolean;
  message: string;
  conditions?: null | object[];
  validateData: ValidateData;
  $select: null | string[];
  fields: null | string[];
  fieldsWithConditions: null | FieldsWithConditions[];

  filterData: (data: object | object[]) => object | object[] | null;
  filterDataIsRequired: boolean;
  meta: any[];
}
