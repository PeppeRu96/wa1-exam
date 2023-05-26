'use strict';
/* Data Access Object (DAO) module for accessing surveys */

const db = require('./db');
const errors = require('../error-handler').errors;
const DEBUG=1;

/**
 * Get the survey list from the database
 * @returns arrays of objects {id, title, admin_id}
 */
exports.listSurveys = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM survey';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

/**
 * Get the survey list beloning to an admin from the database
 * @param {*} adminId the identifier of the administrator that we want to get the surveys of
 * @returns array of objects {id, title, admin_id}
 */
 exports.listSurveysByAdmin = (adminId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM survey WHERE admin_id = ?';
        db.all(sql, [adminId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

/**
 * Get the survey replies list from the database
 * @param {*} surveyId the identifier of the survey we want to retrieve the replies of
 * @returns array of objects {id, survey_id, person_name}
 */
exports.listSurveyReplies = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM survey_reply WHERE survey_id = ?';
        db.all(sql, [surveyId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

/**
 * Get the survey main fields of a survey with the given id
 * @param {*} id the identifier of the survey to get
 * @returns an object {id, title, admin_id}
 */
exports.getSurveyFromId = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM survey WHERE id=?';
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined)
                reject(errors.SurveyNotFoundById);
            resolve(row);
        });
    });
};

/**
 * Get the questions belonging to the given survey
 * @param {*} surveyId the identifier of the survey that we want to get the questions of
 * @returns an array of objects {id, survey_id, title, type, min, max, ordering_position}
 */
exports.getQuestions = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM question WHERE survey_id=?';
        db.all(sql, [surveyId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

/**
 * Get all the closed choices options beloning to the given question
 * @param {*} questionId the identifier of the question that we want to get the closed choices of
 * @returns an array of objects {id, question_id, content}
 */
exports.getClosedChoices = (questionId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM closed_choice WHERE question_id=?';
        db.all(sql, [questionId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

/**
 * Add a new Survey along with associated questions
 * @param {*} title the title of the new survey to add
 * @param {*} questions an array of objects {title, type(0 or 1), min, max, orderingPosition}
 * @param {*} adminId the identifier of the admin that is adding the new survey
 */
exports.addSurvey = async (title, questions, adminId) => {
    let surveyId = 0;
    try {
        surveyId = await _addSurvey(title, adminId);
        for (const question of questions) {
            const questionId = await _addQuestion(surveyId, question);
            question.closedChoices = question.closedChoices.map((cc, idx) => {
                const newCC = {...cc};
                newCC.id = idx+1;
                return newCC;
            });
            for (const cc of question.closedChoices)
                await _addClosedChoice(questionId, cc);
        }
    } catch (err) {
        throw err;
    }
};

function _addSurvey(title, adminId) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO survey (id, title, admin_id) VALUES (NULL,?,?)';
        db.run(sql, [title, adminId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (DEBUG)
                console.log(`New survey added. Survey id: ${this.lastID}, Admin id: ${adminId}`);

            resolve(this.lastID);
        });
    });
}

function _addQuestion(surveyId, question) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO question (id, survey_id, title, type, min, max, ordering_position) VALUES (NULL,?,?,?,?,?,?)';
        db.run(sql, [surveyId, question.title, question.type, question.min, question.max, question.orderingPosition], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (DEBUG)
                console.log(`New question added. Survey id: ${surveyId}, Question id: ${this.lastID}`);

            resolve(this.lastID);
        });
    });
}

function _addClosedChoice(questionId, closedChoice) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO closed_choice (id, question_id, content) VALUES (?,?,?)';
        db.run(sql, [closedChoice.id, questionId, closedChoice.content], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (DEBUG)
                console.log(`New closed choice added. Question id: ${questionId}. CC id: ${closedChoice.id}. CC content: ${closedChoice.content}`);

            resolve(null);
        });
    });
}

/**
 * Add a new reply to a survey along with associated username and answers
 * @param {*} survey an object {id, title, adminId, questions}
 * @param {*} username the person name of the respondent user
 * @param {*} answers an array of:
 *                      - String : if the corresponding question is an open question
 *                      - Array of booleans: if the corresponding question is a closed question 
 */
