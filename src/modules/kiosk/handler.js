'use strict';

const connectToDatabase = require('../../db');
const Kiosk = require('../../models/Kiosk');
const Question = require('../../models/Question');
const Response = require('../../models/Response');
const jwt = require('jsonwebtoken');

module.exports.provision = async (event, context) => {
  // Validate provision code and return JWT + active question
  context.callbackWaitsForEmptyEventLoop = false;
  let provisionCode;
  try {
    const body = JSON.parse(event.body);
    provisionCode = body.provisionCode;
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ message: 'Bad Request. Could not find a provisionCode.' }),
    };
  }

  return connectToDatabase()
    .then(() => findKioskByProvisionCode(provisionCode))
    .then(kiosk => resetKioskProvisionCode(kiosk))
    .then(kiosk => authorizeKiosk(kiosk))
    .then(response => ({
      statusCode: 200,
      body: JSON.stringify(response),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }));
};

module.exports.reset = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // add reset capability for admins
};

module.exports.ping = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // add ping endpoint for kiosks to update lastActive and receive question
};

module.exports.kiosk = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => findKioskById(event.requestContext.authorizer.principalId))
    .then(kiosk => ({
      statusCode: 200,
      body: JSON.stringify(kiosk),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }));
};

module.exports.response = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  // add ping endpoint for kiosks to update lastActive and receive question
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ message: 'Bad Request. Could not parse request body.' }),
    };
  }
  return connectToDatabase()
    .then(() => getQuestionInstance(body.question))
    .then(question => sendResponse(body, question))
    .then(response => ({
      statusCode: 200,
      body: JSON.stringify(response),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }));
};

function findKioskById(kioskId) {
  return Kiosk.findById(kioskId)
    .populate('question')
    .then(kiosk => (!kiosk ? Promise.reject('No kiosk found.') : kiosk))
    .catch(err => Promise.reject(new Error(err)));
}

function findKioskByProvisionCode(provisionCode) {
  return Kiosk.findOne({ provisionCode })
    .populate('question')
    .then(kiosk => (!kiosk ? Promise.reject('No kiosk found.') : kiosk))
    .catch(err => Promise.reject(new Error(err)));
}

function resetKioskProvisionCode(kiosk) {
  kiosk.provisionCode = '';
  return kiosk.save();
}

function authorizeKiosk(kiosk) {
  return {
    jwt: jwt.sign({ id: kiosk._id }, process.env.JWT_SECRET, {}),
    question: kiosk.question,
  };
}

function getQuestionInstance(questionId) {
  return Question.findById(questionId)
    .then(question => (!question ? Promise.reject('No question found.') : question))
    .catch(err => Promise.reject(new Error(err)));
}

function sendResponse(body, question) {
  const response = question.responses.id(body.response);
  return Response.create({
    kiosk: body.kiosk,
    question: body.question,
    response: response,
    comments: body.comments,
  })
    .then(response => (!response ? Promise.reject('No response found.') : response))
    .catch(err => Promise.reject(new Error(err)));
}
