import {
  ValidateData,
  FieldsWithConditions,
  Config,
  Fields,
  Context,
  Conditions,
} from './types';

import {validateData} from './utils/validateData';
import {filterData} from './utils/filterData';
import { getNotAllowMessage } from './utils/utils';
import { parseConditions } from './utils/utils';
import { Allow } from 'Allow';

export class AbilitiesResponse {
  private action: string;
  private resource: string;
  private allow: boolean;
  private message?: null | string;
  private conditions?: null | object[];
  private validateData: ValidateData;
  private fields: {
    allowAll: boolean,
    allowed: null | string[],
    allowedByCondition: null | FieldsWithConditions[],
    getAll: () => string[]
  };

  private filterData: (data: object | object[]) => object | object[] | null;
  private filterDataIsRequired: boolean;
  private meta: null | any[];
  private getNotAllowMessage: (action: string, resource: string) => string; 
  private context?: Context;
  constructor(action: string, resource: string, config: Config, context?: Context){
    this.action = action;
    this.resource = resource;
    this.allow = false;
    this.filterDataIsRequired = false;
    this.meta = null;
    this.context = context;
    this.validateData = (data: object | object[]) => {
      if(this.allow){
        if(this.fields.allowAll){
          return { valid: true};
        }
        const mongooseWhere = this.conditions ? { $or: this.conditions } : undefined;
        return validateData(data, this.fields.allowed, this.fields.allowedByCondition, mongooseWhere)
      }
      return { valid: false, message: 'Not allowed to make this request' };
    };
    this.fields = {
      allowAll: false,
      allowed: null,
      allowedByCondition: null,
      getAll: () => {
        const fields: string[] = [];
        if(this.fields.allowed){
          fields.push(...this.fields.allowed)
        }
        if(this.fields.allowedByCondition){
          this.fields.allowedByCondition.forEach((item) => {
            fields.push(...item.fields)
          })
        }
        return fields;
      }
    };
    this.filterData = (data: object | object[]) => {
      if(this.fields.allowAll){
        return data;
      }
      return filterData(data, this.fields.allowed, this.fields.allowedByCondition) 
    }
    this.getNotAllowMessage = config && config.getMessage ? config.getMessage : getNotAllowMessage;
  }

  public isAllow () {
    return this.allow
  }
  public setAllow (value: boolean) {
    this.allow = value;
  }
  public setMessage (value: null | string) {
    this.message = value;
  }

  public pushConditions (value: object) {
    if(!this.conditions) this.conditions = [];
    this.filterDataIsRequired = true;
    this.conditions.push(value);
  }
  public pushMeta (value: any) {
    if(!this.meta) this.meta = [];
    this.meta.push(value);
  }
  public setAllowAllFields (value: boolean){
    this.fields.allowAll = value;
    if(value){
      this.fields.allowed = null;
      this.fields.allowedByCondition = null;
    }
  }
  public pushFieldsWithConditions (value: FieldsWithConditions){
    if(!this.fields.allowedByCondition) this.fields.allowedByCondition = [];
    this.fields.allowedByCondition.push(value);
  }
  public pushFields (value: Fields){
    if(!this.fields.allowed) this.fields.allowed = [];
    this.fields.allowed.push(...value);
  }

  public allowFullAccess(){
    this.setAllowAllFields(true);
    this.conditions = null;
  }
  public onUserNotAllow(){
    this.setAllowAllFields(true);
    this.conditions = null;
    this.setAllow(false);
    this.message = this.getNotAllowMessage(this.action,this.resource);
  }

  updateFieldsAndConditions (ability: Allow) {
    const hasFields = ability.hasFields();
    const hasConditions = ability.hasConditions();
    const fields = ability.getFields()
    const conditions = ability.getConditions();
    // tslint:disable-next-line: prefer-type-cast
    const parsingCondition = hasConditions ? parseConditions(<Conditions>conditions, this.context) : undefined;
    if (parsingCondition) {
      this.pushConditions(parsingCondition);
    }
    if (hasFields && parsingCondition) {
      this.pushFieldsWithConditions({
        // tslint:disable-next-line: prefer-type-cast
        fields: fields as string[],
        conditions: parsingCondition
      });
    } else if (!hasFields && parsingCondition) {
      this.pushFieldsWithConditions({
        fields: ['*'],
        conditions: parsingCondition
      });
    } else if (hasFields && !parsingCondition) {
      this.pushFields(<Fields>fields);
    }
  }

  public get(){
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
      filterDataIsRequired: this.filterDataIsRequired
    }
  }
}