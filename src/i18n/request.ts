import { getRequestConfig } from 'next-intl/server';

const SUPPORTED_LOCALES = ['tr', 'en', 'ru', 'ar', 'hu'];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !SUPPORTED_LOCALES.includes(locale)) locale = 'tr';

  // Load messages with static branches so turbopack can bundle all possibilities
  let messages: Record<string, unknown>;
  if (locale === 'en') {
    messages = (await import('./../messages/en.json')).default as Record<string, unknown>;
  } else if (locale === 'ru') {
    messages = (await import('./../messages/ru.json')).default as Record<string, unknown>;
  } else if (locale === 'ar') {
    messages = (await import('./../messages/ar.json')).default as Record<string, unknown>;
  } else if (locale === 'hu') {
    messages = (await import('./../messages/hu.json')).default as Record<string, unknown>;
  } else {
    messages = (await import('./../messages/tr.json')).default as Record<string, unknown>;
  }

  return { locale, messages };
});
