import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Form, Row, Col, Container } from "react-bootstrap";

import { Message, MessageContext } from "../../contexts/MessageContext";
import SessionContext from "../../contexts/SessionContext";

// Custom components
import MainTitle from "../MainTitle";
import ControlButtons from "./ControlButtons";
import OpenQuestionControls from "./OpenQuestionControls";
import ClosedQuestionControls from "./ClosedQuestionControls";

import API from "../../API";
import Question from "../../models/Question";
import { validateSurveyForm } from "../utility/Validator";

/**
 * Important: if you type the url by hand, we allow to view and answer to the survey.
 * We allow to insert urls by hand also while logged in as admin to make easier the process.
 * This leverages the possibility to share links between users and directly access the survey.
 * Anyway, for a logged admin, the check if the admin can view the users answers is performed by the server.
 */
function SurveyForm(props) {
    // Contexts
    const msgState = useContext(MessageContext);
    const loggedAdmin = useContext(SessionContext);

    // Properties renaming
    const sessionChecked = props.sessionChecked;
    const surveyId = parseInt(props.surveyId);
    const replyId = parseInt(props.replyId);

    // States
    const [validated, setValidated] = useState(false);      // Just for toggling validation style on the form

    const [username, setUsername] = useState('');
    const [survey, setSurvey] = useState();
    const [answers, setAnswers] = useState([]);

    // Other hooks
    const history = useHistory();

    // -- Functions and effects for handling the submit of the form and the fetch -- //

    // Submits the survey reply to the server
    const submitSurveyReply = async () => {
        let errorObj = null;
        try {
            errorObj = await API.addSurveyReply(survey, username, answers);
        } catch (err) {
            throw err;
        }

        if (errorObj) {
            // Retrieve server error list and build a message
            const errors = errorObj.errors.map(e => `Invalid ${e.param} - ${e.msg}\n`);
            let message = "The server has refused the request.\n";
            errors.forEach(element => {
                message = message + element;
            });
            throw new Error(message);
        }
    }

    // Handles survey form submit
    const handleSubmit = async (event) => {
        const form = event.currentTarget;

        // We don't want to refresh the page
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === true) {
            window.scrollTo(0, 0);

            // Static client-side parameters validation
            const err = validateSurveyForm(username, survey, answers);
            if (err === undefined) {
                msgState.setMsg(new Message("Submitting survey reply", "Submitting survey reply... please wait", "info", false));
                msgState.setShow(true);

                // try to send to the server
                let submitSuccess = false;
                try {
                    await submitSurveyReply();
                    submitSuccess = true;
                } catch (ex) {
                    const errMsg = ex.message;
                    msgState.setMsg(new Message("Survey reply submitting failed", errMsg, "danger", true));
                    msgState.setShow(true);
                }

                if (submitSuccess) {
                    msgState.setMsg(new Message("Survey reply successfully submitted", "You have correctly submitted your survey reply. Thanks for your time.", "success", false));
                    setTimeout(() => {
                        resetAllFields();
                        msgState.setShow(false);
                        history.push("/surveys");
                    }, 2500);
                }
            } else {
                // client validation not passed
                msgState.setMsg(new Message("Invalid answers", err, "danger", true));
                msgState.setShow(true);
            }
        }

        setValidated(true);
    };

    // Fetch the surveys and, if logged-in, the answers for the reply with the replyId on the url (or the first reply if not provided)
    const getSurvey = async () => {
        let error = undefined;

        // If you are trying to visualize a response and you are not authenticated.. error
        if (!loggedAdmin && replyId)
            error = true;
        else {
            let fetchedSurvey = undefined;
            try {
                fetchedSurvey = await API.getSurveyWithQuestions(surveyId, loggedAdmin !== undefined);
            } catch (err) {
                error = true;
            }

            if (fetchedSurvey) {
                // Sort questions by orderingPosition field ascendently
                fetchedSurvey.questions = fetchedSurvey.questions.sort((a, b) => a.orderingPosition > b.orderingPosition);

                // Fetch answers (if logged-in) or initialize answers to empty/false (if logged-out)
                if (loggedAdmin) {
                    // If the reply id is not provided on the url, pick the first reply
                    let rId = replyId;
                    if (!rId && rId !== 0) {
                        if (fetchedSurvey.replyIds.length > 0)
                            rId = fetchedSurvey.replyIds[0];
                        else
                            rId = -1;
                    }

                    // Fetch answers of this reply
                    let surveyReplyWithAnswers = undefined;
                    try {
                        surveyReplyWithAnswers = await API.getSurveyReply(surveyId, rId);
                    } catch (ex) {
                        error = true;
                    }

                    if (surveyReplyWithAnswers) {
                        setUsername(surveyReplyWithAnswers.person_name);

                        // Build an array with retrieved answers (open and closed)
                        const answers = surveyReplyWithAnswers.openAnswers;
                        surveyReplyWithAnswers.closedAnswers.forEach(ca => answers.push(ca));

                        // Build a new question object to leave the original state untouched
                        const questions = fetchedSurvey.questions.map(q => Question.shallowCopy(q));

                        // For each answer, find the associated question and set the `answer` field
                        for (const a of answers) {
                            const qFinds = questions.filter(q => q.id === a.question_id);
                            if (qFinds.length < 1) {
                                error = true;
                                break;
                            }
                            const q = qFinds[0];
                            if (a.closed_choice_id === undefined)
                                q.answer = a.answer;
                            else {
                                if (q.answer === undefined)
                                    q.answer = [];

                                let ccIdx = q.indexOfClosedChoice(a.closed_choice_id);
                                q.answer.push({
                                    answer: a.answer ? true : false,
                                    qCCIndex: ccIdx
                                });
                            }
                        }
                        // Sort the closed choices answers to match the question.closedChoices (option <-> answer correct relation by index)
                        questions.forEach(q => {
                            if (Array.isArray(q.answer)) {
                                q.answer = q.answer.sort((a, b) => a.qCCIndex > b.qCCIndex).map(a => a.answer);
                            }
                        })

                        // Set the answers state array accordingly
                        setAnswers(questions.map(q => {
                            return q.answer;
                        }));
                        // What we achieve after that:
                        // We have an array of questions (open or closed)
                        // Each closed question contains a closedChoices array of ClosedChoice objects
                        // We have also an array of answers (answers[i] refers to questions[i]!)
                        // The closed answers elements (answers[i]) are arrays themselves containing true or false, so, after these operation we have:
                        // answers[i] refers to questions[i] and, for the closed question/answer pairs we also have:
                        // answers[i][j] refers to questions[i].closedChoices[j]
                        // It's worth noting that we are linking (question <-> answer) and (closed choice <-> answer) by indexes!
                    }

                } else {
                    // User mode: initialize the answers
                    setAnswers(fetchedSurvey.questions.map(q => {
                        if (q.type === 0)
                            return '';
                        else if (q.type === 1)
                            return q.closedChoices.map(cc => false);
                        else
                            return '';
                    }));
                }

                setSurvey(fetchedSurvey);
            }
        }

        if (error) {
            msgState.setMsg(new Message("Unable to find the survey", "The survey you've requested doesn't exist or there are some problems reaching the database.", "danger", false));
            msgState.setShow(true);
            setSurvey(undefined);
            setTimeout(() => {
                msgState.setShow(false)
                history.push("/surveys");
            }, 3000);
        }
    };

    // load the survey questions and (if logged-in) the answers 
    // we do it here because we want to load the questions only when we are trying to visualize them
    useEffect(() => {
        if (!sessionChecked)
            return;

        setSurvey(undefined);
        setAnswers([]);
        setUsername('');
        getSurvey();
    }, [replyId, sessionChecked])

    const resetAllFields = () => {
        setUsername('');
        setAnswers(survey.questions.map(q => {
            if (q.type === 0)
                return '';
            else if (q.type === 1)
                return q.closedChoices.map(cc => false);
            else
                return '';
        }));
        setValidated(false);
    };

    // Force the rendering of temporary components
    if (!survey)
        if (!msgState.show)
            return (<span>🕗 Loading survey.. 🕗</span>);
        else
            return (<></>)

    return (<>
        <MainTitle title={survey.title} />
        <Form validated={validated} onSubmit={handleSubmit}>
            <Container id="survey-container">
                <Form.Group as={Row} className="mb-3" controlId="formUser">
                    <Form.Label className="d-flex justify-content-left" column sm="4">
                        {loggedAdmin ? "Replier's name:" : "Enter your name"}
                    </Form.Label>
                    <Col sm="4">
                        <Form.Control type="text" value={username} onChange={ev => setUsername(ev.target.value)} placeholder="Your name.." required readOnly={loggedAdmin !== undefined} />
                    </Col>
                </Form.Group>
                {survey.questions.map((q, index) => {
                    if (q.type === 0)
                        return (<OpenQuestionControls question={q} index={index} key={q.id} answers={answers} setAnswers={setAnswers} />);
                    else
                        return (<ClosedQuestionControls question={q} index={index} key={q.id} answers={answers} setAnswers={setAnswers} />);
                })}
            </Container>
            <Form.Group className="mb-3 mt-4" controlId="surveySubmit">
                <ControlButtons resetAllFields={resetAllFields} surveyId={surveyId} replyId={replyId} survey={survey} />
            </Form.Group>
        </Form>
    </>);

}

export default SurveyForm;