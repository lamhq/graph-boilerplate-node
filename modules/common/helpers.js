const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const ms = require('ms');
const mongoose = require('mongoose');
const config = require('../../config');
const validate = require('validate.js');
const querystring = require('querystring');
const logger = require('./log');

function notFoundExc(message, options = {}) {
  return {
    status: 404,
    code: 'resource_not_found',
    message,
    ...options,
  };
}

function validationExc(message, errors, code = null) {
  return {
    status: 400,
    code: code || 'invalid_data',
    message,
    errors,
  };
}

function unauthorizedExc(message) {
  return {
    status: 401,
    code: 'unauthorized',
    message,
  };
}

/**
 * @returns Promise
 */
function connectToDb() {
  mongoose.set('debug', config.db.debug);
  mongoose.Promise = global.Promise;
  const options = {
    config: { autoIndex: false },
    useNewUrlParser: true,
  };
  return mongoose.connect(config.db.uri, options);
}

function encryptPassword(value) {
  return bcrypt.hashSync(value);
}

function verifyPassword(value, hash) {
  return bcrypt.compareSync(value, hash);
}

/**
 * Create an access token for user
 * @param {Object} user
 * @param {String} duration
 */
function createToken(user, duration) {
  const expireAt = new Date();
  expireAt.setSeconds(expireAt.getSeconds() + (ms(duration) / 1000));
  const value = jwt.sign({ userId: user._id }, config.appSecret, { expiresIn: duration });
  return {
    value,
    expireAt,
  };
}

function verifyToken(token) {
  let result = false;
  try {
    result = jwt.verify(token, config.appSecret);
  } catch (err) {
    logger.info('Validate access token failed.');
  }
  return result;
}

/**
 * Get value of nested property by path
 *
 * @param {Mixed} obj
 * @param {String} path
 * @param {Mixed} defVal default value when the result is undefined
 */
function getObjectValue(obj, path, defVal = undefined) {
  const result = validate.getDeepObjectValue(obj, path);
  return result || defVal;
}

function filterObjectKeys(obj, allowedKeys = []) {
  const result = {};
  allowedKeys.forEach((key) => {
    if (obj[key]) {
      result[key] = obj[key];
    }
  });
  return result;
}

function createWebUrl(path, params = null) {
  const q = params ? `?${querystring.stringify(params)}` : '';
  return `${config.webUrl}/${path}${q}`;
}

function round(number, precision) {
  return parseFloat(number).toFixed(precision);
}


function buildQuery(obj) {
  return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
}

module.exports = {
  notFoundExc,
  validationExc,
  unauthorizedExc,
  connectToDb,
  encryptPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getObjectValue,
  filterObjectKeys,
  createWebUrl,
  round,
  buildQuery,
};
