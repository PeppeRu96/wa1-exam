import { Form, Row, Col } from "react-bootstrap";

function QuestionMinMaxControls(props) {
    const question = props.question;
    const setQuestions = props.setQuestions;
    const index = props.index;
    const type = question.type;

    const mandatoryOnChange = (ev) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...newQs[index] };
            newQs[index].min = ev.target.checked ? 1 : 0;
            if (newQs[index].max < newQs[index].min)
                newQs[index].max = newQs[index].min;
            return newQs;
        });
    };

    const minOnChange = (ev) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...newQs[index] };
            newQs[index].min = parseInt(ev.target.value);
            return newQs;
        });
    }

    const maxOnChange = (ev) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...newQs[index] };
            newQs[index].max = parseInt(ev.target.value);
            return newQs;
        });
    }

    if (type === 0)
        return ( <OpenQuestionMinMaxControls question={question} mandatoryOnChange={mandatoryOnChange} /> );

    return ( <ClosedQuestionMinMaxControls question={question} minOnChange={minOnChange} maxOnChange={maxOnChange} /> );
}

function OpenQuestionMinMaxControls(props) {
    const question = props.question;
    const mandatoryOnChange = props.mandatoryOnChange;

    return (
        <Row className="mb-2">
            <Col sm="4" />
            <Col sm="4" >
                <Form.Check
                    className="d-flex justify-content-start"
                    type="checkbox"
                    checked={question.min > 0}
                    label="&nbsp;&nbsp;Is mandatory?"
                    onChange={mandatoryOnChange}
                />
            </Col>
        </Row>
    );
}

function ClosedQuestionMinMaxControls(props) {
    const question = props.question;
    const minOnChange = props.minOnChange;
    const maxOnChange = props.maxOnChange;

    return (<>
        <Row className="mb-2">
            <Form.Label className="d-flex justify-content-left" column sm="4">
                Minimum answers to give
            </Form.Label>
            <Col sm="2" xl="1">
                <Form.Control
                    className="d-flex justify-content-left"
                    type="number"
                    value={question.min}
                    onChange={minOnChange}
                    min={0}
                    max={question.max}
                />
            </Col>
        </Row>
        <Row className="mb-2">
            <Form.Label className="d-flex justify-content-left" column sm="4">
                Maximum allowed answers
            </Form.Label>
            <Col sm="2" xl="1">
                <Form.Control
                    className="d-flex justify-content-left"
                    type="number"
                    value={question.max}
                    onChange={maxOnChange}
                    min={question.min}
                    max={question.closedChoices.length}
                />
            </Col>
        </Row>
    </>
    );
}

export default QuestionMinMaxControls;