exports.addSurveyReply = async (survey, username, answers) => {
    try {
        const lastSurveyReplyId = await _addSurveyReply(survey, username);
        await _addAnswers(lastSurveyReplyId, survey, answers);
    } catch (err) {
        throw err;
    }
};

function _addSurveyReply(survey, username) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO survey_reply (id, survey_id, person_name) VALUES (NULL,?,?)';
        db.run(sql, [survey.id, username], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (DEBUG)
                console.log(`New survey reply added. Survey id: ${survey.id}, Survey reply id: ${this.lastID}, Username: ${username}`);

            resolve(this.lastID);
        });
    });
}

async function _addAnswers(lastSurveyReplyId, survey, answers) {
    for (let i = 0; i < survey.questions.length; i++) {
        const question = survey.questions[i];
        const answer = answers[i];

        if (question.type === 0)
            try {
                await _addOpenAnswer(lastSurveyReplyId, question.id, answer);
            } catch (err) {
                if (DEBUG)
                    console.log(err);

                throw err;
            }
        else if (question.type === 1)
            try {
                await _addClosedAnswer(lastSurveyReplyId, question, answer);
            } catch (err) {
                if (DEBUG)
                    console.log(err);

                throw err;
            }
    }
}

function _addOpenAnswer(surveyReplyId, questionId, answer) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO open_answer (survey_reply_id, question_id, answer) VALUES (?,?,?)';
        db.run(sql, [surveyReplyId, questionId, answer], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (DEBUG)
                console.log(`New Open answer added. Survey reply id: ${surveyReplyId}, question id: ${questionId}, answer: ${answer}`);

            resolve(null);
        });
    });
}

async function _addClosedAnswer(surveyReplyId, question, answer) {
    for (let i = 0; i < question.closedChoices.length; i++) {
        const cc = question.closedChoices[i];
        const optionChecked = answer[i];
        try {
            await _addClosedChoiceAnswer(surveyReplyId, question.id, cc.id, optionChecked);
        } catch (err) {
            throw err;
        }
    }
}

function _addClosedChoiceAnswer(surveyReplyId, questionId, closedChoiceId, optionChecked) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO closed_answer (survey_reply_id, question_id, closed_choice_id, answer) VALUES (?,?,?,?)';
        db.run(sql, [surveyReplyId, questionId, closedChoiceId, optionChecked], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (DEBUG)
                console.log(`New Closed answer choice added. Survey reply id: ${surveyReplyId}, question id: ${questionId}, closed choice id: ${closedChoiceId}, answer: ${optionChecked}`);

            resolve(null);
        });
    });
}

/**
 * Get a complete reply to a survey along with all the answers
 * @param {*} replyId the identifier of the reply we want to get
 * @returns an object {
 *              id: the survey reply identifier,
 *              survey_id,
 *              person_name,
 *              openAnswers: an array of objects {survey_reply_id, question_id, answer}
 *              closedAnswers: an array of objects {survey_reply_id, question_id, closed_choice_id, answer(0 or 1)}
 * }
 */
exports.getSurveyReply = async (replyId) => {
    let surveyReplyWithAnswers = undefined;
    try {
        const surveyReply = await _getSurveyReply(replyId);
        surveyReplyWithAnswers = surveyReply;

        const openAnswers = await _getOpenAnswers(replyId);
        surveyReplyWithAnswers.openAnswers = openAnswers;

        const closedAnswers = await _getClosedAnswers(replyId);
        surveyReplyWithAnswers.closedAnswers = closedAnswers;
    } catch (err) {
        throw err;
    }

    return surveyReplyWithAnswers;
}

function _getSurveyReply(replyId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM survey_reply WHERE id = ?';
        db.get(sql, [replyId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined)
                reject(errors.SurveyReplyNotFoundById);
            resolve(row);
        });
    });
}

function _getOpenAnswers(replyId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM open_answer WHERE survey_reply_id = ?';
        db.all(sql, [replyId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

function _getClosedAnswers(replyId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM closed_answer WHERE survey_reply_id = ?';
        db.all(sql, [replyId], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}