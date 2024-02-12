import { template } from 'lodash-es';

export function replaceUrlParam(key: string, value?: object) {
  const templateString = key.replace(/:(\w+)/g, '${$1}');
  const compile = template(templateString);

  return compile(value);
}
