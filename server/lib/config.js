/**
 * Centralised config — all process.env access goes through here.
 * Never use process.env.X directly in route/service files.
 */
const config = {
  port:    parseInt(process.env.PORT || '3001', 10),
  env:     process.env.NODE_ENV || 'development',

  apis: {
    // AIS
    marineTraffic: process.env.MARINETRAFFIC_API_KEY || null,
    aishub:        process.env.AISHUB_USERNAME        || null,
    vesselFinder:  process.env.VESSELFINDER_API_KEY   || null,

    // Fuel / Oil
    shipAndBunker: process.env.SHIPANDBUNKER_API_KEY  || null,
    oilPrice:      process.env.OILPRICE_API_KEY        || null,
    eia:           process.env.EIA_API_KEY             || null,

    // Freight indices
    baltic:        process.env.BALTIC_API_KEY          || null,
    freightos:     process.env.FREIGHTOS_API_KEY       || null,

    // Port / Canal
    seaIntelligence: process.env.SEA_INTELLIGENCE_API_KEY || null,
    portwatch:       process.env.PORTWATCH_BASE_URL || 'https://portwatch.imf.org/api',

    // Weather
    openWeather:   process.env.OPENWEATHER_API_KEY    || null,
    stormGeo:      process.env.STORMGEO_API_KEY        || null,

    // Risk
    gardAlert:     process.env.GARDALERT_API_KEY       || null,
    acled:         process.env.ACLED_API_KEY            || null,
    acledEmail:    process.env.ACLED_EMAIL              || null,

    // Misc
    exchangeRate:  process.env.EXCHANGERATE_API_KEY    || null,
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  },
};

/**
 * Returns true if the given API key is configured.
 * Used by services to decide: real API or mock fallback.
 */
config.isConfigured = (apiName) => !!config.apis[apiName];

module.exports = config;
