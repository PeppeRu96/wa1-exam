import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { useEffect, useState } from 'react';

import { Container, Button } from 'react-bootstrap';

import { Switch, Route, Link, useHistory } from 'react-router-dom';

// Custom components
import MainNavbar from './components/MainNavbar';
import DismissibleAlert from './components/DismissibleAlert';
import SurveyTable from './components/SurveyTable';
import SurveyForm from './components/survey/SurveyForm';
import NewSurveyForm from './components/new_survey/NewSurveyForm';

// Contexts
import { Message, MessageState, MessageContext } from './contexts/MessageContext';
import SessionContext from './contexts/SessionContext';

import API from './API';
import { Admin } from './models/Admin';

/**
 * The site fully supports typing urls by hand to allow people to share links easily
 * or to use history to retrieve directly the requested information.
 * @returns 
 */
function App() {
  // Unique alert message
  const [msg, setMsg] = useState(undefined);
  const [msgShow, setMsgShow] = useState(false);

  // Unique loggedAdmin (Admin prototype) object
  const [loggedAdmin, setLoggedAdmin] = useState(undefined);
  // Session checked boolean state to avoid doing unuseful stuff when you haven't already checked wether you're logged-in or not
  const [sessionChecked, setSessionChecked] = useState(false);

  const [surveys, setSurveys] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [fetched, setFetched] = useState(false);

  const surveyFormPaths = [
    "/surveys/:surveyId/survey-replies/:replyId",
    "/surveys/:surveyId/survey-replies",
    "/surveys/:surveyId"
  ];

  // -- Application functions, effects and data manipulation -- //

  // Check if an admin is logged-in
  const checkAuth = async () => {
    let admin = undefined;
    try {
      admin = await API.getAdminInfo();
    } catch (err) { }

    if (admin !== undefined)
      setLoggedAdmin(new Admin(admin.id, admin.username));

    setSessionChecked(true);
  };

  // Check if an admin is logged-in at the beginning
  useEffect(() => {
    checkAuth();
  }, []);

  // Login
  const doLogin = async (username, password) => {
    let admin = undefined;

    try {
      admin = await API.logIn(username, password);
    } catch (err) {
      // It's intended to not show the cause of the login failed (antihack)
      setMsg(new Message("Login failed", `Incorrect login or password.`, "danger"));
    }

    if (admin !== undefined) {
      setLoggedAdmin(new Admin(admin.id, admin.username));

      setMsg(new Message("Login success", `Welcome ${username}.. Good work.`, "success", true));
      history.push("/surveys");
    }

    setMsgShow(true);
    setTimeout(() => setMsgShow(false), 3000);
  };

  // Logout
  const doLogout = async () => {
    // Whether success or not, for the client the session is ended
    try {
      await API.logOut();
    } catch (err) { }

    setLoggedAdmin(undefined);
    history.push("/surveys");
  }

  // Load all the surveys (the server will send the correct surveys whether you're logged in or not)
  const getSurveys = async () => {
    setSurveys([]);
    let fetchedSurveys = undefined;
    try {
      fetchedSurveys = await API.getAllSurveys(loggedAdmin !== undefined);
    } catch (err) {
      setMsg(new Message("Surveys not loaded", "There was a problem reaching the server.. please try again.", "danger", true));
      setMsgShow(true);
      setTimeout(() => setMsgShow(false), 3000);
    }

    if (fetchedSurveys !== undefined)
      setSurveys(fetchedSurveys);

    setFetched(true);
    setDirty(false);
  };

  // Fetch surveys at the beginning, when sessionChecked becomes true, when dirty changes, when you login/logout
  useEffect(() => {
    setFetched(false);
    if (sessionChecked)
      getSurveys();
  }, [dirty, loggedAdmin, sessionChecked]);

  // Listen to url changes to hide the message alert (which was referring to another page)
  const history = useHistory();
  history.listen(() => setMsgShow(false));

  // -- //

  return (
    <div className="App">
      <SessionContext.Provider value={loggedAdmin}>
        <MessageContext.Provider value={new MessageState(msg, setMsg, msgShow, setMsgShow)}>
          <MainNavbar doLogin={doLogin} doLogout={doLogout} showLogin={sessionChecked} />
          <Container>
            <DismissibleAlert />
            <Switch>
              <Route exact path={["/", "/surveys"]}>
                <SurveyTable surveys={surveys} sessionChecked={sessionChecked} fetched={fetched} />
                {loggedAdmin && <Button as={Link} to={"/add-survey"} variant="primary" id="add-survey-btn">New survey</Button>}
              </Route>
              <Route path={surveyFormPaths} render={({ match }) => (
                <SurveyForm surveyId={match.params.surveyId} replyId={match.params.replyId} sessionChecked={sessionChecked} />
              )} />
              <Route path={"/add-survey"}>
                <NewSurveyForm setDirty={setDirty} sessionChecked={sessionChecked} />
              </Route>
              <Route>
                <h1>404: Not found</h1>
              </Route>
            </Switch>
          </Container>
        </MessageContext.Provider>
      </SessionContext.Provider>
    </div >
  );
}

export default App;