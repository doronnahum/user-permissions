export type Actions = string | string[];
export type Subjects = string | string[];

export type Conditions = string | {}; // stringify or object;
export interface ParseConditions {}
export type Roles = string[];
export interface Context {
  user?: object;
  roles?: Roles;
}
export type When = (context?: Context) => boolean;
export type UserContext = boolean | object;

export interface IAbility extends IAbilityOptions {
  actions: Actions;
  subjects: string | string[];
  roles?: Roles;
  conditions?: Conditions;
  fields?: string[];
  user?: UserContext;
  when?: When;
}

export interface IAbilityOptions {
  fields?: string[];
  user?: UserContext;
  when?: When;
}

export type ValidateData = (data: object | object[]) => boolean;

export interface IAbilityCanResponse {
  can: boolean;
  message: string;
  conditions?: object[];
  validateData: ValidateData;
}

export interface FieldsWithConditions {
  conditions: object;
  fields: string[];
}

export interface IAbilitiesCanResponse extends IAbilityCanResponse {
  $select: null | string[];
  fields: null | string[];
  fieldsWithConditions: null | FieldsWithConditions[];

  filterData: (data: object | object[]) => object | object[] | null;
}
