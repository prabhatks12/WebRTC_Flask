
const socket=io();
let connection = null;
let sendChannel=null;
let receiveChannel=null;

socket.on('connect',function(){
    console.log("connected");
    socket.emit('connected','SocketIO connected on flask side');
});

// JSON.stringify to convert both keys and value inside json to string
const sendMessage = message => {
    socket.send(JSON.stringify(message))
}

// 1.2. Registering User And WebRTC Connection
function registerUser(){
    var user=document.getElementById("user").value;
    document.getElementById('socketio').style.display="block";

    sendMessage({
      type: 'register',
      user: user
    })

    // url is deprecated , so urls instead with [] on stun
    const configuration = {
      iceServers: [{ urls: ['stun:stun2.1.google.com:19302'] }]
    }

    connection = new RTCPeerConnection(configuration);

    sendChannel = connection.createDataChannel("sendChannel");

    // this is where we are sending messages when connection is open
    sendChannel.onopen = (event) => {
      console.log("send channel opened");
      sendChannel.send("connected");

    };

    sendChannel.onclose = (event) => {
      console.log("send channel closed");
    };

    connection.ondatachannel = (event) => {

    console.log("Other created data channel");

    // receiving the message here under event.data
    receiveChannel = event.channel;
    receiveChannel.onmessage = (event) => {
    console.log("heere",event.data);
    document.getElementById("dispalyMessage").innerHTML+=event.data+"<br>";
    }
    };

    // change required for localStorage alternate
    // connection established for candidate here and listening for messages
    connection.onicecandidate = event => {
      user=document.getElementById("user").value;
      console.log("event:",event.candidate);
      if (event.candidate) {
        sendMessage({
          type: 'candidate',
          candidate: event.candidate,
          user:localStorage.getItem(user+'destid')
        })
      }
    }

}

// 2. Displaying all clients
socket.on('availableUsers',function(msg){
    localStorage.clear();
    localStorage.setItem('message',msg);
    var table='<tr><th>Name</th><th>Sid</th><th>Start Chat</th></tr>';
    obj=JSON.parse(msg);
    user=document.getElementById("user").value;
    for(name in obj)
    {
      if(user==name)
      table+='<tr><td>'+name+'</td><td>'+obj[name]+'</td><td>You</td></tr>';
      else
      table+='<tr><td>'+name+'</td><td>'+obj[name]+'</td><td><button class="blue_button" onclick=\'chatWith("'+name+'","'+obj[name]+'")\'>Chat</button></td></tr>';
    }
    document.getElementById("table").innerHTML=table;
});

// Generating Offer
function chatWith(name,id){

    user=document.getElementById("user").value;
    localStorage.setItem(user+'destid',id);

    connection.createOffer(
    offer => {
      sendMessage({
        type: 'offer',
        offer: offer,
        sender: user,
        receiver: name
      })

    connection.setLocalDescription(offer)
    },

    error => {
      alert('Error when creating an offer');
      console.error(error);
      }
  );
}

// Generating Answer
socket.on('offerReceived',function(msg){

    console.log(msg);
    data=JSON.parse(msg);
    user=document.getElementById("user").value;

    connection.setRemoteDescription(new RTCSessionDescription(data['offer']));
    console.log("remote description set");
    connection.createAnswer(

      answer => {
      connection.setLocalDescription(answer)
      sendMessage({
        type: 'answer',
        answer: answer,
        receiver: data['sender'],
        sender: data['receiver']
      })
      },
      error => {
      alert('Error when creating an answer')
      console.error(error)
    });
});

// Setting up RTCSessionDescription with answer
socket.on('answerReceived',function(msg){
    console.log(msg);
    data=JSON.parse(msg);
    connection.setRemoteDescription(new RTCSessionDescription(data['answer']));
    console.log("connection",connection);
});

// Setting up RTCSessionDescription with candidate
socket.on('candidateReceived',function(msg){
  console.log(msg);
  data=JSON.parse(msg);
  connection.addIceCandidate(new RTCIceCandidate(data['candidate']));
});

// change here to close the connection
// connection closed
function close() {
  console.log("closed");
  connection.close();
  connection.onicecandidate = null;
  connection.onaddstream = null;
}

// Send message to other client when the connection is established
function message(){
  msg=document.getElementById("sendMessageText").value;
  user=document.getElementById("user").value;
  sendChannel.send(user+" : "+msg);
  document.getElementById("dispalyMessage").innerHTML+="You: "+msg+"<br>";
}
