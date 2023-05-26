'use strict';

// Node modules importing
// Thirdy-party modules
const express = require('express');
const session = require('express-session'); // enable sessions
const { validationResult } = require('express-validator'); // parameters validation middleware

const morgan = require('morgan'); // console logging middleware

const passport = require('passport'); // authentication middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login

// Data-access internal modules
const adminDao = require('./data/admin-dao');
const surveyDao = require('./data/survey-dao');
const validator = require('./Validator');

// Configuration of the imported modules

// Passport configuration
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    adminDao.loginAdmin(username, password)
      .then(admin => {
        return done(null, admin);
      })
      .catch(err => {
        // TODO check what is done with message
        return done(null, false, { message: err.toString() });
      });
  }
));

// serialize and de-serialize the admin (admin object <-> session)
// we serialize the admin id and we store it in the session: the session is very small in this way
passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  adminDao.getAdminById(id)
    .then(admin => {
      done(null, admin); // this will be available in req.user
    }).
    catch(err => {
      done(err, null);
    });
});

// Express application configuration

// init express
const app = express();
const port = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

const sessionSettings = {
  secret: "Tm7_H@pGu&JCD-yF9Mw^@@EYX@*^Sa-uMZNLGtfyfqBqjSF7CmKWCq8ZBdE+%$nz8ZK#&EBVzT=quKBt3HFYByAAr^Fw7$g_#GwwvZ48PpJjk=bhDpsDDbP#cNrXFQE4E_pR@D^q&@-VjcDpK_EzfTC3Jyc-$-4EmqgV_Ve52aR^=zt5h=pMNR4brAM7Bu8!DeWFdH*bt2_tZ92JZ!M5&jPffpbMyPK#3!$F^=f_7h*K?KNH4&*JPEBnZy#2^2Lg",
  resave: false,
  saveUninitialized: false,
  name: 'survey-session'
};

// set up the session
app.use(session(sessionSettings));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

// custom middleware: check if a given request is coming from an authenticated admin
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'not authenticated' });
}

// APIs
// --------- Survey APIs --------- //

// Given a survey, it gets all the replies ids and the count of replies
async function getSurveyRepliesIndexes(survey) {
  let replies = undefined;
  try {
    replies = await surveyDao.listSurveyReplies(survey.id);
  } catch (err) {
    throw err;
  }
  const count = replies.length;
  replies = replies.map(r => r.id);
  const surveyReplies = {
    surveyId: survey.id,
    count: count,
    replyIds: replies
  };
  return surveyReplies;
}

// It simply returns an object with the survey, the replies ids and the count of replies
async function getSurveyWithRepliesIndexes(survey) {
  const surveyReplies = await getSurveyRepliesIndexes(survey);
  const surveyWithReplies = {
    survey: survey,
    surveyReplies: surveyReplies
  };
  return surveyWithReplies;
}

// It gets all the surveys with all replies ids and respective counts of replies
async function getAllSurveysWithRepliesIndexes(surveys) {
  const allSurveyReplies = [];
  for (const survey of surveys) {
    const surveyReplies = await getSurveyRepliesIndexes(survey);
    allSurveyReplies.push(surveyReplies);
  }
  const surveysWithReplies = {
    surveys: surveys,
    allSurveyReplies: allSurveyReplies
  };
  return surveysWithReplies;
}

/**
 * GET /api/surveys
 * send back to the client a json in the response body containing an object
 * if authenticated
 * {
 *  surveys: an array of objects {id, title, admin_id},
 *  allSurveyReplies: an array of objects {surveyId, count: the count of replies, replyIds: an array with the reply identifiers}
 * }
 * 
 * if not authenticated, an array of objects {id, title, admin_id}
 */
app.get('/api/surveys', (req, res) => {
  // If the admin is authenticated, we provide only the surveys that belong to him..
  if (req.isAuthenticated()) {
    surveyDao.listSurveysByAdmin(req.user.id)
      .then(surveys => getAllSurveysWithRepliesIndexes(surveys))
      .then(surveysWithReplies => res.json(surveysWithReplies))
      .catch(() => res.status(500).end());
  } else {
    surveyDao.listSurveys()
      .then(surveys => res.json(surveys))
      .catch(() => res.status(500).end());
  }
});

/**
 * GET /api/surveys/:surveyId
 * send back to the client a json in the response body containing an object:
 * if authenticated:
 * {
 *  survey: {
 *            survey: {id, title, admin_id}
 *            surveyReplies: {survey_id, count, replyIds}
 *          },
 *  questions: array of objects {id, survey_id, title, type, min, max, ordering_position},
 *  allClosedChoices: an array of objects {id, question_id, content} of all the closed questions in the survey
 * }
 * 
 * if not authenticated:
 * {
 *  survey: {id, title, admin_id},
 *  questions: array of objects {id, survey_id, title, type, min, max, ordering_position},
 *  allClosedChoices: an array of objects {id, question_id, content} of all the closed questions in the survey
 * }
 * 
 * Checks:
 *  - if the client is authenticated and the logged-in admin is not the owner of the requested survey
 *    the response will be an error containing a meaningful message
 */
