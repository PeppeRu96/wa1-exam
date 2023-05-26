import { useContext } from "react";
import { Alert } from "react-bootstrap";

import { MessageContext } from '../contexts/MessageContext';

// It can show up an alert binded with a context message state
// State object prototype: MessageState{msg : Message, setMsg : function, show : boolean, setShow : function}
// Message object prototype: {header, msg, variant, dismissible=true}
function DismissibleAlert() {
    const msgState = useContext(MessageContext);
    const msg = msgState.msg;

    // To avoid problems when the context is not initialized
    const show = msgState.show;
    const variant = msg?.variant ?? "danger";
    const header = msg?.header ?? "";
    const content = msg?.msg ?? "";

    return (
        <Alert show={show} variant={variant} onClose={() => msgState.setShow(false)} dismissible={msg?.dismissible ?? true} className="mt-2">
            <Alert.Heading>{header}</Alert.Heading>
            <p style={{whiteSpace: 'pre'}}>{content}</p>
        </Alert>
    );
}

export default DismissibleAlert;