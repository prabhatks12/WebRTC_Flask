
var socket = io();
let connection = null;
let sendChannel = null;
let receiveChannel = null;
var videoRunning = false

socket.on('connect',function(){
    console.log("connected");
    socket.emit('connected','SocketIO connected on flask side');
});

// sending message to Flask after converting message to json and each item inside it as string
function sendMessage(message){
    socket.send(JSON.stringify(message))
}

// registering user and WebRTC Connection
function registerUser(user_name, user_email){

	console.log("[registerUser] name, email : " , user_name, user_email)

	document.getElementById('chat_navbar').className = "active"

	document.getElementById('available_clients').style.display="block";    

	sendMessage({
		type: 'register',
		purpose: 'chat',
		user_name: user_name,
		user_email : user_email
    })

    // url is deprecated , so urls instead with [] on stun
    const configuration = {
      iceServers: [{ urls: ['stun:stun2.1.google.com:19302'] }]
    }	

	connection = new RTCPeerConnection(configuration);	
	sendChannel = connection.createDataChannel("sendChannel");

	console.log("[registerUser] configuration, connection", configuration, connection)

    // this is where we are sending messages when connection is open
    sendChannel.onopen = (event) => {
		console.log("send channel opened");
		sendChannel.send("connected");
		console.log("[registerUser] configuration, connection", configuration, connection)

    };
    
	sendChannel.onclose = (event) => {
      console.log("[onclose] send channel closed");
    };

	
	// data channel is the channel between two peers for chat, it supports String, blob, ArrayBuffer and ArrayBufferView data 
    connection.ondatachannel = (event) => {

		console.log("[receiveChannel] configuration, connection", configuration, connection)
		receiveChannel = event.channel;
		receiveChannel.onmessage = (event) => {
			console.log("[receiveChannel] event.data : ", event.data);
			if(typeof(event.data) == "string")
				document.getElementById("dispalyMessage").innerHTML+=event.data+"<br>";
		}				
	};
	
    // change required for localStorage alternate
    // connection established for candidate here and listening for messages
    connection.onicecandidate = event => {
		user = document.getElementById("user").innerHTML;
		// console.log("[onicecandidate] event:", event.candidate);
		if (event.candidate) {
			sendMessage({
				type: 'candidate',
				candidate: event.candidate,
				user:localStorage.getItem(user+'destid')
			})
		}
    }
}


// displaying all available users for chat
socket.on('displayAvailableUsers',function(msg){
    localStorage.clear();
    localStorage.setItem('message', msg);
    var table='<tr><th>Name</th><th>Sid</th><th>Start Chat</th></tr>';
    obj = JSON.parse(msg);
    current_username = document.getElementById("user").innerHTML;
	for(user_name in obj)
    {
      if(current_username.trim() == user_name.trim())
		table+='<tr><td>'+user_name+'</td><td>'+obj[user_name]+'</td><td>You</td></tr>';
      else
      	table+='<tr><td>'+user_name+'</td><td>'+obj[user_name]+'</td><td><button class="blue_button" onclick=\'chatWith("'+user_name+'","'+obj[user_name]+'")\'>Chat</button></td></tr>';
    }
    document.getElementById("table").innerHTML=table;
});


// generating Offer for chatting
function chatWith(receiver, receiver_id){	
    sender = document.getElementById("user").innerHTML;
    localStorage.setItem(sender+'destid',receiver_id);
  	console.log("[chatwith] sender, receiver, id : ", sender, receiver, receiver_id)
	connection.createOffer(
	offer => {
		sendMessage({
			type: 'offer',
			offer: offer,
			sender: sender,
			receiver: receiver
		})
		connection.setLocalDescription(offer)
		console.log("[createdOffer] ", offer)    
		},
		error => {
			alert('[Error] Not able to create offer');
			console.error(error);
		}
	);
}


// generating answer after receiving offer
socket.on('offerReceived',function(msg){
    console.log("[offerReceived] ", msg);
    data=JSON.parse(msg);
    connection.setRemoteDescription(new RTCSessionDescription(data['offer']));    
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
		alert('[Error] Not able tp create answer')
		console.error(error)
	});
});


// setting up RTCSessionDescription with answer
socket.on('answerReceived',function(msg){
    console.log("[answerReceived] ", msg)
    data = JSON.parse(msg);
    connection.setRemoteDescription(new RTCSessionDescription(data['answer']));
});


// setting up RTCSessionDescription with candidate
socket.on('candidateReceived',function(msg){
  console.log("[candidateReceived] ", msg);
  data=JSON.parse(msg);
  connection.addIceCandidate(new RTCIceCandidate(data['candidate']));
});


// closing the connection
function closeConnection() {
  connection.close();
  connection.onicecandidate = null;
  connection.onaddstream = null;
  console.log("[closeConnection] closed");
}


// send the message to other client when the connection is established
function message(){
	msg = document.getElementById("sendMessageText").value;
	user = document.getElementById("user").innerHTML;
	sendChannel.send(user + " : " + msg);
	document.getElementById("dispalyMessage").innerHTML+="You: "+msg+"<br>";
}