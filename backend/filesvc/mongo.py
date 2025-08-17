# filesvc/mongo.py
from django.conf import settings
from pymongo import MongoClient
import gridfs

_client = MongoClient(settings.MONGO_URI)
_db = _client[settings.MONGO_DB]
_fs = gridfs.GridFS(_db, collection=settings.GRIDFS_BUCKET)

def db():
    return _db

def fs():
    return _fs