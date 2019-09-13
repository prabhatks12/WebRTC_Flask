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

## Results
Displaying the messages for `first` client

![Alt text](screenshots/working1.png "ScreenShot")

Displaying the messages for `second` client

![Alt text](screenshots/working2.png "ScreenShot")
