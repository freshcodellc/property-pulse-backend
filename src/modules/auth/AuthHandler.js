const connectToDatabase = require('../../db');
const Kiosk = require('../../models/Kiosk');
const Company = require('../../models/Company');
const Question = require('../../models/Question');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs-then');

/*
 * Functions
 */

module.exports.login = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => login(JSON.parse(event.body)))
    .then(session => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(session),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }));
};

module.exports.register = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => register(JSON.parse(event.body)))
    .then(session => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(session),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: err.message,
    }));
};

module.exports.me = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => me(event.requestContext.authorizer.principalId))
    .then(session => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(session),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }));
};

/**
 * Helpers
 */

function signToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: 86400, // expires in 24 hours
  });
}

function checkIfInputIsValid(eventBody) {
  if (!(eventBody.password && eventBody.password.length >= 7)) {
    return Promise.reject(
      new Error('Password error. Password needs to be longer than 8 characters.')
    );
  }

  if (!(eventBody.name && eventBody.name.length > 5 && typeof eventBody.name === 'string'))
    return Promise.reject(new Error('Username error. Username needs to longer than 5 characters'));

  if (!(eventBody.email && typeof eventBody.name === 'string'))
    return Promise.reject(new Error('Email error. Email must have valid characters.'));

  return Promise.resolve();
}

function register(eventBody) {
  return checkIfInputIsValid(eventBody) // validate input
    .then(
      () => User.findOne({ email: eventBody.email }) // check if user exists
    )
    .then(
      user =>
        user
          ? Promise.reject(new Error('User with that email exists.'))
          : bcrypt.hash(eventBody.password, 8) // hash the pass
    )
    .then(
      hash => User.create({ name: eventBody.name, email: eventBody.email, password: hash }) // create the new user
    )
    .then(user => ({ auth: true, token: signToken(user._id), user })); // sign the token and send it back
}

function login(eventBody) {
  return User.findOne({ email: eventBody.email })
    .then(user =>
      !user
        ? Promise.reject(new Error('User with that email does not exits.'))
        : comparePassword(eventBody.password, user.password, user)
    )
    .then(({ token, user }) => ({ auth: true, token, user }));
}

function comparePassword(eventPassword, userPassword, user) {
  return bcrypt
    .compare(eventPassword, userPassword)
    .then(passwordIsValid =>
      !passwordIsValid
        ? Promise.reject(new Error('The credentials do not match.'))
        : { token: signToken(user._id), user }
    );
}

// TODO: Refactor so kiosks are not users
async function me(userId) {
  return User.findById(userId, { password: 0 })
    .populate('company')
    .then(user =>
      !user ? Promise.reject('No user found.') : { token: signToken(user._id), user }
    )
    .catch(err => Promise.reject(new Error(err)));
}
