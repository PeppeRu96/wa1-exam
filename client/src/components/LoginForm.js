import { useState, useContext } from 'react';

import { Form, Row, Col, Button } from 'react-bootstrap';

import SessionContext from '../contexts/SessionContext';

// Shows an inline login/logout form
// It's required to pass a doLogin function and a doLogout function
// It relies on a SessionContext which contains the logged-in administrator
function LoginForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [validated, setValidated] = useState(false);      // Just for toggling validation style on the form

    const loggedAdmin = useContext(SessionContext);

    // Handle the form submission after login button is pressed
    const handleLoginSubmit = (event) => {
        const form = event.currentTarget;

        // We don't want to refresh the page
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === true) {
            // Static validation of parameters success
            props.doLogin(username, password);
        }

        setValidated(true);
    };

    // Handle the form submission after logout button is pressed
    const handleLogoutSubmit = (event) => {
        // We don't want to refresh the page
        event.preventDefault();
        event.stopPropagation();

        props.doLogout();
        setValidated(false);
    };

    if (!loggedAdmin)
        return (
            <LoginFormControls
                validated={validated}
                handleLoginSubmit={handleLoginSubmit}
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword} />
        );

    return (
        <LogoutFormControls handleLogoutSubmit={handleLogoutSubmit} loggedAdmin={loggedAdmin} />
    );
}

function LoginFormControls(props) {
    const validated = props.validated;
    const handleLoginSubmit = props.handleLoginSubmit;

    const username = props.username;
    const setUsername = props.setUsername;
    const password = props.password;
    const setPassword = props.setPassword;

    return (
        <Form className="mx-auto" inline noValidate validated={validated} onSubmit={handleLoginSubmit}>
            <Form.Group as={Row} controlId="formLogin">
                <Form.Label className="admin-login-label" column sm="3">Administrator login</Form.Label>
                <Col sm="3">
                    <Form.Control type="text" placeholder="Username" required value={username} onChange={ev => setUsername(ev.target.value)} />
                </Col>
                <Col sm="3">
                    <Form.Control type="password" placeholder="Password" required value={password} onChange={ev => setPassword(ev.target.value)} />
                </Col>
                <Col sm="3">
                    <Button type="submit" variant="success">Login</Button>
                </Col>
            </Form.Group>
        </Form>
    );
}

function LogoutFormControls(props) {
    const handleLogoutSubmit = props.handleLogoutSubmit;
    const loggedAdmin = props.loggedAdmin;

    return (
        <Form className="mx-auto" inline onSubmit={handleLogoutSubmit}>
            <Form.Group as={Row} controlId="formLogin">
                <Form.Label column sm="4" className="mr-3 admin-login-label">Administrator:</Form.Label>
                <Form.Label column sm="4" className="mr-3 admin-login-label"><b>{loggedAdmin.username}</b></Form.Label>
                <Col sm="4">
                    <Button type="submit" variant="success" className="mx-auto">Logout</Button>
                </Col>
            </Form.Group>
        </Form>
    );
}

export default LoginForm;