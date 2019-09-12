from flask import Flask,render_template,request,session
from flask_bootstrap import Bootstrap
import pandas as pd
import numpy as np
from flask_socketio import SocketIO
import json
app=Flask(__name__)
bootstrap=Bootstrap(app)
socketio=SocketIO(app)

app.config['SECRET_KEY']="MY_KEY"
user={}

@app.route('/')
def login():
    return render_template('message.html')

#to check for connection
@socketio.on('connected')
def onConnection(message):
    print(message)

@socketio.on('message')
def onMessage(msg):
    data = json.loads(msg)
    if(data['type']=='register'):
        name=data['user']
        user[name]=request.sid
        socketio.emit('availableUsers',json.dumps(user))

    elif(data['type']=='offer'):
        socketio.emit('offerReceived',json.dumps({'type':"offer",'offer':data['offer']
        ,'receiver':data['receiver'],'sender':data['sender'],'senderid':user.get(data['sender'])}),room=user.get(data['receiver']))

    elif(data['type']=='answer'):
        socketio.emit('answerReceived',json.dumps({'type':"answer",'answer':data['answer'],'sender':data['sender']}),room=user.get(data['receiver']))

    elif(data['type']=='candidate'):
        socketio.emit('candidateReceived',json.dumps({'type':"candidate",'candidate':data['candidate']}),room=data['user'])


if(__name__=='__main__'):
	socketio.run(app)
