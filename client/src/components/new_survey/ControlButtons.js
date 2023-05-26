import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { IoMdAddCircle } from 'react-icons/io';

function ControlButtons(props) {
    const newQuestion = props.newQuestion;
    const resetAllFields = props.resetAllFields;
    const deleteAllQuestions = props.deleteAllQuestions;

    return (
        <Row>
            <Col sm="2" className="mt-1 d-flex justify-content-sm-start align-self-center">
                <Button variant="success" type="submit">Publish</Button>
            </Col >
            <Col sm="3" className="mt-1 d-flex justify-content-sm-end align-self-center">
                <Button variant="primary" onClick={ev => newQuestion()}><IoMdAddCircle /> New Question</Button>
            </Col >
            <Col sm="2" className="mt-1 d-flex justify-content-sm-end align-self-center">
                <Button variant="secondary" onClick={ev => resetAllFields()}>Reset</Button>
            </Col>
            <Col sm="3" className="mt-1 d-flex justify-content-sm-end align-self-center">
                <Button variant="danger" onClick={ev => deleteAllQuestions()}>Delete all questions</Button>
            </Col>
            <Col sm="2" className="mt-1 d-flex justify-content-sm-end align-self-center">
                <Button as={Link} to={"/surveys"} variant="danger" className="" onClick={ev => resetAllFields()}>Cancel</Button>
            </Col>
        </Row>
    );
}

export default ControlButtons;