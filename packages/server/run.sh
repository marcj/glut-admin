#!/bin/sh

redis-server &

mongod &

node dist/main.js

# NODE_PRESERVE_SYMLINKS=1 ./node_modules/.bin/nodemon \
# --watch dist --watch node_modules/@marcj/glut-server/dist dist/main.js
