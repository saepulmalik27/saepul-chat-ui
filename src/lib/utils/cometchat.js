import { CometChat } from "@cometchat-pro/chat";



let UID, USER_NAME, GUID, GROUP_NAME, authKey, appID, region, groupType, password;

export const setupCometchat = async (props) => {
  UID = `${props.UID}`;
  USER_NAME = props.USER_NAME;
  GUID = props.GUID;
  GROUP_NAME = props.GROUP_NAME;
  authKey = props.config.authKey;
  appID = props.config.appID;
  region = props.config.region;
  groupType = CometChat.GROUP_TYPE.PUBLIC;
  password = props.config.password;

  let user, group;

  try {
    const init = await initCometChat();
    if (init) {
      user = { ...(await loginCometChat(UID, authKey)) }.user;
      if (user) {
        group = { ...(await retrieveGroupChat(GUID)) };
      }
    }
  } catch (error) {
    console.log(error);
  }
  return { group, user };
};

const initCometChat = () => {
  return new Promise((resolve, reject) => {
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    CometChat.init(appID, appSetting).then(
      () => {
        resolve("SUCCESS_INITIALIZATION");
      },
      (error) => {
        reject(error.code);
      }
    );
  });
};

const loginCometChat = (id, key) => {
  return new Promise((resolve, reject) => {
    CometChat.getLoggedinUser().then(
      (user) => {
        if (!user) {
          CometChat.login(id, 
            key).then(
            (user) => {
              // console.log("Login Successful:", { user });
              resolve({ user, message: "LOGIN_SUCCESS" });
            },
            (error) => {
              // console.log("Login failed with exception:", { error });
              if (error.code === "ERR_UID_NOT_FOUND") {
                createUserCometChat(id, key, USER_NAME).then(
                  user => {
                    loginCometChat(id, key).then(
                      user => {
                        resolve(user)
                      }
                    )
                  }
                );
              }
            }
          );
        } else {
          // console.log("ALREADY_LOGGED" );
          resolve({ user, message: "ALREADY_LOGGED" });

        }
      },
      (error) => {
        // console.log("getLoggedinUser failed with exception:", { error });
        reject(error);
      }
    );
  });
};

const createUserCometChat = (id, key, name) => {
  const user = new CometChat.User(id);

  user.setName(name);

  return new Promise((resolve, reject) => {
    CometChat.createUser(user, key).then(
      (user) => {
        // console.log("user created", user);
        resolve(user)
      },
      (error) => {
        // console.log("error", error);
        reject(error)
      }
    );
  }) 
};

const retrieveGroupChat = (guid) => {
  return new Promise((resolve, reject) => {
    CometChat.getGroup(guid).then(
      (group) => {
        // console.log("Group details fetched successfully:", group);
        if (!group.hasJoined) {
          joinGroupChat().then(
            group => {
              resolve(group);
            }
          );
        }else{
         resolve(group);
        }
      },
      (error) => {
        // console.log("Group details fetching failed with exception:", error);
        if (error.code === "ERR_GUID_NOT_FOUND") {
          createGroupChat();
        }
        reject(error);
      }
    );
  });
};

const createGroupChat = () => {
  const group = new CometChat.Group(GUID, GROUP_NAME, groupType, password);

  CometChat.createGroup(group).then(
    (group) => {
      // console.log("Group created successfully:", group);
      retrieveGroupChat(GUID);
    },
    (error) => {
      // console.log("Group creation failed with exception:", error);
    }
  );
};


export const groupListener = (listenerID) => {
  return new Promise(res => {CometChat.addGroupListener(
    listenerID,
    new CometChat.GroupListener({
      onMemberAddedToGroup: (message, userAdded, userAddedBy, userAddedIn) => {
        res({
          message,
          userAdded,
          userAddedBy,
          userAddedIn,
        })
      },
      onGroupMemberJoined: (message, joinedUser, joinedGroup) => {
        res({ message, joinedUser, joinedGroup });
      }
    })
  );}) 
};

const joinGroupChat = () => {
  return new Promise((resolve, reject) => {
    CometChat.joinGroup(GUID, groupType, password).then(
      (group) => {
        // console.log("Group joined successfully:", group);
        resolve(group)
      },
      (error) => {
        // console.log("Group joining failed with exception:", error);
        reject(error)
      }
    );
  })
  
};

export const sentMessage = (messageText, guid) => {
  const receiverID = guid;
  const receiverType = CometChat.RECEIVER_TYPE.GROUP;

  const textMessage = new CometChat.TextMessage(
    receiverID,
    messageText,
    receiverType
  );
  return new Promise((resolve, reject) => {
    CometChat.sendMessage(textMessage).then(
      (message) => {
        // console.log("Message sent successfully:", message);
        resolve(message);
      },
      (error) => {
        // console.log("Message sending failed with error:", error);
        reject(error);
      }
    );
  });
};

export const fetchMessage = (limit, guid) => {
  const messagesRequest = new CometChat.MessagesRequestBuilder()
    .setLimit(limit)
    .setGUID(guid)
    .build();

    return messagesRequest;
};

export const getMessage = (request) => {
  return new Promise((res, rej) => {
    request.fetchPrevious().then(
      (messages) => {
        // console.log("Message list fetched:", messages);
        res(messages)
      },
      (error) => {
        console.log("Message fetching failed with error:", error);
        rej(error)
      }
    );
  })
  
};

export const messageListener = (listenerID) => {
  return new Promise((resolve) => {
    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (textMessage) => {
          resolve(textMessage);
        },
        onMediaMessageReceived: (mediaMessage) => {
          console.log("Media message received successfully", mediaMessage);
          resolve(mediaMessage);
        },
        onCustomMessageReceived: (customMessage) => {
          console.log("Custom message received successfully", customMessage);
          resolve(customMessage);
        },
      })
    );
  });
};




export const logoutCometchat = () => {
  
  return new Promise ((resolve, reject) => CometChat.logout().then( () => {
  // console.log("Logout completed successfully");
  resolve({message : 'logout_success'})
},error=>{
  //Logout failed with exception
  // console.log("Logout failed with exception:",{error});
  reject(error)
})) 
}


export const localMessage = (uid) => {
  const randNUM = Math.random() * 100000000000;
  const id = `${uid}-${randNUM}`;
  return {
    id,
    sender : {
      uid,
      sentAt : null
    },
    category : "message"
  }
}

export const getLocalMessage = (id, oldData, newVal) => {
  const newData =  oldData.map(val => {
    if (val.id === id) val = newVal
    return val;
  })
  return newData;
}