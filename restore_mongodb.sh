#!/bin/bash

mongorestore -h localhost:27017 -d myBlog ./db-copy/myBlog
