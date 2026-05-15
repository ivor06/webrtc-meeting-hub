import * as React from "react";
import {connect} from "react-redux";

import {TYPES} from "../../../../common/util";
import {DialogProps, DialogState, DialogContent} from "./types";
import {subscribeOn} from "../../services/pubsub.service";

const onReloadPage = () => {
    location.reload(true);
    return false;
};

class Dialog extends React.Component<DialogProps, DialogState> {
    state: DialogState;

    constructor(props, context) {
        super(props, context);

        this.state = {
            content: this.props.content,
            isDisplay: false,
            isAnimation: false
        };

        this.setContent = this.setContent.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);

        subscribeOn("Dialog.hide", this.hide);
        subscribeOn("Dialog.show", this.show);
        subscribeOn("Dialog.setContent", this.setContent);
    }

    setContent(content: DialogContent) {
        this.setState({content});

        if (typeof content.callBack === TYPES.FUNCTION)
            content.callBack();
    }

    show() {
        this.setState({isDisplay: true});
        setTimeout(() => this.setState({isAnimation: true}), 100);
    }

    hide() {
        this.setState({isAnimation: false});
        setTimeout(() => this.setState({isDisplay: false}), 500);
    }

    onButtonClick(cb) {
        this.hide();
        cb && cb();
    }

    render() {
        return <div id="myModal"
                    className={"modal fade dialog" + (this.state.isDisplay ? " display-flex" : " display-none") + (this.state.isAnimation ? " in" : "")}>
            {this.state.isDisplay && <div className="modal-dialog">
                {this.state.content && <div
                    className={"modal-content max-height-100" + (this.state.content.isError ? " error-content" : "")}
                    onClick={!this.state.content.closeOnClick && this.hide}>
                    <div className={"modal-header" + (this.state.content.isError ? " alert alert-danger" : " header-info")}>
                        {this.state.content.isClosable && <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-hidden="true"
                            onClick={this.hide}>&times;</button>}
                        <h4 className="modal-title text-center">{this.state.content.header ? this.state.content.header : (this.state.content.isError ? "Error" : "")}</h4>
                    </div>
                    <div className="modal-body height-auto">
                        {this.state.content.image && <div className="media-img">
                            <img
                                className="img-rounded img-responsive img-fluid center-block pull-md-12"
                                src={this.state.content.image}/>
                        </div>}
                        {this.state.content.image && <div className="media-body">
                            <h4 className="media-heading text-center">{this.state.content.text}</h4>
                        </div>}
                        {!this.state.content.image && this.state.content.text && <p className="text-center">
                            {this.state.content.text}
                        </p>}
                        {this.state.content.connectionStatus && <p className="text-center">
                            {this.state.content.connectionStatus}
                        </p>}
                    </div>
                    {this.state.content.buttonList && this.state.content.buttonList.length && <div className="modal-footer buttonList">
                        {this.state.content.buttonList.map(buttonItem =>
                                <button
                                    key={buttonItem.label}
                                    type="button"
                                    className="{{button.className}}"
                                    aria-label="Left Align"
                                    onClick={this.onButtonClick.bind(this, buttonItem.callBack)}>
                                    {buttonItem.label}
                                    <span
                                        className="{{button.iconClassName}}"
                                        aria-hidden="true">
                        </span>
                                </button>
                        )}
                    </div>}
                    {this.state.content.isError && <div className="modal-footer">
                        <a href="#" onClick={onReloadPage}>Reload page</a>
                    </div>}
                </div>}
            </div>}
        </div>;
    }
}

function mapStateToProps(state) {

    return state;
}

export default connect(mapStateToProps)(Dialog);

