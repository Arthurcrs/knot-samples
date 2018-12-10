const config = {};

config.meshbluDefault = {
  host: 'knot-test.cesar.org.br',
  port: '3000'
};

config.backendDefault = {
  host: 'http://localhost',
  port: '3002'
};

config.defaultFlags = {
  flagTime: 30,
  flagChange: true
};

module.exports = config;
