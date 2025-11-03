import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from '../../features/WebSocketProvider';

const ChatWrapper = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { subscribeToMessages, sendMessage } = useWebSocketContext();

  // Sample data from template
  const contacts = [
    { id: 1, name: 'Hurin Seary', avatar: 'images/user-8.png', badge: '2', status: 'badge-primary' },
    { id: 2, name: 'Victor Exrixon', avatar: 'images/user-7.png', status: 'bg-success' },
    { id: 3, name: 'Surfiya Zakir', avatar: 'images/user-6.png', status: 'bg-warning' },
    { id: 4, name: 'Goria Coast', avatar: 'images/user-5.png', status: 'bg-success' },
    { id: 5, name: 'Hurin Seary', avatar: 'images/user-4.png', time: '4:09 pm' },
    { id: 6, name: 'David Goria', avatar: 'images/user-3.png', time: '2 days' },
    { id: 7, name: 'Seary Victor', avatar: 'images/user-2.png', status: 'bg-success' },
    { id: 8, name: 'Ana Seary', avatar: 'images/user-12.png', status: 'bg-success' },
  ];

  const groups = [
    { id: 1, name: 'Studio Express', initials: 'UD', gradient: 'bg-primary-gradiant', time: '2 min' },
    { id: 2, name: 'Armany Design', initials: 'UD', gradient: 'bg-gold-gradiant', status: 'bg-warning' },
    { id: 3, name: 'De fabous', initials: 'UD', gradient: 'bg-mini-gradiant', status: 'bg-success' },
  ];

  const pages = [
    { id: 1, name: 'Armany Seary', initials: 'UD', gradient: 'bg-primary-gradiant', status: 'bg-success' },
    { id: 2, name: 'Entropio Inc', initials: 'UD', gradient: 'bg-gold-gradiant', status: 'bg-success' },
  ];

  // Simulate loading and fetch messages
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (selectedUser) {
        setMessages([
          { id: 1, user: selectedUser.name, message: `Salut de ${selectedUser.name} !`, time: '2 min', avatar: selectedUser.avatar, isMe: false },
          { id: 2, user: 'Moi', message: 'Salut ! Comment ça va ?', time: '1 min', avatar: 'images/profile-4.png', isMe: true },
        ]);
      }
    }, 2000);

    let unsubscribe;
    if (selectedUser) {
      unsubscribe = subscribeToMessages?.(selectedUser.id, (newMsg) => {
        setMessages((prev) => [...prev, {
          id: newMsg.id,
          user: newMsg.senderName || selectedUser.name,
          message: newMsg.content,
          time: newMsg.timestamp || new Date().toLocaleTimeString(),
          avatar: newMsg.senderAvatar || selectedUser.avatar,
          isMe: newMsg.isMe || false,
        }]);
      });
    }

    return () => {
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [selectedUser, subscribeToMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'Moi',
        message: newMessage,
        time: new Date().toLocaleTimeString(),
        avatar: 'images/profile-4.png',
        isMe: true,
      };
      setMessages([...messages, message]);
      sendMessage?.(selectedUser.id, newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleUserClick = (e, user) => {
    e.preventDefault();
    setSelectedUser(user);
    setMessages([]);
    setIsLoading(true);
  };

  const handleBackToContacts = (e) => {
    e.preventDefault();
    setSelectedUser(null);
    setMessages([]);
  };

  return (
    <>
      {/* Friends List */}
      {!selectedUser && (
        <div className="right-chat nav-wrap mt-2 right-scroll-bar" role="dialog" aria-label="Friends list">
          <div className="middle-sidebar-right-content bg-white shadow-xss rounded-xxl">
            {/* Loader */}
            {isLoading ? (
              <div className="preloader-wrap p-3">
                <div className="box shimmer">
                  <div className="lines">
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                  </div>
                </div>
                <div className="box shimmer mb-3">
                  <div className="lines">
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                  </div>
                </div>
                <div className="box shimmer">
                  <div className="lines">
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                    <div className="line s_shimmer"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Contacts Section */}
                <div className="section full pe-3 ps-4 pt-4 position-relative feed-body">
                  <h4 className="font-xsssss text-grey-500 text-uppercase fw-700 ls-3">CONTACTS</h4>
                  <ul className="list-group list-group-flush">
                    {contacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="bg-transparent list-group-item no-icon pe-0 ps-0 pt-2 pb-2 border-0 d-flex align-items-center"
                        role="button"
                        aria-label={`Chat with ${contact.name}`}
                      >
                        <figure className="avatar float-left mb-0 me-2">
                          <img src={contact.avatar} alt={contact.name} className="w35" />
                        </figure>
                        <h3 className="fw-700 mb-0 mt-0">
                          <a
                            className="font-xssss text-grey-600 d-block text-dark model-popup-chat"
                            href="#"
                            onClick={(e) => handleUserClick(e, contact)}
                          >
                            {contact.name}
                          </a>
                        </h3>
                        {contact.badge && (
                          <span className={`badge badge-pill fw-500 mt-0 ${contact.status}`}>
                            {contact.badge}
                          </span>
                        )}
                        {contact.time && (
                          <span className="badge mt-0 text-grey-500 badge-pill pe-0 font-xsssss">
                            {contact.time}
                          </span>
                        )}
                        {contact.status && !contact.badge && !contact.time && (
                          <span className={`ms-auto btn-round-xss ${contact.status}`}></span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Groups Section */}
                <div className="section full pe-3 ps-4 pt-4 pb-4 position-relative feed-body">
                  <h4 className="font-xsssss text-grey-500 text-uppercase fw-700 ls-3">GROUPS</h4>
                  <ul className="list-group list-group-flush">
                    {groups.map((group) => (
                      <li
                        key={group.id}
                        className="bg-transparent list-group-item no-icon pe-0 ps-0 pt-2 pb-2 border-0 d-flex align-items-center"
                        role="button"
                        aria-label={`View group ${group.name}`}
                      >
                        <span className={`btn-round-sm ${group.gradient} me-3 ls-3 text-white font-xssss fw-700`}>
                          {group.initials}
                        </span>
                        <h3 className="fw-700 mb-0 mt-0">
                          <a
                            className="font-xssss text-grey-600 d-block text-dark model-popup-chat"
                            href="#"
                            onClick={(e) => e.preventDefault()}
                          >
                            {group.name}
                          </a>
                        </h3>
                        {group.time && (
                          <span className="badge mt-0 text-grey-500 badge-pill pe-0 font-xsssss">
                            {group.time}
                          </span>
                        )}
                        {group.status && !group.time && (
                          <span className={`ms-auto btn-round-xss ${group.status}`}></span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pages Section */}
                <div className="section full pe-3 ps-4 pt-0 pb-4 position-relative feed-body">
                  <h4 className="font-xsssss text-grey-500 text-uppercase fw-700 ls-3">PAGES</h4>
                  <ul className="list-group list-group-flush">
                    {pages.map((page) => (
                      <li
                        key={page.id}
                        className="bg-transparent list-group-item no-icon pe-0 ps-0 pt-2 pb-2 border-0 d-flex align-items-center"
                        role="button"
                        aria-label={`View page ${page.name}`}
                      >
                        <span className={`btn-round-sm ${page.gradient} me-3 ls-3 text-white font-xssss fw-700`}>
                          {page.initials}
                        </span>
                        <h3 className="fw-700 mb-0 mt-0">
                          <a
                            className="font-xssss text-grey-600 d-block text-dark model-popup-chat"
                            href="#"
                            onClick={(e) => e.preventDefault()}
                          >
                            {page.name}
                          </a>
                        </h3>
                        {page.status && (
                          <span className={`ms-auto btn-round-xss ${page.status}`}></span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          {/* Close Button */}
          <a
            href="#"
            onClick={onClose}
            className="p-2 text-center ms-auto menu-icon position-absolute top-0 end-0"
            aria-label="Close friends list"
          >
            <i className="feather-x font-xl text-grey-900"></i>
          </a>
        </div>
      )}

      {/* Chat Popup */}
      {selectedUser && (
        <div className="modal-popup-chat" role="dialog" aria-label={`Chat with ${selectedUser.name}`}>
          <div className="modal-popup-wrap bg-white shadow-xss rounded-xxl p-4">
            {/* Chat Header */}
            <div className="modal-popup-header w-100 border-bottom">
              <div className="card p-3 d-flex align-items-center">
                <figure className="avatar me-2">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w35 rounded-circle" />
                </figure>
                <h5 className="fw-700 text-grey-900 font-xssss mt-1 mb-0">
                  {selectedUser.name}
                </h5>
                <span className={`ms-auto btn-round-xss ${selectedUser.status || 'bg-grey'}`}></span>
                <a
                  href="#"
                  onClick={handleBackToContacts}
                  className="p-2 text-center ms-3 menu-icon"
                  aria-label="Back to friends list"
                >
                  <i className="feather-arrow-left font-xl text-grey-900"></i>
                </a>
                <a
                  href="#"
                  onClick={onClose}
                  className="p-2 text-center ms-3 menu-icon"
                  aria-label="Close chat"
                >
                  <i className="feather-x font-xl text-grey-900"></i>
                </a>
              </div>
            </div>

            {/* Chat Body */}
            <div className="modal-popup-body w-100 p-3 h-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {isLoading ? (
                <div className="preloader-wrap p-3">
                  <div className="box shimmer">
                    <div className="lines">
                      <div className="line s_shimmer"></div>
                      <div className="line s_shimmer"></div>
                      <div className="line s_shimmer"></div>
                      <div className="line s_shimmer"></div>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-${msg.isMe ? 'self' : 'other'} p-3 d-flex align-items-start mb-3 ${
                      msg.isMe ? 'justify-content-end' : ''
                    }`}
                  >
                    {!msg.isMe && (
                      <figure className="avatar me-2">
                        <img src={msg.avatar} alt={msg.user} className="w35 rounded-circle" />
                      </figure>
                    )}
                    <div
                      className={`message-content bg-${msg.isMe ? 'primary-gradiant text-white' : 'greylight'} p-3 rounded-3`}
                      style={{ maxWidth: '70%' }}
                    >
                      <h6 className="font-xssss fw-700 mb-1">{msg.user}</h6>
                      <p className="font-xssss mb-0">{msg.message}</p>
                      <span className="font-xsssss text-grey-500 mt-1 d-block">{msg.time}</span>
                    </div>
                    {msg.isMe && (
                      <figure className="avatar ms-2">
                        <img src={msg.avatar} alt={msg.user} className="w35 rounded-circle" />
                      </figure>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Footer */}
            <div className="modal-popup-footer w-100 border-top">
              <div className="card p-3">
                <div className="form-group mb-0 icon-input">
                  <i className="feather-edit font-sm text-grey-400"></i>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="bg-grey border-0 lh-32 pt-2 pb-2 ps-5 pe-3 font-xssss fw-500 rounded-xl w-100"
                    aria-label="Message input"
                  />
                  <a
                    href="#"
                    onClick={handleSendMessage}
                    className="p-2 text-center ms-3 menu-icon"
                    aria-label="Send message"
                  >
                    <i className="feather-send font-xl text-current"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWrapper;