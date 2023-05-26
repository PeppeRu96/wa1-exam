// React imports
import { useContext, useState } from "react";
import { Container, Form, Row, Col } from "react-bootstrap";
import { Redirect, useHistory  } from "react-router-dom";

// Contexts
import { Message, MessageContext } from "../../contexts/MessageContext";
import SessionContext from "../../contexts/SessionContext";

// Custom components
import MainTitle from "../MainTitle";
import QuestionFormControls from "./QuestionFormControls";
import ControlButtons from "./ControlButtons";

// Custom scripts
import { validateNewSurveyForm } from '../utility/Validator';
import API from "../../API";
import Question from "../../models/Question";

// Provides a complete form with a title for creating a new survey
// It's required to pass a boolean `sessionChecked` variable and a setDirty function for trigger the surveys referesh
function NewSurveyForm(props) {
    // Contexts
    const msgState = useContext(MessageContext);
    const loggedAdmin = useContext(SessionContext);

    // Properties renaming
    const sessionChecked = props.sessionChecked;
    const setDirty = props.setDirty;

    // States
    const [validated, setValidated] = useState(false);      // Just for toggling validation style on the form

    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([new Question(undefined, "", 0, 0, 1, 1)]);

    // Other hooks
    const history = useHistory();

    // Internal variables to use in JSX
    const pageTitle = "New survey";

    // -- Functions for handling the submit of the form -- //

    // Submits the survey to the server
    const submitSurvey = async () => {
        let errorObj = null;
        try {
            errorObj = await API.addSurvey(title, questions);
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
    };

    // Handles survey form submit
    const handleSubmit = async (event) => {
        const form = event.currentTarget;

        // We don't want to refresh the page
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === true) {
            window.scrollTo(0, 0);

            // Static client-side parameters validation
            const err = validateNewSurveyForm(title, questions);
            if (err === undefined) {
                msgState.setMsg(new Message("Submitting new survey", "Submitting the new survey... please wait", "info", false));
                msgState.setShow(true);

                // try to send to the server
                let submitSuccess = false;
                try {
                    await submitSurvey();
                    submitSuccess = true;
                } catch (ex) {
                    const errMsg = ex.message;
                    msgState.setMsg(new Message("Survey submitting failed", errMsg, "danger", true));
                    msgState.setShow(true);
                }

                if (submitSuccess) {
                    setDirty(true); // to force re-fetch of surveys
                    msgState.setMsg(new Message("Survey successfully submitted", "You have correctly submitted the survey. Thanks for your time.", "success", false));
                    setTimeout(() => {
                        resetAllFields();
                        msgState.setShow(false);
                        history.push("/surveys");
                    }, 2500);
                }
            } else {
                // client validation not passed
                msgState.setMsg(new Message("Invalid parameters", err, "danger", true));
                msgState.setShow(true);
            }
        }

        setValidated(true);
    };

    const newQuestion = () => {
        setQuestions(qs => {
            const nextOrdering = Math.max(...(qs.map(q => q.orderingPosition))) + 1;
            return [...qs, new Question(undefined, "", 0, 0, 1, nextOrdering)];
        });
        setTimeout(() => {
            var myContainer = document.getElementById('survey-container');
            myContainer.scrollTop = myContainer.scrollHeight;
        }, 200);
    }

    const resetAllFields = () => {
        setTitle('');
        setQuestions(qs => {
            const newQs = qs.map(q => {
                const newQ = { ...q };
                newQ.title = '';
                newQ.min = 0;
                newQ.max = newQ.type === 0 ? 1 : 0;
                newQ.closedChoices = [];
                return newQ;
            });
            return newQs;
        });
        setValidated(false);
    }

    const deleteAllQuestions = () => {
        setQuestions([new Question(undefined, "", 0, 0, 1, 1)]);
    }

    // If not logged-in, redirect to the home page
    if (!loggedAdmin) {
        if (sessionChecked)
            return (
                <Redirect to="/surveys" />
            );

        return (
            <p>Checking if you are logged in..</p>
        );
    }

    return (<>
        <MainTitle title={pageTitle} />
        <Form validated={validated} onSubmit={handleSubmit}>
            <Container id="survey-container">
                <SurveyTitleFormGroup title={title} setTitle={setTitle} />
                <QuestionFormControls questions={questions} setQuestions={setQuestions} />
            </Container>
            <Form.Group className="mb-3 mt-4" controlId="surveySubmit">
                <ControlButtons newQuestion={newQuestion} resetAllFields={resetAllFields} deleteAllQuestions={deleteAllQuestions} />
            </Form.Group>
        </Form>
    </>
    );
}

function SurveyTitleFormGroup(props) {
    const title = props.title;
    const setTitle = props.setTitle;

    return (
        <Form.Group as={Row} className="mb-3" controlId="formTitle">
            <Form.Label className="d-flex justify-content-left" column sm="4">
                <span className="label-big" ><b>Title</b></span>
            </Form.Label>

            <Col sm="8">
                <Form.Control type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="Insert a title for the survey.." required />
            </Col>
        </Form.Group>
    );
}

export default NewSurveyForm;