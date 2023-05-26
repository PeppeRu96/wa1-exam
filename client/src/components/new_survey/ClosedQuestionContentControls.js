import { Form, Row, Col, Button, ListGroup } from "react-bootstrap";

import { IoMdAddCircle } from 'react-icons/io';
import { AiFillRightSquare } from 'react-icons/ai';
import { RiDeleteBack2Fill } from 'react-icons/ri';

import ClosedChoice from "../../models/ClosedChoice";


function ClosedQuestionContentControls(props) {
    const question = props.question;
    const setQuestions = props.setQuestions;
    const index = props.index;

    const closedChoiceOnChange = (ev, ccIndex) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...newQs[index] };
            const question = newQs[index];

            // Pay attention to pure functional programming! Objects are references..!
            // We need to not mutate the original objects but we always have to recreate new objects/arrays!
            question.closedChoices = question.closedChoices.map((cc, idx) => {
                if (idx === ccIndex)
                    return new ClosedChoice(cc.id, ev.target.value);
                return cc;
            })

            return newQs;
        });
    };

    const newClosedChoice = () => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...newQs[index] };
            const question = newQs[index];

            // Pay attention to pure functional programming! Objects are references..!
            // We need to not mutate the original objects but we always have to recreate new objects/arrays!
            if (question.closedChoices.length === 0)
                question.max = 1;
            question.closedChoices = [...question.closedChoices, new ClosedChoice(null, "")];
            return newQs;
        });
    }

    const deleteClosedChoice = (ccIndex) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...newQs[index] };
            const question = newQs[index];

            // Pay attention to pure functional programming! Objects are references..!
            // We need to not mutate the original objects but we always have to recreate new objects/arrays!
            question.closedChoices = question.closedChoices.filter((cc, idx) => idx !== ccIndex);
            return newQs;
        });
    };

    return (<>
        <Row className="mb-2">
            <Form.Label className="d-flex justify-content-left" column sm="4">
                Options
            </Form.Label>
            <Col sm="8" >
                <ListGroup className="d-flex justify-content-left ">
                    {question.closedChoices.map((cc, ccIndex) => (
                        <ClosedChoiceItem key={cc.id} cc={cc} ccIndex={ccIndex} closedChoiceOnChange={closedChoiceOnChange} deleteClosedChoice={deleteClosedChoice} />
                    ))}
                </ListGroup>
            </Col>
        </Row>
        <Row className="mb-2">
            <Col sm="4" />
            <Col sm="6" >
                <Button className="d-flex justify-content-left mt-1" variant="primary" onClick={ev => newClosedChoice()}>
                    <span><IoMdAddCircle /> New option</span>
                </Button>
            </Col>
        </Row>
    </>
    );
}

function ClosedChoiceItem(props) {
    const cc = props.cc;
    const ccIndex = props.ccIndex;
    const closedChoiceOnChange = props.closedChoiceOnChange;
    const deleteClosedChoice = props.deleteClosedChoice;

    return (
        <ListGroup.Item>
            <Row>
                <Col xs="1">
                    <AiFillRightSquare />
                </Col>
                <Col xs="9" xl="10">
                    <Form.Control
                        className="d-flex justify-content-left"
                        type="text"
                        value={cc.content}
                        placeholder="Insert an option.."
                        onChange={ev => closedChoiceOnChange(ev, ccIndex)}
                        required
                    />
                </Col>
                <Col xs="2" xl="1">
                    <Button className="d-flex justify-content-end mt-1 mx-3" variant="danger" onClick={ev => deleteClosedChoice(ccIndex)}>
                        <RiDeleteBack2Fill />
                    </Button>
                </Col>
            </Row>
        </ListGroup.Item>
    );
}

export default ClosedQuestionContentControls;