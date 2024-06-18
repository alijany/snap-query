export function replaceUrlParam(url: string, params: any): string {
  return url.replace(/:\w+/g, (match) => {
    const param = match.slice(1); // remove the colon
    return params[param] || match; // replace with parameter value or keep original
  });
}


export const wrapPromise = <T>(promise: Promise<T>) => {
  let status = "pending";
  let result: T;
  let suspend = promise.then(
    (res) => {
      status = "success";
      result = res;
    },
    (err) => {
      status = "error";
      result = err;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspend;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
};