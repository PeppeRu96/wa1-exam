import { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";

import SessionContext from "../../contexts/SessionContext";

import { FaArrowAltCircleLeft } from 'react-icons/fa';
import { FaArrowAltCircleRight } from 'react-icons/fa';


function ControlButtons(props) {
    const loggedAdmin = useContext(SessionContext);

    const resetAllFields = props.resetAllFields;

    const surveyId = props.surveyId;
    const replyId = props.replyId;
    const survey = props.survey;

    if (loggedAdmin)
        return (<ViewRepliesButtons resetAllFields={resetAllFields} surveyId={surveyId} replyId={replyId} survey={survey} />);

    return (<ReplyButtons resetAllFields={resetAllFields} />);
}


function ReplyButtons(props) {
    const resetAllFields = props.resetAllFields;

    return (
        <Row>
            <Col xs="6" className="d-flex justify-content-start align-self-center">
                <Button variant="success" className="mx-3 px-3" type="submit">Submit</Button>
            </Col>
            <Col xs="2" className="d-flex justify-content-end align-self-center">
                <Button variant="secondary" className="mx-3" type="reset" onClick={ev => resetAllFields()}>Reset</Button>
            </Col>
            <Col xs="4" className="d-flex justify-content-end align-self-center">
                <Button as={Link} to={"/surveys"} variant="danger" className="mx-9" onClick={ev => resetAllFields()}>Cancel and back to home</Button>
            </Col>
        </Row>
    );
}

function ViewRepliesButtons(props) {
    const resetAllFields = props.resetAllFields;
    const surveyId = props.surveyId;
    const replyId = props.replyId;
    const survey = props.survey;

    const history = useHistory();

    let rId = replyId;
    if (!rId) {
        if (survey !== undefined && survey.replyIds !== undefined && survey.replyIds.length > 0)
            rId = survey.replyIds[0];
        else
            rId = -1;
    }
    let currIndex = survey?.replyIds?.indexOf(rId);
    const leftArrowActivated = currIndex !== undefined ? currIndex > 0 : false;
    let rightArrowActivated = currIndex !== undefined ? currIndex < (survey.replyIds.length - 1) : false;

    if (currIndex < 0)
        rightArrowActivated = false;

    const idLeft = currIndex !== undefined ? survey.replyIds[currIndex - 1] : -1;
    const idRight = currIndex !== undefined ? survey.replyIds[currIndex + 1] : -1;

    const goToReplyId = (index) => {
        history.push(`/surveys/${surveyId}/survey-replies/${index}`);
        var myContainer = document.getElementById('survey-container');
        myContainer.scrollTop = 0;
        window.scrollTo(0, 0);
    }

    return (<>
        <Row>
            <Col xs="3" sm="2" className="d-flex justify-content-start align-self-center">
                <Button variant="primary" className="mx-3 px-3" disabled={!leftArrowActivated} onClick={ev => goToReplyId(idLeft)} ><FaArrowAltCircleLeft /></Button>
            </Col>
            <Col xs="3" sm="2" className="d-flex justify-content-start align-self-center">
                <Button variant="primary" className="mr-3 px-3" disabled={!rightArrowActivated} onClick={ev => goToReplyId(idRight)}><FaArrowAltCircleRight /></Button>
            </Col>
            <Col xs="6" sm="8" className="d-flex justify-content-end align-self-center">
                <Button as={Link} to={"/surveys"} variant="danger" className="mx-9" onClick={ev => resetAllFields()}>Back to home</Button>
            </Col>
        </Row>
    </>
    );
}

export default ControlButtons;