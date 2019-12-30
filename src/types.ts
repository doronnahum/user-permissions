export type Actions = string | string[];
export type Subjects = string | string[];

export type Conditions = string | {};
export type ParseConditions = {};
export type Roles = string[];
export type Context = {
  user?: object;
  roles?: Roles;
};
export type When = (context?: Context) => boolean;
export type UserContext = boolean | object;

export interface IAbility extends IAbilityOptions {
  actions: Actions;
  subjects: string | string[];
  roles?: Roles;
  conditions?: Conditions;
}

export interface IAbilityOptions {
  fields?: string[];
  user?: UserContext;
  allowOne?: boolean;
  when?: When;
}

export type ValidateData = (data: object | object[]) => boolean;
export type FilterData = (data: object | object[]) => object | object[];
export interface IAbilityCanResponse {
  can: boolean;
  message: string;
  where?: object;
  validateData: ValidateData;
}

export type FieldsWithConditions = { conditions: object; fields: string[] };

export interface IAbilitiesCanResponse extends IAbilityCanResponse {
  $select: null | string[];
  fields: null | string[];
  fieldsWithConditions: null | FieldsWithConditions[];

  allowOne: boolean;
  filterData: FilterData;
}
