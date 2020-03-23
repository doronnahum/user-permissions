/**
 * Test filterData function
 */

import { fakeData } from './helpers/fakeData';
import { filterData } from '../src/utils/filterData';
import clone from 'clone';

const getFakeData = () => clone(fakeData);

describe('test filter data function', () => {
  it('Should by return a function', () => {
    expect(typeof filterData).toEqual('function');
  });
  it('Should by includes all fields', () => {
    const fakeData = getFakeData();
    const allKeys = Object.keys(fakeData[0]);
    expect(filterData(fakeData, allKeys, null)).toEqual(fakeData);
  });
  it('test negative field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(fakeData, ['-name', '-_id'], null);
    // tslint:disable-next-line: prefer-type-cast
    const data = (_filterData as { [key: string]: any }[])[0];
    expect(data.name).toEqual(undefined);
    expect(data._id).toEqual(undefined);
    expect(typeof data.isActive).toEqual('boolean');
  });
  it('test negative field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(fakeData, ['-name', '-_id', 'age'], null);
    // tslint:disable-next-line: prefer-type-cast
    const dataItem = (_filterData as { [key: string]: any }[])[0];
    expect(dataItem.name).toEqual(undefined);
    expect(dataItem._id).toEqual(undefined);
    expect(dataItem.isActive).toEqual(undefined);
  });
  it('test positive field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(fakeData, ['name', 'isActive'], null);
    // tslint:disable-next-line: prefer-type-cast
    const dataItem = (_filterData as { [key: string]: any }[])[0];
    expect(dataItem.name).not.toEqual(undefined);
    expect(dataItem.isActive).not.toEqual(undefined);
    expect(dataItem._id).toEqual(undefined);
  });
  it('test positive deep field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(fakeData, ['location.address'], null);
    // tslint:disable-next-line: prefer-type-cast
    const dataItem = (_filterData as { [key: string]: any }[])[0];
    expect(dataItem.name).toEqual(undefined);
    expect(dataItem.isActive).toEqual(undefined);
    expect(dataItem._id).toEqual(undefined);
    expect(dataItem.location.state).toEqual(undefined);
    expect(dataItem.location.address).not.toEqual(undefined);
  });
  it('test positive deep nested field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(
      fakeData,
      ['location.address', 'location'],
      null
    );
    // tslint:disable-next-line: prefer-type-cast
    const dataItem = (_filterData as { [key: string]: any }[])[0];
    expect(dataItem.location.state).not.toEqual(undefined);
    expect(dataItem.location.address).not.toEqual(undefined);
  });
  it('test positive deep nested field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(
      fakeData,
      ['location', 'location.address'],
      null
    );
    // tslint:disable-next-line: prefer-type-cast
    const dataItem = (_filterData as { [key: string]: any }[])[0];
    expect(dataItem.location.state).not.toEqual(undefined);
    expect(dataItem.location.address).not.toEqual(undefined);
  });
  it('test negative deep field', () => {
    const fakeData = getFakeData();
    const _filterData = filterData(fakeData, ['-location.address'], null);
    // tslint:disable-next-line: prefer-type-cast
    const dataItem = (_filterData as { [key: string]: any }[])[0];
    expect(dataItem.name).not.toEqual(undefined);
    expect(dataItem.isActive).not.toEqual(undefined);
    expect(dataItem._id).not.toEqual(undefined);
    expect(dataItem.location.state).not.toEqual(undefined);
    expect(dataItem.location.address).toEqual(undefined);
  });
});
