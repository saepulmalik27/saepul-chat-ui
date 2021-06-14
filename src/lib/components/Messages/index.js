import React from "react";
import Joined from "./Joined";
import Message from "./Message";
import { useRef, useEffect } from "react";
import {convertToString} from "../../utils/helper"

const Messages = (props) => {
  const { messages, user, loadmore, scroll } = props;
  const myRef = useRef(null)
  const messageContainer = useRef(null)

  const listMessage = messages.filter(
    (val) =>
      (val.category === "message" && val.deletedAt === undefined) ||
      (val.category === "action" && val.action === "joined")
  );

  const executeScroll = () => { return myRef.current.scrollIntoView()  }

  const handleScroll = () => {
    if (messageContainer.current.scrollTop === 0) {
      loadmore()
    }
  }

  useEffect(() => {
    if (!scroll) {
    executeScroll();
    }
  })

  
  useEffect(() => {
    const reference = messageContainer.current;
    reference.addEventListener("scroll", handleScroll);
    return () => {
      if (reference) {
        reference.removeEventListener("scroll", handleScroll);
      }
    };
  });
   

  return (
    <div className="chat_messages" ref={messageContainer} >
     
      {listMessage.map((val, key) => (
        <React.Fragment key={key}>
          {val.category === "message" ? (
            <Message message={val} uid={ convertToString(user.uid)} />
          ) : (
            <Joined message={val} />
          )}
        </React.Fragment>
      ))}
      <div ref={myRef}></div>
    </div>
  );
};

export default Messages;
