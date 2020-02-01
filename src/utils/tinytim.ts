// copy from tinytim but using _defaultValue
// and not throw error when lookup is not found

const start = '{{';
const end = '}}';
const path = '[a-z0-9_$][\\.a-z0-9_]*'; // e.g. config.person.name
const pattern = new RegExp(start + '\\s*(' + path + ')\\s*' + end, 'gi');

export default function (
  template: string,
  data: object = {},
  _defaultValue: string = ''
) {
  // Merge data into the template string
  return template.replace(pattern, function (_tag, token): any {
    let path = token.split('.');
    let len = path.length;
    let lookup = data;
    let i = 0;

    for (; i < len; i++) {
      lookup = (lookup as any)[path[i]];

      // Property not found
      if (typeof lookup === 'undefined') {
        return undefined;
      }

      // Return the required value
      if (i === len - 1) {
        return lookup;
      }
    }
  });
}
