export const getPublishedDate = unixTime => {
  let diff = (new Date().getTime() / 1000 - unixTime) / 3600;

  if (diff < 0.1) {
    return 'Now';
  } else if (diff < 1) {
    return Math.floor(diff * 60) + 'm';
  } else if (Math.floor(diff) < 24) {
    return Math.floor(diff) + 'h';
  } else if (Math.floor(diff / 24) < 7) {
    return Math.floor(diff / 24) + 'd';
  } else {
    return Math.floor(diff / 24 / 7) + 'w';
  }
};

export const getOffsetByCursor = (items: number[], cursor?: number) =>
  items.findIndex(it => it === cursor) + 1;

export const extractDomain = (url = '') => {
  let domain = url.includes('//') ? url.split('//')[1] : url;
  domain = domain.includes('www.') ? domain.split('www')[1] : domain;
  return domain.split('/')[0];
};
