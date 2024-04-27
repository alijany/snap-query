export function replaceUrlParam(url: string, params: any): string {
  return url.replace(/:\w+/g, (match) => {
    const param = match.slice(1); // remove the colon
    return params[param] || match; // replace with parameter value or keep original
  });
}