app.get('/api/surveys/:surveyId', async (req, res) => {
  try {
    let survey = await surveyDao.getSurveyFromId(req.params.surveyId);
    if (req.isAuthenticated() && req.user.id !== survey.admin_id)
      throw new Error("Cannot retrieve a survey that doesn't belong to the logged-in admin.");

    const surveyId = survey.id;
    if (req.isAuthenticated())
      survey = await getSurveyWithRepliesIndexes(survey);

    const questions = await surveyDao.getQuestions(surveyId);
    const allClosedChoices = [];
    for (const q of questions) {
      const closedChoices = await surveyDao.getClosedChoices(q.id);
      allClosedChoices.push(closedChoices);
    }

    const surveyWithQuestions = {
      survey: survey,
      questions: questions,
      allClosedChoices: allClosedChoices
    };

    res.json(surveyWithQuestions);
  } catch (err) {
    res.status(500).end();
  }
});

/**
 * GET /api/surveys/:surveyId/survey-replies/:replyId
 * send back to the client a json in the response body containing an object:
 * {
 *  id: the survey reply identifier,
 *  survey_id,
 *  person_name,
 *  openAnswers: an array of objects {survey_reply_id, question_id, answer}
 *  closedAnswers: an array of objects {survey_reply_id, question_id, closed_choice_id, answer(0 or 1)}
 * }
 * 
 * Checks:
 *  - the client must be authenticated
 *  - check if the authenticated admin is the owner of the survey
 *  - check if the provided reply id identifies a reply of a survey with the correct provided survey id
 */
app.get('/api/surveys/:surveyId/survey-replies/:replyId', isLoggedIn, async (req, res) => {
  try {
    let survey = await surveyDao.getSurveyFromId(req.params.surveyId);
    if (req.user.id !== survey.admin_id)
      throw new Error("Cannot retrieve a survey that doesn't belong to the logged-in admin.");

    const surveyReplyWithAnswers = await surveyDao.getSurveyReply(req.params.replyId);
    if (surveyReplyWithAnswers.survey_id !== survey.id)
      throw new Error("You inserted an invalid reply id for the selected survey!");

    res.json(surveyReplyWithAnswers);
  } catch (err) {
    res.status(500).end();
  }
});

/**
 * POST /api/surveys
 * the client must provide in the body of the POST request a json object:
 * {
 *  title: the title of the new survey
 *  questions: an array of objects {title, type(0 or 1), min, max, orderingPosition}
 * }
 * 
 * the response body will be empty with header status 201 for success or a json object { error } with header status 503
 * Checks: client is authenticated and static validation checks are performed
 */
 app.post('/api/surveys', [isLoggedIn, ...validator.validatePostSurvey()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const title = req.body.title;
  const questions = req.body.questions;

  try {
    await surveyDao.addSurvey(title, questions, req.user.id);
    res.status(201).end();
  } catch (err) {
    res.status(503).json({ message: err });
  }
});

/**
 * POST /api/surveys/:surveyId/survey-replies
 * the client must provide in the body of the POST request a json object:
 * {
 *  survey: {id, title, adminId, questions},
 *  username,
 *  answers: an array of strings (for open answers) or of arrays of booleans (for closed answers)
 * }
 * 
 * the response body will be empty with header status 201 for success or a json object { error } with header status 503
 * Checks: static validation checks are performed
 */
app.post('/api/surveys/:surveyId/survey-replies', validator.validatePostSurveyReply(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const survey = req.body.survey;
    const username = req.body.username;
    const answers = req.body.answers;

    try {
      await surveyDao.addSurveyReply(survey, username, answers);
      res.status(201).end();
    } catch (err) {
      res.status(503).json({ message: err });
    }
  });


// --------- Admin authentication APIs --------- //

/**
 * POST /api/sessions
 * Login
 * the client must provide in the body of the POST request a json object:
 * {
 *  username,
 *  password
 * }
 * 
 * the response body will be a json object:
 * {
 *  id: the identifier of the authenticated admin,
 *  username: the username of the authenticated admin
 * }
 * or will be, in case of error, a json object:
 * {
 *  message: the cause of the failed login
 * }
 */
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});


// DELETE /api/sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /api/sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', isLoggedIn, (req, res) => {
  res.status(200).json(req.user);
});



// Activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});