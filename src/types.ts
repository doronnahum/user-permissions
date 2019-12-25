export type Actions = 'create' | 'read' | 'update' | 'delete' | '*';

export type Conditions = string | {};
export type ParseConditions = {};
export type Roles = string | string[];
export type Context = {
  user?: object;
  roles?: Roles;
};
export type When = (context?: Context) => boolean;
export type UserContext = boolean | object;

export interface IAbility {
  actions: Actions | Actions[];
  subject: string | string[];
  fields?: string[];
  conditions?: Conditions;
  roles?: Roles;
  user?: UserContext;
  allowOne?: boolean;
  when?: When;
}

export type ValidateData = (data: object | object[]) => boolean;
export interface IAbilityCanResponse {
  can: boolean;
  message: string;
  where?: object;
  validateData: ValidateData;
}
