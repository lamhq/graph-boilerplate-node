const AccessToken = require('./access-token.gql');
const Query = require('./query.gql');
const Date = require('./date.gql');
const User = require('./user.gql');

module.exports = [
  User,
  AccessToken,
  Date,
  Query,
];