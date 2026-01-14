module.exports = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ne'],
        localeDetection: false,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};
