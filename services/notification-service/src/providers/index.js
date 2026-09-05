const env = require('../config/env');
const consoleProvider = require('./consoleProvider');
const smtpProvider = require('./smtpProvider');

const PROVIDERS = {
  console: consoleProvider,
  smtp: smtpProvider,
};

function getProvider() {
  return PROVIDERS[env.notification.provider] || consoleProvider;
}

module.exports = { getProvider };
