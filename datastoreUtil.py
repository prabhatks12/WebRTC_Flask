from google.cloud import datastore
import pandas as pd
import numpy as np
import json
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"]  = "add your json file path"
datastore_client = datastore.Client()

def uniqueDetail(user_name, user_email):
    query = datastore_client.query(kind='user')
    all_data = query.fetch()
    user_names = []
    user_emails = []
    for data in all_data:
        user_names.append(data["name"])
        user_emails.append(data["email"])
    if user_name not in user_names and user_email not in user_emails:
        return True
    else:
        return False

def registerUser(user_name, user_email):
    try:
        entity = datastore.Entity(key=datastore_client.key('user'))
        entity.update({
            'name': user_name,
            'email' : user_email,
            'sid' : " "
        })
        datastore_client.put(entity)
        return True
    except:
        return False

def getUserSid(user_name):
    query = datastore_client.query(kind='user')
    all_data = query.fetch()
    for data in all_data:
        if data['name'] == user_name:
            return data["sid"]
    return None

def getUserData(user_name):
    query = datastore_client.query(kind='user')
    all_data = query.fetch()
    for data in all_data:
        if data['name'] == user_name:
            return data
    return None


def updateUserSid(user_name, user_sid):
    try:
        data = getUserData(user_name)
        if data != None:
            data["sid"] = user_sid
            entity = datastore.Entity(key=datastore_client.key('user'))	
            datastore_client.put(data)
            return True
    except:
        return False


