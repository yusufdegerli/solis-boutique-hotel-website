import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  if (!locale || !['tr', 'en', 'ru', 'ar', 'ro', 'hu'].includes(locale)) {
    locale = 'tr';
  }
 
  return {
    locale,
    messages: (await import(`./../messages/${locale}.json`)).default
  };
});
