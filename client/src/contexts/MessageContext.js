import { createContext } from "react";

// It provides a wrapper for a complete message
function Message(header, msg, variant, dismissible=true) {
    this.header = header;
    this.msg = msg;
    this.variant = variant;
    this.dismissible = dismissible;
}

// It's a wrapper for ease the message passing mechanism.
// Basically the context provider will provide a MessageState object composed of:
//  -msg:       a Message object
//  -setMsg:    a function for setting the unique MessageState state of the provider
//  -show:      a boolean variable indicating wether or not to shot the message
//  -setShow:   a function for setting the unique boolean state of the provider
function MessageState(msg, setMsg, show, setShow) {
    this.msg = msg;
    this.setMsg = setMsg;
    this.show = show;
    this.setShow = setShow;
}

const MessageContext = createContext();

export { Message, MessageState, MessageContext }; 