'use strict';

const connectToDatabase = require('../../db');
const Question = require('../../models/Question');

module.exports.getQuestion = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return connectToDatabase()
    .then(() => console.log('E', event))
    .then(session => ({
      statusCode: 200,
      body: JSON.stringify(session),
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ stack: err.stack, message: err.message }),
    }));
};

function findQuestion(questionId) {
  return Question.findById(questionId)
    .then(question => (!question ? Promise.reject('No question found.') : question))
    .catch(err => Promise.reject(new Error(err)));
}
