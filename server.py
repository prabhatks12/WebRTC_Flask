"""
DESCRIPTION:
    This python file will be used as the server which will be connected with client.js using SocketIO.
    The connection is Peer to Peer. Thus at any point, only two users can chat or video call. 
"""

# importing all the libraries
from flask import Flask, render_template, request, session, redirect, url_for
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO
import pandas as pd
import numpy as np
import json


app = Flask(__name__)
bootstrap=Bootstrap(app)
socketio=SocketIO(app)

app.config['SECRET_KEY']="MY_KEY"
users={}


"""
*******************************************************************
    ALL ROUTE FUNCTIONS 
*******************************************************************
"""

# registration for new users, using user_name and user_email
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        user_name = request.form.get("user_name")
        user_email = request.form.get("user_email")
        session['user_name'] = user_name
        session['user_email'] = user_email
        return  redirect(url_for('message'))
    return render_template('register.html')


# loading HTML page for chatting with users 
@app.route('/message')
def message():
    try:
        return render_template('message.html', user_name = session['user_name'],  user_email = session['user_email'])
    except:
        return redirect(url_for('login'))

# loading HTML page for video calling with users 
@app.route('/videoCall')
def videoCall():
    try:
        return render_template('videoCall.html', user_name = session['user_name'],  user_email = session['user_email'])
    except:
        return redirect(url_for('login'))

# loading HTML page for video calling with users 
@app.route('/logout')
def logout():
    try:
        session.pop('user_name')
        session.pop('user_email')
        return redirect(url_for('login'))
    except:
        return redirect(url_for('login'))


"""
*******************************************************************
    SOCKETIO FUNCTIONS
*******************************************************************
"""

# to check for connection establishment of client and server
@socketio.on('connected')
def onConnection(message):    
    print("connected : ",message)


""" 
To handle messages emitted by client.js for identifying and establishing connection between two peers.
This includes offers, answers and identifying candidates.
"""
@socketio.on('message')
def onMessage(msg):
    data = json.loads(msg)
    print("[onMessage] All data : ", data)

    # if a new peer is conneted to the sever
    if(data['type']=='register'):
        user_name = data['user_name']
        users[user_name] = request.sid
        print("[onMessage] emit displayAvailableUsers", users)
        socketio.emit('displayAvailableUsers', json.dumps(users))

        # elif data['purpose'] == 'videoCall':
        #     print("[onMessage] emit displayUsersForCall", users)
        #     socketio.emit('displayUsersForCall', json.dumps(users))

    # handling offer andwers and candiates
    elif(data['type'] == 'offer'):
        socketio.emit('offerReceived', json.dumps({'type': "offer", 'offer': data['offer']
        ,'receiver': data['receiver'], 'sender':data['sender'], 'senderid': users.get(data['sender'])}), room = users.get(data['receiver']))

    elif(data['type'] == 'answer'):
        socketio.emit('answerReceived', json.dumps({'type': "answer", 'answer': data['answer'], 'sender': data['sender']}), room = users.get(data['receiver']))

    elif(data['type'] == 'candidate'):
        socketio.emit('candidateReceived', json.dumps({'type': "candidate", 'candidate': data['candidate']}), room = data['user'])


if(__name__=='__main__'):
	socketio.run(app, debug=True)
    # host = your ipv4
