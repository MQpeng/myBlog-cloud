#!/bin/bash

mongodump -h localhost:27017 -d myBlog -o ./db-copy
