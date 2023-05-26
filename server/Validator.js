const { check } = require('express-validator'); // parameters validation middleware

exports.validatePostSurvey = () => {
    return [
        check('title').isLength({ min: 1 }),
        check('questions').custom((value) => {
            if (!value || !value.length || value.length < 1)
                throw new Error("The survey must contain at least one question.");

            for (let i = 0; i < value.length; i++) {
                const question = value[i];
                if (question.orderingPosition == undefined || question.orderingPosition < 1 || question.orderingPosition > value.length)
                    throw new Error(`The survey contains a question with invalid position.`);
                if (!question.title || !question.title.length || question.title.length < 1)
                    throw new Error(`The question ${question.orderingPosition} can't have an empty title!`);
                if (question.type == undefined || (question.type != 0 && question.type != 1))
                    throw new Error(`The question ${question.orderingPosition} has an invalid type.`);
                if (question.min == undefined || question.max == undefined)
                    throw new Error(`The question ${question.orderingPosition} has invalid constraints.`);
                if (question.min > question.max)
                    throw new Error(`The question ${question.orderingPosition} has a minimum required answers greater than the maximum allowed!`);
                if (question.max < 1)
                    throw new Error(`The question ${question.orderingPosition} has zero maximum allowed answers!`);
                if (question.type === 1) {
                    if (!question.closedChoices || !question.closedChoices.length || question.closedChoices.length < 1)
                        throw new Error(`The closed question ${question.orderingPosition} can't have zero options!`);
                    else {
                        for (const cc of question.closedChoices) {
                            if (!cc.content || cc.content.length < 1)
                                throw new Error(`The closed question ${question.orderingPosition} can't contain an emtpy option!`);
                        }
                    }
                }
            }
            return true;
        })
    ];
};

exports.validatePostSurveyReply = () => {
    return [
        check('survey.id').custom((value, { req }) => {
            if (value != req.params.surveyId)
                throw new Error("Survey id doesn't match with the answered survey.");

            return true;
        }),
        check('username').isLength({ min: 1 }),
        check('answers').custom((value, { req }) => {
            if (value.length !== req.body.survey.questions.length)
                throw new Error("Invalid number of answers provided");

            for (let i = 0; i < req.body.survey.questions.length; i++) {
                const question = req.body.survey.questions[i];
                const answer = value[i];
                if (question.type === 0 && question.min > 0 && (!answer || answer.length < 0))
                    throw new Error("A mandatory open question is empty.");
                if (question.type === 0 && answer && answer.length > 200)
                    throw new Error("An open question answer contains more than 200 characters.");
                if (question.type === 1) {
                    const selectedOptionsCount = answer.filter(a => a === true).length;
                    if (selectedOptionsCount < question.min)
                        throw new Error("A closed question doesn't have the minimum required selected options.");
                    if (selectedOptionsCount > question.max)
                        throw new Error("A closed question has too many selected options.");
                }
            }
            return true;
        })
    ];
};