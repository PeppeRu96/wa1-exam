import { useContext } from "react";
import { Form } from "react-bootstrap";

import SessionContext from "../../contexts/SessionContext";

import { MinimumSelectable, MaximumSelectable } from "./MinMaxControls";


function ClosedQuestionControls(props) {
    const question = props.question;
    const questionIndex = props.index;
    const answers = props.answers;
    const setAnswers = props.setAnswers;

    return (
        <Form.Group className="mb-3" controlId={`question-${question.id}`}>
            <Form.Label className="d-flex justify-content-left">
                {question.title}
                <MinimumSelectable min={question.min} type={question.type} />
                <MaximumSelectable max={question.max} />
            </Form.Label>
            {question.closedChoices.map((cc, index) => (
                <ClosedChoiceCheckbox key={cc.id} closedChoice={cc} question={question} questionIndex={questionIndex} index={index} answers={answers} setAnswers={setAnswers} />
            ))}
            <br />
        </Form.Group>
    );
}

function ClosedChoiceCheckbox(props) {
    const loggedAdmin = useContext(SessionContext);

    const cc = props.closedChoice;
    const question = props.question;
    const questionIndex = props.questionIndex;
    const index = props.index;
    const answers = props.answers;
    const setAnswers = props.setAnswers;
    let checked = false;

    const onChange = (ev) => {
        if (ev.target.checked) {
            const trueCount = answers[questionIndex].filter(a => a === true).length;
            if (trueCount + 1 > question.max)
                return;
        }
        setAnswers(ans => {
            const newAns = [...ans];
            newAns[questionIndex][index] = ev.target.checked;
            return newAns;
        })
    };

    if (answers && answers.length !== 0)
        checked = answers[questionIndex][index];

    return (
        <Form.Check
            className="d-flex justify-content-left"
            type="checkbox"
            label={cc.content}
            checked={checked}
            onChange={onChange}
            disabled={loggedAdmin !== undefined}
        />
    );
}

export default ClosedQuestionControls;