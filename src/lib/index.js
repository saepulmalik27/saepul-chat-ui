import React from "react";
import {
  setupCometchat,
  fetchMessage,
  getMessage,
  localMessage,
  sentMessage,
  getLocalMessage,
  messageListener,
  groupListener,
} from "./utils/cometchat";
/* COMPONENT */
import Messages from "./components/Messages";
import Spinner from "./components/Spinner";
import { COLOR } from "./utils/constant";
import { convertToString } from "./utils/helper";
import "./chat.scss";

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messageBuilder: null,
      messages: [],
      message: "",
      scroll: false,
      loading: false,
      group: {},
      user: {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.newMessages = [];
  }

  componentDidMount() {
    this.setupCometchat();
  }

  setupCometchat() {
    const { groupname, guid } = this.props.config;
    const { uid, username } = this.props.user;

    setupCometchat({
      UID: convertToString(uid),
      USER_NAME: username,
      GROUP_NAME: groupname,
      GUID: guid,
      config: this.props.config,
    }).then((result) => {
      this.setState(
        {
          group: result.group,
          user: result.user,
        },
        () => {
          this.fechPreviousMessage(guid);
        }
      );
    });
  }

  componentDidUpdate() {
    this.messageListener();
    this.groupListener();
  }

  fechPreviousMessage(GUID) {
    const messageBuilder = fetchMessage(15, GUID);
    this.setState({ messageBuilder }, () => {
      this.getMessage(messageBuilder);
    });
  }

  handleScroll() {
    this.getMessage(this.state.messageBuilder, "more");
  }

  getMessage(request, origin) {
    this.setState({
      loading: true,
    });
    getMessage(request).then((messages) => {
      if (origin === "more") {
        this.newMessages = [...messages, ...this.state.messages];
        this.setState({
          messages: [...this.newMessages],
          scroll: true,
          loading: false,
        });
      } else {
        this.concatMessage(messages);
      }
    });
  }

  concatMessage(newMessage) {
    this.newMessages = [...this.state.messages, ...newMessage];
    this.setState({
      messages: [...this.newMessages],
      scroll: false,
      loading: false,
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const message = localMessage(convertToString(this.props.user.uid));
    if (message) {
      this.setState({
        loading: true,
      });
      if (this.state.message !== "") {
        message.text = this.state.message;
        this.concatMessage([message]);
      }
    }
    this.setState({
      message: "",
      loading: false,
    });
    sentMessage(this.state.message, this.props.config.guid).then((data) => {
      const newMessageData = getLocalMessage(
        message.id,
        this.state.messages,
        data
      );
      this.setState({
        messages: newMessageData,
      });
    });
  }

  handleChange(event) {
    this.setState({ message: event.target.value });
  }

  messageListener() {
    const listenerID = this.props.config.messageListener;
    if (listenerID) {
      messageListener(listenerID).then((data) => {
        const updateMessages = [...this.state.messages];
        const index = updateMessages.find((val) => val.id === data.id);
        if (index === undefined) {
          this.concatMessage([data]);
        }
      });
    }
  }

  groupListener() {
    const listenerID = this.props.config.groupListener;
    if (listenerID) {
      groupListener(listenerID).then((data) => {
        this.concatMessage([data.message]);
      });
    }
  }

  messages() {
    if (this.state.messages) {
      return (
        <Messages
          messages={this.state.messages}
          {...this.props}
          loadmore={this.handleScroll}
          scroll={this.state.scroll}
        />
      );
    } else {
      return <Spinner size="80px" color={COLOR.INSPIGO_BUSINESS} />;
    }
  }

  render() {
    return (
      <div className="chat">
        {this.messages()}

        <form onSubmit={this.handleSubmit} className="chat_form">
          <input
            type="text"
            value={this.state.message}
            placeholder="type your message"
            onChange={this.handleChange}
            className="chat_form__input"
          />
          {this.state.loading ? (
            <Spinner size="80px" color={COLOR.INSPIGO_BUSINESS} />
          ) : (
            <button type="submit" className="chat_form__button">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.7344 11.1652L2.10939 0.852673C1.94774 0.77183 1.76616 0.739437 1.58652 0.759397C1.40689 0.779356 1.23685 0.850816 1.09689 0.965173C0.963224 1.0772 0.863457 1.22429 0.808804 1.3899C0.75415 1.55552 0.746777 1.7331 0.787514 1.90267L3.27189 11.062H13.875V12.937H3.27189L0.750014 22.0683C0.711789 22.2099 0.707326 22.3585 0.736986 22.5022C0.766646 22.6458 0.829601 22.7805 0.920788 22.8954C1.01197 23.0103 1.12885 23.1022 1.26201 23.1637C1.39518 23.2252 1.54092 23.2546 1.68751 23.2495C1.83427 23.2487 1.97877 23.2133 2.10939 23.1464L22.7344 12.8339C22.888 12.7552 23.0168 12.6357 23.1068 12.4885C23.1968 12.3413 23.2444 12.1721 23.2444 11.9995C23.2444 11.827 23.1968 11.6578 23.1068 11.5106C23.0168 11.3634 22.888 11.2438 22.7344 11.1652Z"
                  fill={COLOR.INSPIGO_BUSINESS}
                />
              </svg>
            </button>
          )}
        </form>
      </div>
    );
  }
}

export default Chat;
