import React from "react";
import {setupCometchat, fetchMessage, getMessage, localMessage, sentMessage, getLocalMessage, messageListener, groupListener} from './utils/cometchat'
/* COMPONENT */
import Messages from "./components/Messages";
import Spinner from "./components/Spinner";
import {COLOR} from "./utils/constant";
import {convertToString} from "./utils/helper";
import "./chat.scss"



class Chat extends React.Component {
 
  constructor(props) {
    super(props);
    this.state = {
      messageBuilder: null,
      messages: [],
      message: "",
      scroll : false,
      loading : false,
      group : {},
      user : {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.newMessages = [];

  }

  componentDidMount() {
    this.setupCometchat();
  }

  setupCometchat(){
    const {groupname, guid} = this.props.config;
    const {uid, username} = this.props.user;

    setupCometchat({UID : convertToString(uid), USER_NAME : username, GROUP_NAME : groupname, GUID : guid, config : this.props.config}).then(result => {
      this.setState({
        group : result.group,
        user : result.user
      }, () => {
        this.fechPreviousMessage(guid)
      })
    })
  }

  componentDidUpdate() {
    this.messageListener();
    this.groupListener();
  }



  fechPreviousMessage(GUID) {
    const messageBuilder = fetchMessage(15, GUID);
    this.setState({ messageBuilder }, ()=> {
      this.getMessage(messageBuilder);
    });
    
  }


  handleScroll() {
      this.getMessage(this.state.messageBuilder, "more")
  }

  getMessage(request, origin) {
    this.setState({
      loading : true
    })
   getMessage(request).then((messages) => {
    if (origin === 'more') {
      this.newMessages = [...messages, ...this.state.messages];
          this.setState({
            messages : [...this.newMessages],
            scroll : true,
            loading : false
          })
    }else{
      this.concatMessage(messages)
    }
   })
  }

  concatMessage(newMessage) {
    this.newMessages = [...this.state.messages, ...newMessage];
    this.setState({ messages: [...this.newMessages], scroll :false, loading : false });
  }

  handleSubmit(event) {
    event.preventDefault();

    const message = localMessage(convertToString(this.props.user.uid));
    if (message) {
      this.setState({
        loading: true,
      });
      if (this.state.message !== '') {
        message.text = this.state.message;
        this.concatMessage([message]);
      }
      
    }
    this.setState(
      {
        message: "",
        loading: false,
      }
    );
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
    const listenerID = this.props.config.messageListener
    if (listenerID) {
      messageListener(listenerID).then((data) => {
        const updateMessages = [...this.state.messages];
        const index = updateMessages.find(val => val.id === data.id)
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
      return (<Spinner size="80px" color={COLOR.INSPIGO_BUSINESS} />)
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
          {this.state.loading ? (<Spinner size="80px" color={COLOR.INSPIGO_BUSINESS} />) : (<button type="submit" className="chat_form__button">
            <img src="/assets/img/actions/send.svg" alt="send" />
          </button>)}
          
        </form>
      </div>
    );
  }
}

export default Chat;
