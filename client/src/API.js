import ClosedChoice from './models/ClosedChoice';
import Question from './models/Question';
import Survey from './models/Survey';

const BASEURL = '/api';

// SURVEY APIs

/**
 * 
 * @param {*} loggedIn indicates if we are logged in from the point of view of the client,
 *                      in this way, we can expect a meaningful response format coming from the server
 * @returns an array of Survey objects coherently populated (each object has two extra fields (countReplies and replyIds)
 *                                                           if you are logged-in)
 */
async function getAllSurveys(loggedIn) {
  // call: GET /api/surveys
  let response = undefined;
  let objectJson = undefined;
  try {
    response = await fetch(BASEURL + '/surveys');
    objectJson = await response.json();
  } catch (err) {
    throw new Error("Cannot communicate with the server");
  }

  if (response.ok) {
    if (loggedIn) {
      const surveysJson = objectJson.surveys;
      const surveys = surveysJson.map((s) => Survey.from(s));
      const allSurveyRepliesJson = objectJson.allSurveyReplies;
      // For each survey reply, assign the countReplies and replyIds fields to the correspective survey object
      allSurveyRepliesJson.forEach(sr => {
        // Find the correspective survey
        const sFinds = surveys.filter(s => s.id === sr.surveyId);
        if (sFinds.length > 0) {
          const survey = sFinds[0];
          survey.countReplies = sr.count;
          survey.replyIds = sr.replyIds;
        }
      });
      return surveys;
    } else
      return objectJson.map((s) => Survey.from(s));
  } else {
    throw objectJson;  // an object with the error coming from the server
  }
}

/**
 * 
 * @param {*} surveyId the id of the survey you want to fetch
 * @param {*} loggedIn indicates if we are logged in from the point of view of the client
 * @returns a Survey object with a `questions` field populated with Question objects 
 *          plus (for logged-in admin only) a countReplies and replyIds additional fields
 */
async function getSurveyWithQuestions(surveyId, loggedIn) {
  // call: GET /api/surveys/surveyId
  let response = undefined;
  let surveyJson = undefined;
  try {
    response = await fetch(BASEURL + `/surveys/${surveyId}`);
    surveyJson = await response.json();
  } catch (err) {
    throw new Error("Cannot communicate with the server");
  }

  if (response.ok) {
    let survey = undefined;

    // Create Survey object
    // If we are logged-in, the response object from the server contains also a count (for countReplies) and the replyIds
    if (loggedIn) {
      const surveyWithReplies = surveyJson.survey;
      survey = Survey.from(surveyWithReplies.survey);
      const surveyReplies = surveyWithReplies.surveyReplies;
      survey.countReplies = surveyReplies.count;
      survey.replyIds = surveyReplies.replyIds;
    } else {
      survey = Survey.from(surveyJson.survey);
    }

    // Create Question objects
    const questions = surveyJson.questions.map(q => Question.from(q));
    // put the questions inside the survey
    questions.forEach(q => survey.addQuestion(q));

    // Create ClosedChoice objects and put them in the correct question
    if (surveyJson.allClosedChoices.length !== 0) {
      // surveyJson.allClosedChoices contains all the closed choices for all the questions (array of array)
      for (const ccOfQuestion of surveyJson.allClosedChoices) {
        // ccOfQuestion contains all closed choices of a particular question
        // Find the correct question..
        if (ccOfQuestion.length === 0)
          continue;
        const relatedQuestion = questions.filter(q => q.id === ccOfQuestion[0].question_id)[0];
        // Create closed choices for this question
        const closedChoices = ccOfQuestion.map(cc => ClosedChoice.from(cc));
        // Put them in the question
        closedChoices.forEach(cc => relatedQuestion.addClosedChoice(cc));
      }
    }
    return survey;
  } else {
    throw surveyJson;
  }
}

/**
 * 
 * @param {*} surveyId the surveyId which the reply is referring to
 * @param {*} replyId the replyId of the reply the fetch
 * @returns an object containing three fields:
 *                - person_name   : the name of the respondent user
 *                - openAnswers   : an array of strings (the answers)
 *                - closedAnswers : an array of objects { closed_choice_id, answer(true or false) }
 */
 async function getSurveyReply(surveyId, replyId) {
  // call: GET /api/surveys/:surveyId/survey-replies/:replyId
  let response = undefined;
  try {
    response = await fetch(BASEURL + `/surveys/${surveyId}/survey-replies/${replyId}`);
  } catch (err) {
    throw new Error("Cannot communicate with the server");
  }

  let surveyJson = undefined;
  try {
    surveyJson = await response.json();
  } catch (err) {
    throw new Error("Cannot communicate with the server");
  }

  if (response.ok)
    return surveyJson;
  
  throw surveyJson;
}

/**
 * 
 * @param {*} title the title of the new survey
 * @param {*} questions an array of Question objects associated with the new Survey
 * @returns null if the new survey has been added correctly
 * @throws an Error object containing the problem occured
 */
async function addSurvey(title, questions) {
  // call: POST /api/surveys
  let response = undefined;
  try {
    response = await fetch(BASEURL + `/surveys`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, questions: questions })
      });
  } catch (err) {
    throw new Error("Cannot communicate with the server.");
  }
  if (response.ok)
    return null;

  // Error retrieving
  let errorObj = undefined;
  try {
    errorObj = await response.json();
  } catch (err) {
    throw new Error("Cannot communicate with the server.");
  }
  return errorObj;
}

/**
 * 
 * @param {*} survey the Survey object containing the title and the questions
 * @param {*} username the username of the respondent person
 * @param {*} answers an array of:
 *                            -Strings (open answer) or
 *                            -Arrays (closed answer) of booleans
 * @returns null if the new survey has been added correctly
 * @throws an Error object containing the problem occured
 */
async function addSurveyReply(survey, username, answers) {
  // call: POST /api/surveys/:surveyId/survey-replies
  let response = undefined;
  try {
    response = await fetch(BASEURL + `/surveys/${survey.id}/survey-replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ survey: survey, username: username, answers: answers })
    })
  } catch (err) {
    throw new Error("Cannot communicate with the server.");
  }

  if (response.ok)
    return null;

  // analyze the cause of error
  let errorObj = undefined;
  try {
    errorObj = await response.json();
  } catch (err) {
    throw new Error("Cannot communicate with the server.");
  }
  return errorObj;
}


// LOGIN ADMIN API
/**
 * 
 * @param {*} username 
 * @param {*} password 
 * @returns an object {id, username} of the newly logged-in admin
 * @throws an error coming from the server
 */
async function logIn(username, password) {
  let response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password
    }),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch (err) {
      throw err;
    }
  }
}

async function logOut() {
  await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getAdminInfo() {
  const response = await fetch(BASEURL + '/sessions/current');
  const adminInfo = await response.json();
  if (response.ok) {
    return adminInfo;
  } else {
    throw adminInfo;  // an object with the error coming from the server
  }
}

const API = { getAllSurveys, getSurveyWithQuestions, addSurveyReply, logIn, logOut, getAdminInfo, getSurveyReply, addSurvey };
export default API;