# WebRTC in `Flask` and `Javascript`

Creating a chat application which uses `WebRTC` connection for peer to peer communication. `Flask SocketIO` in only needed in initial stage for identifying the
clients, after that the peers or clients will communicate by themself.


## Developers Guideline
Type the following command based on your system to create the virtual enviornment in python.

```bash

#installing virutal environment

#for ubantu
python3 -m pip install --user virtualenv
#for windows
py -m pip install --user virtualenv

#creating instance of virtualenv
virtualenv venv

#activate virtualenv ubantu
source venv/bin/activate

#activate virtualenv ubantu
venv\Scripts\activate

#add the requirements
pip install -r requirements.txt

#running the on localhost 
python main.py

# running on gcloud 
# 1. create a new project on Google Cloud and copy its PROJECT ID
# 2. make sure you have app.yaml and requirements.txt

gcloud app create --project = [YOUR_PROJECT_ID]

# it will ask for a region for deployment
gcloud app deploy
```

## References

1. [Flask-SocketIO Getting Started](https://flask-socketio.readthedocs.io/en/latest/getting_started.html)
2. [RTCPeerConnection.createDataChannel()](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createDataChannel) 
3.	[A simple RTCDataChannel sample](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Simple_RTCDataChannel_sample)


## Results
Displaying the chatting feature for `both` client

![Screenshot1](screenshots/chat.png "ScreenShot")

Displaying the video calling feature for `both` client

![Screenshot2](screenshots/video.png "ScreenShot")

## Thank you
