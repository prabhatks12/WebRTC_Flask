
var socket = io();
let connection = null;
let sendChannel=null;
let receiveChannel=null;
var videoRunning = false

socket.on('connect',function(){
    console.log("connected");
    socket.emit('connected','SocketIO connected on flask side');
});

// sending message to Flask after converting message to json and each item inside it as string
function sendMessage(message){
    socket.send(JSON.stringify(message))
}

// 1.2. Registering User And WebRTC Connection
function registerUser(user_name, user_email){
	console.log("[registerUser] name, email : " , user_name, user_email)

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

	console.log("[registerUser] configuration, connection", configuration, connection)
  // connection.ontrack = e =>{
  //   console.log("got data")
  //   videoElement.srcObject = e.streams[0];
    
  // }


	// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel 
	// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample
    sendChannel = connection.createDataChannel("sendChannel");

    // this is where we are sending messages when connection is open
    sendChannel.onopen = (event) => {
      console.log("send channel opened");
      sendChannel.send("connected");
      console.log("[registerUser] configuration, connection", configuration, connection)

    };

    sendChannel.onclose = (event) => {
      console.log("send channel closed");
    };

    connection.ondatachannel = (event) => {
    //frame()
    console.log("[registerUser] configuration, connection", configuration, connection)
		console.log("Other created data channel");

		// receiving the message here under event.data
		receiveChannel = event.channel;
		receiveChannel.onmessage = (event) => {
			console.log("receiveChannel", typeof(event.data));
			console.log("receiveChannel", event.data);
			console.log("receiveChannel", event);
      // if(event.data == "video"){
      //   frame()	
      // }
			if(typeof(event.data) == "string")
				document.getElementById("dispalyMessage").innerHTML+=event.data+"<br>";
		}
		
		
	};
	// video = document.querySelector("#othersVideoFeed")
	
    // change required for localStorage alternate
    // connection established for candidate here and listening for messages
    var videoe = document.querySelector("#userVideoFeed")
    var result = navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
      console.log("stream", stream)

      console.log("if condition")
      
      // videoCallStreamSend(stream)
      // connection.addStream(stream);
      stream.getTracks().forEach(function(track) {
        console.log("Adding track")
        connection.addTrack(track, stream);
        console.log("[manageVideoCall] connection", connection)
      })
      // connection.addStream(stream)
      videoe.srcObject = stream;
      videoRunning = true		
      console.log("done waiting2")
      // sendChannel.send("video")
    })  
    // connection.ontrack = e =>{
    //   // videoElement = document.querySelector("#othersVideoFeed")
    //   console.log("got data", e)
    //   // videoElement.srcObject = e.streams[0];
      
    // }
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

// function frame(){
//   console.log("till here")
//   videoElement = document.querySelector("#othersVideoFeed")

//   connection.ontrack = e => {
//     console.log("got data")
//     videoElement.srcObject = e.streams[0];
//     hangupButton.disabled = false;
//   }

//   connection.onaddstream = e => {
//     console.log("got data")
//     videoElement.srcObject = e.streams[0];
//     hangupButton.disabled = false;
//   }
//   connection.onaddtrack = e => {
//     console.log("got data")
//     videoElement.srcObject = e.streams[0];
//     hangupButton.disabled = false;   
//   }

// }

function manageVideoCall(){
	var video = document.querySelector("#userVideoFeed");	
	console.log("videoRunning", videoRunning)
	if (navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
			if(videoRunning == false){
				console.log("if condition")
				
				// videoCallStreamSend(stream)
        // connection.addStream(stream);
				stream.getTracks().forEach(function(track) {
					console.log("Adding track")
          connection.addTrack(track);
          console.log("[manageVideoCall] connection", connection)
				})
				// connection.addStream(stream)
				video.srcObject = stream;
				videoRunning = true		
        // sendChannel.send("video")
			}
			else{
				console.log("else condition")
				stream.getTracks().forEach(function(track) {
					track.stop();
				});		
				video.srcObject = null;
				video = false
				videoRunning = false;
			}
				
		})
		.catch(function (error) {
			console.log("[manageVideoCall] Error: ", error);
		});
	}	
}

// 2. Displaying all clients for chat
socket.on('displayAvailableUsers',function(msg){
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


// 2. Displaying all clients
socket.on('displayUsersForCall',function(msg){
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
      table+='<tr><td>'+name+'</td><td>'+obj[name]+'</td><td><button class="blue_button" onclick=\'videoCallWith("'+name+'","'+obj[name]+'")\'>VideoCall</button></td></tr>';
    }
    document.getElementById("table").innerHTML=table;
});

// Generating Offer
function chatWith(receiver, receiver_id){
	
    sender = document.getElementById("user").innerHTML;
    localStorage.setItem(sender+'destid',receiver_id);

  	console.log("[chatwith] sender, receiver, id : ", sender, receiver, receiver_id)
    
    // navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
		
		// 		console.log("if condition")
				
		// 		// videoCallStreamSend(stream)
    //     // connection.addStream(stream);
		// 		stream.getTracks().forEach(function(track) {
		// 			console.log("Adding track")
    //       connection.addTrack(track);
    //       console.log("[manageVideoCall] connection", connection)
		// 		})})

    // (async () => { 
      
     
  
//  })();
// const getResult = async () => {
//   return await asyncCall();
// }

// getResult().then(response => console.log(response));
 
    connection.createOffer(
    offer => {
      sendMessage({
        type: 'offer',
        offer: offer,
        sender: sender,
        receiver: receiver
      })
      // console.log("created offer")
    connection.setLocalDescription(offer)
    console.log("offer",offer)
    
    },
  
    error => {
      alert('Error when creating an offer');
      console.error(error);
      }
  );
}

// async function asyncCall() {
//   console.log("done waiting0")
//   var result = await navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
   
//       console.log("if condition")
      
//       // videoCallStreamSend(stream)
//       // connection.addStream(stream);
//       stream.getTracks().forEach(function(track) {
//         console.log("Adding track")
//         connection.addTrack(track);
//         console.log("[manageVideoCall] connection", connection)
//       })
//       // connection.addStream(stream)
//       // video.srcObject = stream;
//       videoRunning = true		
//       console.log("done waiting2")
//       // sendChannel.send("video")
//     })    
// }


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
    user=document.getElementById("user").innerHTML;
    
    connection.ontrack = e =>{
      try {
        videoElement = document.querySelector("#othersVideoFeed")
        // videoElement  = document.getElementById("userVideoFeed").srcObject
        console.log("got data", e)
        // console.log("video element",videoElement)
        console.log("steram", e.streams[0])
        videoElement.srcObject = e.streams[0];
        // document.getElementById("userVideoFeed").srcObject = e.streams[0];
        videoElement.onloadedmetadata = function(e) {
          videoElement.play();
        };
      } catch (err) {
        console.log("error,", err);
        }
      
    }
    
    connection.setRemoteDescription(new RTCSessionDescription(data['offer']));
    console.log("remote description set");
    // connection.ontrack = function(e) {
    //   console.log("got data")
    //   videoElement.srcObject = e.streams[0];
    //   // hangupButton.disabled = false;
    // }
  
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
    console.log("answer received")
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
	msg = document.getElementById("sendMessageText").value;
	user = document.getElementById("user").value;
	sendChannel.send(user+" : "+msg);
	document.getElementById("dispalyMessage").innerHTML+="You: "+msg+"<br>";
}

function videoCallStreamSend(stream){
	console.log("sending videoCall stream", stream)
	sendChannel.send(stream)
}
