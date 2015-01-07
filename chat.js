var Users = [];
var Messages = [];
var _ = R;

var UsersList = React.createClass({
  render: function(){
    var renderUser = function(user){
      return <li> { user} </li>
    };
    return (
      <div class='users'>
      <h3> Online Users </h3>
      <ul>{ this.props.users.map(renderUser)} </ul>
      </div>
    );
  }
});

var Message = React.createClass({
  render: function(){
    return(
      <div class="message">
      <strong>{this.props.user}</strong> :
        {this.props.text}
      </div>
    )
  }
});

var MessageList = React.createClass({
  render: function(){
    var renderMessage = function(message){
      return <Message user={message.user} text={message.text} />
    }
    return (
      <div class='messages'>
      <h2> Conversation: </h2>
      { this.props.messages.map(renderMessage)}
      </div>
    );
  }
});

var MessageForm = React.createClass({

  getInitialState: function(){
    return {text: ''};
  },

  handleSubmit: function(e){
    e.preventDefault();
    var message = {
      text: this.state.text
    }
    console.log(message);
    this.props.onMessageSubmit(message); 
    this.setState({ text: '' });
  },

  changeHandler: function(e){
    this.setState({ text: e.target.value });
  },

  render: function(){
    return(
      <div class='message_form'>
      <h3>Write New Message</h3>
      <form onSubmit={this.handleSubmit}>
      <input onChange={this.changeHandler} value={this.state.text} />
      </form>
      </div>
    );
  }
});

var ChatApp = React.createClass({

  getDefaultProps: function() {
    return {
      "history_count": 10,
      "user": "anonymous"
    };
  },

  getInitialState: function(){
    var routes = {
        'message': this.messageReceive.bind(this),
        'join': this.userJoined.bind(this),
        'left': this.userLeft.bind(this)
      },
      route = function(e) {
        var evnt = JSON.parse(e);
        routes[evnt.event](evnt.data);
      };

    this.props.pubnub.subscribe({channel: this.props.channel, message: route})
 
    this.props.pubnub.history({
      channel: this.props.channel,
      count: this.props.history_count,
      callback: this.messagesReceive.bind(this)
    });

    return {users: [], messages:[], text: ''};
  },

  emit: function (event, data) {
    this.props.pubnub.publish({
      channel: this.props.channel,
      message: JSON.stringify({user: this.props.user, event: event, data: data})
    });
  },

  initialize: function(data){
    Users = data.users;
    this.setState({ users: Users, user: data.name});
  },

  messageReceive: function(message){
    Messages.push(message);
    this.setState({ messages: Messages });
  },

  messagesReceive: function(messages){
    Messages = _.pluck('data', messages[0]);
    this.setState({ messages: Messages });
  },

  userJoined: function(data){
    Users.push(data.name);
    Messages.push({
      user: this.props.user,
      text: data.name +' Joined'
    });
    this.setState({ users: Users, messages: Messages});
  },

  userLeft: function(data){
    var index = Users.indexOf(data.name);
    Users.splice(index, 1);
    Messages.push({
      user: 'APLICATION BOT',
      text: data.name +' Left'
    });
    this.setState({ users: Users, messages: Messages});
  },

  handleMessageSubmit: function(message){
    this.emit("message", message);
  },

  render: function(){
    return (
      <div>
      <UsersList users={this.state.users} />
      <MessageList messages={this.state.messages} />
      <MessageForm onMessageSubmit={this.handleMessageSubmit} user={this.state.user} />
      </div>
    );
  }
});
