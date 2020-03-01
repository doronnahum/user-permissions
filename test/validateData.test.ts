/**
 * Test validateData function
 */

import _fakeData from './utils/fakeData';
import { validateData } from '../src/utils/validateData';
import clone from 'clone';

const getFakeData = () => clone(_fakeData);

describe('test validate data function', () => {
  it('Should by return a function', () => {
    expect(typeof validateData).toEqual('function');
  });

  it('Should by true when all fields are allowed', () => {
    const fakeData = getFakeData();
    const allKeys = Object.keys(fakeData[0]);
    expect(validateData(fakeData, allKeys, null).valid).toEqual(true);
  });

  it('Should by false when not all fields are allowed', () => {
    const fakeData = getFakeData();
    const notAllKeys = Object.keys(fakeData[0]).filter(item => item === 'name');
    expect(validateData(fakeData, notAllKeys, null).valid).toEqual(false);
  });

  it('Test field with conditions', () => {
    const fakeData = getFakeData();
    const notAllKeys = Object.keys(fakeData[0]).filter(item => item !== 'name');
    const fieldsWithValidConditions = [{
      fields: ['name'],
      conditions: { name: { $in: fakeData.map(item => item.name) } }
    }];
    const fieldsWithUnValidConditions = [{
      fields: ['name'],
      conditions: { name: 'dd' }
    }];
    expect(validateData(fakeData, notAllKeys, fieldsWithValidConditions).valid).toEqual(true);
    expect(validateData(fakeData, notAllKeys, fieldsWithUnValidConditions).valid).toEqual(false);
  });
  it('test negative fields', () => {
    const fakeData = getFakeData();
    expect(validateData(fakeData, ['-someFields'], null).valid).toEqual(true);
    expect(validateData(fakeData, ['-name'], null).valid).toEqual(false);
  });
  it('Validate deep fields', () => {
    const fakeData = { location: getFakeData()[0].location };
    expect(validateData(fakeData, ['location.state', 'location.address'], null).valid).toEqual(true);
    expect(validateData(fakeData, ['location.state'], null).valid).toEqual(false);
    expect(validateData(fakeData, ['product.name'], null).valid).toEqual(false);
    expect(validateData(fakeData, ['product'], null).valid).toEqual(false);
  });
  it('test negative fields', () => {
    const fakeData = getFakeData();
    expect(validateData(fakeData, ['-someFields'], null).valid).toEqual(true);
    expect(validateData(fakeData, ['-name'], null).valid).toEqual(false);
  });

});