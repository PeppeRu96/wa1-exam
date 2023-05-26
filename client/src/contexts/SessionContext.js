import { createContext } from "react";

// It provides a session context to allow the context provider to provide
// the unique loggedAdmin (Admin prototype) object which can be undefined
// indicating that currently there is not a logged admin.
const SessionContext = createContext();

export default SessionContext;