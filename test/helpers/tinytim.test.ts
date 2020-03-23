import tinytim from '../../src/utils/tinytim';

let stringify: any;
let obj: any;
describe('Test tinytime', () => {
  beforeAll(() => {
    stringify = tinytim(template, data);
    obj = JSON.parse(stringify);
  });
  const template =
    '{"name": "{{ name }}", "city": "{{ location.city }}", "age": "{{ age }}"}';
  const data = { name: 'Dan', location: { city: 'Ny' } };

  it('Res string from tinytim', () => {
    expect(typeof stringify).toEqual('string');
  });
  it('convert string to object with JSON parse', () => {
    expect(typeof obj).toEqual('object');
  });
  it('replace placeholder with data', () => {
    expect(obj.name).toEqual(data.name);
    expect(obj.city).toEqual(data.location.city);
  });
});
