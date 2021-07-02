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

#running the project
python app.py

#or
flask run
```

## Reference

1. [Flask-SocketIO Getting Started](https://flask-socketio.readthedocs.io/en/latest/getting_started.html)

## Results
Displaying the messages for `first` client

![Screenshot1](screenshots/working1.png "ScreenShot")

Displaying the messages for `second` client

![Screenshot2](screenshots/working2.png "ScreenShot")
