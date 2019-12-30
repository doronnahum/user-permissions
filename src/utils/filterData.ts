import { checkConditions } from './utils';
import { FieldsWithConditions } from '../types';
import pick from 'pick-deep';
import { deletePropertyPath } from './utils';

const splitFields = (allowedFields: string[]) => {
  const positiveFields: string[] = [];
  const negativeFields: string[] = [];
  allowedFields.forEach(field => {
    if (field.startsWith('-')) {
      negativeFields.push(field.substr(1));
    } else {
      positiveFields.push(field);
    }
  });
  return {
    positiveFields,
    negativeFields,
  };
};

const getAllowedFields = (
  data: {},
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
) => {
  const allowedFields = fields ? [...fields] : [];
  if (fieldsWithConditions) {
    fieldsWithConditions.forEach(item => {
      if (checkConditions(item.conditions, data)) {
        allowedFields.push(...item.fields);
      }
    });
  }
  return allowedFields;
};

const filterObject = (
  data: {},
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
) => {
  const allowedFields = getAllowedFields(data, fields, fieldsWithConditions);
  const { positiveFields, negativeFields } = splitFields(allowedFields);
  const filteredObj = pick(data, positiveFields);
  return negativeFields.forEach(field =>
    deletePropertyPath(filteredObj, field)
  );
};

export const filterData = (
  fields: null | string[],
  fieldsWithConditions: null | FieldsWithConditions[]
) => {
  return (data: {} | {}[]) => {
    const isArray = Array.isArray(data);
    if (isArray) {
      return (data as {}[]).map(item =>
        filterObject(item, fields, fieldsWithConditions)
      );
    }
    return filterObject(data, fields, fieldsWithConditions);
  };
};