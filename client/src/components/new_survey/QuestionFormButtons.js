import { Row, Col, Button } from "react-bootstrap";

import { FaArrowAltCircleUp } from 'react-icons/fa';
import { FaArrowAltCircleDown } from 'react-icons/fa';

function QuestionFormButtons(props) {
    const question = props.question;
    const questionCount = props.questionCount;
    const setQuestions = props.setQuestions;
    const index = props.index;

    const upArrowActive = question !== undefined ? question.orderingPosition > 1 : false;
    const downArrowActive = question !== undefined ? question.orderingPosition < questionCount : false;
    const deleteQuestionActive = question !== undefined ? questionCount > 1 : false;

    const moveUpDown = (up) => {
        const inc = up ? -1 : 1;
        setQuestions(qs => {
            const newQs = qs.map((q, idx) => {
                if (idx === index) {
                    const newQ = { ...q };
                    newQ.orderingPosition += inc;
                    return newQ;
                } else if (idx === index + inc) {
                    const newQ = { ...q };
                    newQ.orderingPosition += -inc;
                    return newQ;
                }
                return q;
            }).sort((a, b) => a.orderingPosition > b.orderingPosition);
            return newQs;
        });
    }

    const moveUp = () => {
        if (question.orderingPosition <= 1)
            return;
        moveUpDown(true);
    };

    const moveDown = () => {
        if (question.orderingPosition >= questionCount)
            return;
        moveUpDown(false);
    };

    const deleteQuestion = () => {
        setQuestions(qs => {
            let newQs = qs.map((q, idx) => {
                if (idx > index) {
                    const newQ = { ...q };
                    newQ.orderingPosition--;
                    return newQ;
                }
                return q;
            });

            newQs = newQs.filter((q, idx) => idx !== index);

            return newQs;
        });
    };

    return (
        <Row>
            <Col sm="4" />
            <Col xs="2" sm="1" className="mt-4 d-flex justify-content-end align-self-center">
                <Button variant="primary" disabled={!upArrowActive} onClick={moveUp} ><FaArrowAltCircleUp /></Button>
            </Col >
            <Col xs="2" sm="1" className="mt-4 d-flex justify-content-start align-self-center">
                <Button variant="primary" disabled={!downArrowActive} onClick={moveDown} ><FaArrowAltCircleDown /></Button>
            </Col >
            <Col xs="4" sm="6" className="mt-4 d-flex justify-content-end align-self-center">
                <Button variant="danger" disabled={!deleteQuestionActive} onClick={deleteQuestion} >Delete question</Button>
            </Col >
        </Row>
    );
}

export default QuestionFormButtons;