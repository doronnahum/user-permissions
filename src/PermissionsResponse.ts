import {
  ValidateData,
  FieldsWithConditions,
  ConfigFull,
  Fields,
  Context,
  Conditions,
} from './types';

import { validateData } from './utils/validateData';
import { filterData } from './utils/filterData';
import { parseConditions } from './utils/utils';
import Permission from 'Permission';

export class PermissionsResponse {
  private action: string;
  private resource: string;
  private allow: boolean;
  private message?: null | string;
  private conditions?: null | object[];
  private validateData: ValidateData;
  private fields: {
    allowAll: boolean;
    allowed: null | string[];
    allowedByCondition: null | FieldsWithConditions[];
    getFieldsToSelect: () => string[];
  };

  private filterData: (data: object | object[]) => object | object[] | null;
  private filterDataIsRequired: boolean;
  private meta: null | any[];
  private context?: Context;
  private config: ConfigFull;
  constructor(
    action: string,
    resource: string,
    config: ConfigFull,
    context?: Context
  ) {
    this.action = action;
    this.resource = resource;
    this.allow = false;
    this.filterDataIsRequired = false;
    this.meta = null;
    this.context = context;
    this.validateData = (data: object | object[]) => {
      if (this.allow) {
        if (this.fields.allowAll) {
          return { valid: true };
        }
        const mongooseWhere = this.conditions ? { $or: this.conditions } : null;
        return validateData(
          data,
          this.fields.allowed,
          this.fields.allowedByCondition,
          mongooseWhere,
          this.config
        );
      } else {
        const errMessage = 'Not allowed to make this request';
        if (config.validateData.throwErr) {
          throw new Error(errMessage);
        }
        return { valid: false, message: errMessage };
      }
    };
    this.config = config;
    this.fields = {
      allowAll: false,
      allowed: null,
      allowedByCondition: null,
      getFieldsToSelect: () => {
        const fields: string[] = [];
        if (this.fields.allowed) {
          fields.push(...this.fields.allowed);
        }
        if (this.fields.allowedByCondition) {
          this.fields.allowedByCondition.forEach(item => {
            fields.push(...item.fields);
          });
        }
        return fields;
      },
    };
    this.filterData = (data: object | object[]) => {
      if (this.fields.allowAll) {
        return data;
      }
      return filterData(
        data,
        this.fields.allowed,
        this.fields.allowedByCondition
      );
    };
  }

  public isPermission() {
    return this.allow;
  }
  public setPermission(value: boolean) {
    this.allow = value;
  }
  public setMessage(value: null | string) {
    this.message = value;
  }

  public pushConditions(value: object) {
    if (!this.conditions) this.conditions = [];
    this.filterDataIsRequired = true;
    this.conditions.push(value);
  }
  public pushMeta(value: any) {
    if (!this.meta) this.meta = [];
    this.meta.push(value);
  }
  public setPermissionAllFields(value: boolean) {
    this.fields.allowAll = value;
    if (value) {
      this.fields.allowed = null;
      this.fields.allowedByCondition = null;
    }
  }
  public pushFieldsWithConditions(value: FieldsWithConditions) {
    if (!this.fields.allowedByCondition) this.fields.allowedByCondition = [];
    this.fields.allowedByCondition.push(value);
  }
  public pushFields(value: Fields) {
    if (!this.fields.allowed) this.fields.allowed = [];
    this.fields.allowed.push(...value);
  }

  public allowFullAccess() {
    this.setPermissionAllFields(true);
    this.conditions = null;
  }
  public onUserNotPermission() {
    this.fields.allowAll = false;
    this.fields.allowed = null;
    this.fields.allowedByCondition = null;
    this.conditions = null;
    this.setPermission(false);
    this.message = this.config.onNotPermissioned(this.action, this.resource);
  }

  updateFieldsAndConditions(ability: Permission) {
    const hasFields = ability.hasFields();
    const hasConditions = ability.hasConditions();
    const fields = ability.getFields();
    const conditions = ability.getConditions();
    // tslint:disable-next-line: prefer-type-cast
    const parsingCondition = hasConditions
      ? parseConditions(conditions as Conditions, this.context)
      : undefined;
    if (parsingCondition) {
      this.pushConditions(parsingCondition);
    }
    if (hasFields && parsingCondition) {
      this.pushFieldsWithConditions({
        // tslint:disable-next-line: prefer-type-cast
        fields: fields as string[],
        conditions: parsingCondition,
      });
    } else if (!hasFields && parsingCondition) {
      this.pushFieldsWithConditions({
        fields: ['*'],
        conditions: parsingCondition,
      });
    } else if (hasFields && !parsingCondition) {
      this.pushFields(fields as Fields);
    }
  }

  public get() {
    return {
      action: this.action,
      resource: this.resource,
      allow: this.allow,
      message: this.message,
      conditions: this.conditions,
      fields: this.fields,
      meta: this.meta,
      filterData: this.filterData,
      validateData: this.validateData,
      filterDataIsRequired: this.filterDataIsRequired,
    };
  }
}
