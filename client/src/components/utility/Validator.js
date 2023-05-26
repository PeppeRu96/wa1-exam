
/**
 * 
 * @param {*} title the title of the survey
 * @param {*} questions an array of `Question` objects
 * @returns undefined if the validation is passed, an error message otherwise
 */
export function validateNewSurveyForm(title, questions) {
    let err = undefined;

    if (!title || title.length < 1)
        err = "The survey's title can't be empty!";
    else if (!questions || !questions.length || questions.length < 1)
        err = "The survey must contain at least one question."
    else {
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (question.orderingPosition === undefined || question.orderingPosition < 1 || question.orderingPosition > questions.length)
                err = `The survey contains a question with invalid position. Please reload the page.`;
            if (!question.title || question.title.length < 1)
                err = `The question ${question.orderingPosition} can't have an empty title!`;
            else if (question.type === undefined || (question.type !== 0 && question.type !== 1))
                err = `The question ${question.orderingPosition} has an invalid type. Please reload the page.`;
            else if (question.min === undefined || question.max === undefined)
                err = `The question ${question.orderingPosition} has invalid constraints. Please reload the page.`;
            else if (question.min > question.max)
                err = `The question ${question.orderingPosition} has a minimum required answers greater than the maximum allowed!`;
            else if (question.max < 1)
                err = `The question ${question.orderingPosition} has zero maximum allowed answers!`;
            else if (question.type === 1) {
                if (!question.closedChoices || question.closedChoices.length < 1)
                    err = `The closed question ${question.orderingPosition} can't have zero options!`;
                else {
                    for (const cc of question.closedChoices) {
                        if (!cc.content || cc.content.length < 1)
                            err = `The closed question ${question.orderingPosition} can't contain an emtpy option!`;
                    }
                }
            }
            if (err)
                break;
        }
    }

    return err;
}

/**
 * 
 * @param {*} username of the person who is responding to the survey
 * @param {*} survey the survey object
 * @param {*} answers the answers array
 * @returns undefined if the validation is passed, an error message otherwise
 */
export function validateSurveyForm(username, survey, answers) {
    let err = undefined;
    if (!username || username.length < 1)
        err = "Your name can not be empty.";
    else {
        for (let i = 0; i < survey.questions.length; i++) {
            const question = survey.questions[i];
            const answer = answers[i];
            if (question.type === 0) {
                if (question.min > 0 && (!answer || answer.length < 1))
                    err = "Some mandatory open questions are not filled.";
                if (answer && answer.length > 200)
                    err = "Some open questions contain more than 200 characters.";
            } else {
                const selectedOptionsCount = answer.filter(a => a === true).length;
                if (selectedOptionsCount < question.min)
                    err = "You haven't selected at least the required minimum options for some closed questions.";
                else if (selectedOptionsCount > question.max)
                    err = "You have selected too much options for some closed questions.";
            }
            if (err)
                break;
        }
    }
    return err;
}