import { Form, Row, Col, ListGroup } from "react-bootstrap";

// Custom components
import QuestionMinMaxControls from "./QuestionMinMaxControls";
import ClosedQuestionContentControls from "./ClosedQuestionContentControls";
import QuestionFormButtons from "./QuestionFormButtons";

function QuestionFormControls(props) {
    const questions = props.questions;
    const setQuestions = props.setQuestions;

    const questionCount = questions !== undefined ? questions.length : 0;

    return (
        <ListGroup variant="flush">
            {questions.map((q, index) => (<QuestionFormItem key={q.orderingPosition} question={q} index={index} questionCount={questionCount} setQuestions={setQuestions} />))}
        </ListGroup>
    );
}

function QuestionFormItem(props) {
    const question = props.question;
    const questionCount = props.questionCount;
    const index = props.index;
    const setQuestions = props.setQuestions;

    const questionTitleOnChange = (ev) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...(newQs[index]) };
            newQs[index].title = ev.target.value;
            return newQs;
        });
    };

    const questionTypeOnChange = (ev) => {
        setQuestions(qs => {
            const newQs = [...qs];
            newQs[index] = { ...(newQs[index]) };
            newQs[index].type = parseInt(ev.target.value);
            newQs[index].min = 0;
            if (newQs[index].type === 0)
                newQs[index].max = 1;
            else
                newQs[index].max = newQs[index].closedChoices.length > 0 ? 1 : 0;
            return newQs;
        });
    }

    return (
        <ListGroup.Item>
            <Form.Group className="mb-3" controlId={`question-${question.orderingPosition}`} >
                <Row>
                    <Form.Label className="d-flex justify-content-left" column sm="4">
                        <span className="label-medium"><b><i>Question {question.orderingPosition} </i></b></span>
                    </Form.Label>
                </Row>
                <Row className="mb-2">
                    <Form.Label className="d-flex justify-content-left" column sm="4">
                        Question type
                    </Form.Label>
                    <Col sm="4" md="3">
                        <Form.Control as="select" value={question.type} onChange={questionTypeOnChange}>
                            <option value={0}>Open question</option>
                            <option value={1}>Closed question</option>
                        </Form.Control>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Form.Label className="d-flex justify-content-left" column sm="4">
                        Question title
                    </Form.Label>
                    <Col sm="8">
                        <Form.Control type="text" value={question.title} onChange={questionTitleOnChange} placeholder="Insert your question.." required />
                    </Col>
                </Row>
                <QuestionMinMaxControls question={question} setQuestions={setQuestions} index={index} />
                {question.type === 1 && <ClosedQuestionContentControls question={question} setQuestions={setQuestions} index={index} />}
                <QuestionFormButtons question={question} setQuestions={setQuestions} questionCount={questionCount} index={index} />
            </Form.Group>
        </ListGroup.Item>

    );
}

export default QuestionFormControls;