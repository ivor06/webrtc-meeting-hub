import * as React from "react";
import {connect, Prodiver} from "react-redux";

import {ChatProps, ChatState} from "./types";
import {publishEvent, subscribeOn} from "../../services/pubsub.service";
import {MessageInterface} from "../../../../common/interfaces/Message";
import {sendMessage} from "../../services/message.service";

class Chat extends React.Component<ChatProps, ChatState> {

    state: ChatState;

    constructor(props) {
        super(props);

        this.state = {
            remoteUserId: this.props.remoteUserId,
            selfUserId: this.props.user.id ? this.props.user.id : null,
            currentMessageText: "",
            messageList: []
        };

        this.send = this.send.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.addMessage = this.addMessage.bind(this);
        this.onMessageDelivered = this.onMessageDelivered.bind(this);

        subscribeOn("message", this.onMessage);
        subscribeOn("message-delivered", this.onMessageDelivered);
    }

    componentWillReceiveProps(nextProps) {
        const newState: ChatState = {
            selfUserId: nextProps.user.id ? nextProps.user.id : null,
            remoteUserId: nextProps.remoteUserId
        };

        this.setState(newState);
    }

    onInputKeyDown(event: any) {
        this.setState({currentMessageText: event.target.value});
    }

    send(event?) {
        if (event)
            event.stopPropagation();
        const
            message: MessageInterface = {
                userIdTo: this.state.remoteUserId,
                userIdFrom: this.state.selfUserId,
                text: this.state.currentMessageText,
                time: new Date(),
                hasReceivedByServer: false,
                hasReceivedByRecipient: false
            },
            index = this.state.messageList.length;

        sendMessage(message)
            .then(result => {
                message.hasReceivedByServer = true;
                message.id = result.id;
                this.setState({});
            });

        this.state.currentMessageText = "";

        this.addMessage(message);
    }

    onMessage(message: MessageInterface) {
        publishEvent("ManageVideo.show", message.userIdFrom);
        this.addMessage(message);
    }

    onMessageDelivered(messageId: string) {
        this.state.messageList.some(message => {
            if (message.id === messageId) {
                message.hasReceivedByRecipient = true;
                this.setState({});
                return true;
            }
            return false;
        });
    }

    addMessage(message: MessageInterface) {
        const messageList = this.state.messageList;

        messageList.push(message);
        this.setState({
            messageList
        });
    }

    render() {
        return (
            <div className="container-fluid chat-wrapper">
                {this.state.messageList.length > 0 && <ul className="message-list">
                    {(this.state.messageList.length > 0) && this.state.messageList.map(message =>
                        <li
                            className={(message.userIdFrom === this.state.selfUserId) ? "message-own" : ""}
                            key={message.time instanceof Date ? message.time.getMilliseconds() : message.time}>
                            <div className={"message-wrapper"}>
                                <span className="message-text">{message.text}</span>
                                <span className="message-time">{message.time.toLocaleTimeString()}</span>
                                {message.hasReceivedByServer && <i className="glyphicon glyphicon-check font-8px padding-left-1px"/>}
                                {message.hasReceivedByRecipient && <i className="glyphicon glyphicon-check font-8px padding-left-1px"/>}
                            </div>
                        </li>)}
                </ul>}
                {this.state.messageList.length === 0 && <div className="no-messages">No messages yet</div>}
                <div className="send-current-message">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Type message"
                            value={this.state.currentMessageText}
                            onClick={event => event.stopPropagation()}
                            onChange={event => this.onInputKeyDown(event.nativeEvent)}
                            onKeyDown={event => event.nativeEvent["key"] === "Enter" && this.send()}/>
                        <span className="input-group-btn">
                            <button
                                type="button"
                                className="btn btn-default"
                                aria-label="Left Align"
                                onClick={event => this.send(event)}>
                            <span
                                className="glyphicon glyphicon-arrow-right"
                                aria-hidden="true">
                                </span>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, newS) {
    return state;
}

export default connect(mapStateToProps)(Chat);
