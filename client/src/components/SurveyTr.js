import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, ListGroup } from 'react-bootstrap';

import { BiSpreadsheet } from 'react-icons/bi';

import SessionContext from '../contexts/SessionContext';

// Provides a ListGroup.Item working as a Link
// It's required to pass a Survey object containing all the valid informations about a survey
function SurveyTr(props) {
    const loggedAdmin = useContext(SessionContext);

    const survey = props.survey;
    
    // Decide the path of the item
    // This part is intended left here because the path management is out of the scope
    // of the 'Data/application logic' of the surveys themselves.
    // LoggedAdmin + replies > 0 :  /surveys/:surveyId/survey-replies/:replyId
    // Logged admin + replies == 0: /surveys
    // User:                        /survyes/:surveyId
    let path = '/surveys';
    if (loggedAdmin) {
        if (survey.countReplies > 0)
            path = `/surveys/${survey.id}/survey-replies/${survey.replyIds[0]}`;
    } else {
        path = `/surveys/${survey.id}`;
    }

    return (
        <ListGroup.Item className="px-0" as={Link} to={path} >
            <Row className="px-4 py-2">
                <Col className="d-flex justify-content-start align-self-center">
                    {survey.title}
                </Col>
                <Col className="col-2 d-flex justify-content-end align-self-center mr-3">
                    <RepliesCounter count={survey.countReplies} />
                </Col>
            </Row>
        </ListGroup.Item>
    );
}

function RepliesCounter(props) {
    const loggedAdmin = useContext(SessionContext);

    const count = props.count;

    if (loggedAdmin !== undefined)
        return (<span className="mx-3"><BiSpreadsheet /> Replies &ensp;&ensp;<b>{count}</b></span>);
    
    return (<></>);
}

export default SurveyTr;