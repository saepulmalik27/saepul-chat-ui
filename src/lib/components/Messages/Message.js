import React from "react";
import { convertStringToDate } from "../../utils/helper";

const Message = ({ message, uid }) => {
  console.log(message.sender.uid === uid );
  return (
    <div className={`message ${message.sender.uid === uid ? 'reverse' : ''}`}>
      <div className="message-wrapper">
        <div className="message-identity">
          {message.sender.uid === uid ? (
            <span className="message-identity--text sender">
              <strong>{message.sender.name}</strong>
            </span>
          ) : (
            <span className="message-identity--text">
              {message.sender.name}
            </span>
          )}

          <span className="message-identity--date">
            {convertStringToDate(message.sentAt)}
          </span>
        </div>
        <p className="message-body">{message.text}</p>
      </div>
    </div>
  );
};
export default Message;
