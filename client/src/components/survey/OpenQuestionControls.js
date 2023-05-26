import { useContext } from "react";
import { Form, Row, Col } from "react-bootstrap";

import SessionContext from "../../contexts/SessionContext";

import { MinimumSelectable } from "./MinMaxControls";

function OpenQuestionControls(props) {
    const loggedAdmin = useContext(SessionContext);
    const question = props.question;
    const index = props.index;
    const answers = props.answers;
    const setAnswers = props.setAnswers;

    const placeHolder = loggedAdmin ? '' : 'Type your answer..';

    return (
        <Form.Group as={Row} className="mb-3" controlId={`question-${question.id}`}>
            <Form.Label className="d-flex justify-content-left" column sm="12">
                {question.title}
                <MinimumSelectable min={question.min} type={question.type} />
            </Form.Label>
            <Col sm="10">
                <Form.Control
                    as="textarea"
                    rows={3}
                    maxlength={200}
                    value={answers[index]}
                    onChange={ev => setAnswers(ans => {
                        const newAns = [...ans];
                        newAns[index] = ev.target.value;
                        return newAns;
                    })}
                    readOnly={loggedAdmin !== undefined}
                    placeholder={placeHolder}
                    required={question.min === 1}
                />
            </Col>
        </Form.Group>
    );
}

export default OpenQuestionControls;