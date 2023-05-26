import { Container, ListGroup } from "react-bootstrap";

import MainTitle from "./MainTitle";
import SurveyTr from "./SurveyTr";

// It provides a main title for the page and a table with all the surveys passed to this component
// It's required to pass a `surveys` array containing all the Survey objects and two boolean variables
// sessionChecked and fetched to know and render accordingly to the application state
function SurveyTable(props) {
    const sessionChecked = props.sessionChecked;    // We already checked if he's logged or not?
    const fetched = props.fetched;                  // We already fetched the surveys?

    const title = "Surveys";
    const containsSurveys = props.surveys !== undefined && props.surveys.length > 0;

    let tempNoSurveysMsg = "";
    if (sessionChecked) {
        if (fetched && !containsSurveys) {
            tempNoSurveysMsg = "No surveys to show..";
        }
    } else {
        tempNoSurveysMsg = "🕗 Loading surveys.. please wait 🕗";
    }

    return (
        <>
            <MainTitle title={title} />
            <Container id="survey-container">
                <p>{tempNoSurveysMsg}</p>
                <ListGroup>
                    {props.surveys.map(s => (<SurveyTr survey={s} key={s.id} />))}
                </ListGroup>
            </Container>
        </>
    );
}

export default SurveyTable;