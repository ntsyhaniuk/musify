export const parseHash = (urlString = ''): any => {
  const fragmentsList = urlString.split('&');
  return fragmentsList.reduce((res, el) => {
    const [key, value] = el.split('=');
    res[key] = value;
    return res;
  }, {});
};

export const createQueryString = (params = {}) => {
  if (!params) {
    return '';
  }
  const keys = Object.keys(params);
  if (!keys.length) {
    return '';
  }

  return keys.map(param => `${param}=${params[param]}`).join('&');
};

