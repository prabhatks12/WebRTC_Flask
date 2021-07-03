
var socket = io();
let connection = null;
let sendChannel = null;
let receiveChannel = null;
var videoRunning = true


socket.on('connect',function(){
    console.log("connected");
	message = {
		user_name : document.getElementById("user").innerHTML
	}
    socket.emit('connected', JSON.stringify(message));
});


// sending message to Flask after converting message to json and each item inside it as string
function sendMessage(message){
    socket.send(JSON.stringify(message))
}


// 1.2. Registering User And WebRTC Connection
function registerUser(user_name, user_email){
	console.log("[registerUser] name, email : " , user_name, user_email)

	document.getElementById('available_clients').style.display="block";
	document.getElementById('videoCall_navbar').className = "active"
    
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

	console.log("[registerUser] configuration, connection", configuration, connection)
    sendChannel = connection.createDataChannel("sendChannel");

    // this is where we are sending messages when connection is open
    sendChannel.onopen = (event) => {
      console.log("send channel opened");
      sendChannel.send("Video Call started");
      console.log("[registerUser] configuration, connection", configuration, connection)

    };

    sendChannel.onclose = (event) => {
      	console.log("send channel closed");
    };

    connection.ondatachannel = (event) => {
	    console.log("[registerUser] configuration, connection", configuration, connection)
		// receiving the message here under event.data
		receiveChannel = event.channel;
		receiveChannel.onmessage = (event) => {
			console.log("[receiveChannel] ", event.data);
			if(typeof(event.data) == "string"){
				document.getElementById("dispalyMessage").innerHTML = event.data+"<br>";		
				if(event.data.trim() == "Video Call ended")
					closeCall()		
			}		
		}
	};

	// adding videostream to the connection
    var videoUser = document.querySelector("#userVideoFeed")
    var result = navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
		console.log("[stream] ", stream)
		stream.getTracks().forEach(function(track) {
			console.log("Adding track")
			connection.addTrack(track, stream);
			console.log("[manageVideoCall] connection", connection)
		})
		videoUser.srcObject = stream;
		videoRunning = true		
    })  

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

// closing video call
function closeCall(){
	try{		
		const video = document.querySelector('#userVideoFeed');
		for (const track of video.srcObject.getTracks()) {
			track.stop();
		}		
		sendChannel.send("Video Call ended")
	}
	catch{
		closeConnection()
	}
		
}

// displaying all available clients for call
socket.on('displayAvailableUsers',function(msg){
    localStorage.clear();
    localStorage.setItem('message', msg);
    var table='<tr><th>Name</th><th>Sid</th><th>Start Call</th></tr>';
    obj = JSON.parse(msg);
    current_user = document.getElementById("user").innerHTML;
    for(user_name in obj)
    {
      if(current_user == user_name)
		table+='<tr><td>'+user_name+'</td><td>'+obj[user_name]+'</td><td>You</td></tr>';
      else
      	table+='<tr><td>'+user_name+'</td><td>'+obj[user_name]+'</td><td><button class="blue_button" onclick=\'videoCallWith("'+user_name+'","'+obj[user_name]+'")\'>VideoCall</button></td></tr>';
    }
    document.getElementById("table").innerHTML=table;
});


// generating Offer for videocall
function videoCallWith(receiver, receiver_id){	
    sender = document.getElementById("user").innerHTML;
    localStorage.setItem(sender+'destid',receiver_id);
  	console.log("[videoCallWith] sender, receiver, id : ", sender, receiver, receiver_id)    
    connection.createOffer(
	offer => {
		sendMessage({
			type: 'offer',
			offer: offer,
			sender: sender,
			receiver: receiver
		})
			connection.setLocalDescription(offer)
			console.log("offer",offer)    
		},  
		error => {
			console.error("[Error] Error when creating an offer ",error);
		}
  	);
}


// generating answer after receiving offer
socket.on('offerReceived',function(msg){
    console.log("[offerReceived] ",msg);
    data = JSON.parse(msg);
    user = document.getElementById("user").innerHTML;
    
    connection.ontrack = event =>{
		try {
			videoElement = document.querySelector("#othersVideoFeed")
			console.log("[connection.ontrack] steram", event.streams[0])
			videoElement.srcObject = event.streams[0];
			videoElement.onloadedmetadata = function(e) {
				videoElement.play();
			};
		} catch (error) {
			console.log("[Error] Error in setting steram,", error);
		}      
    }  

	connection.onunmute = event =>{
		console.log("unmute")
	}

	connection.onmute = event => {
		console.log("mute")
	}

	  
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
      		console.error("[Error] Error when creating an answer", error)
    	});
});


// setting up RTCSessionDescription with answer
socket.on('answerReceived',function(msg){
    console.log("[answerReceived] ", msg);
    data=JSON.parse(msg);
    connection.setRemoteDescription(new RTCSessionDescription(data['answer']));
});


// setting up RTCSessionDescription with candidate
socket.on('candidateReceived',function(msg){
	console.log("[candidateReceived] ", msg);
	data=JSON.parse(msg);
	connection.addIceCandidate(new RTCIceCandidate(data['candidate']));
});


// change here to close the connection
// connection closed
function closeConnection() {
	console.log("closed");
	connection.close();
	connection.onicecandidate = null;
	connection.onaddstream = null;
}