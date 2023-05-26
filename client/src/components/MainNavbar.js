
import { Link } from 'react-router-dom';

import { Navbar, Image } from 'react-bootstrap';

import LoginForm from './LoginForm';
import logo from '../logo.png';

// Provides the on top main navbar for showing the brand, a login form and a logout form
// It's required to pass a doLogin function and a doLogout function to pass them to the LoginForm component.
function MainNavbar(props) {

    return (
        <Navbar collapseOnSelect expand="sm" bg="primary" variant="dark">
            <Navbar.Brand as={Link} to={"/surveys"}>
                <Image src={logo} width={60} height={60} />
                Survey Click
            </Navbar.Brand>
            <Navbar.Toggle className="mx-2" aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                {props.showLogin && <LoginForm doLogin={props.doLogin} doLogout={props.doLogout}/>}
            </Navbar.Collapse>
        </Navbar>
    );
    
}

export default MainNavbar;