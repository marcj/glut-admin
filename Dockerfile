FROM node:11-alpine AS build

RUN npm install -g lerna npm-local-development

ADD ./lerna.json /app/
ADD ./package.json /app/

ADD ./packages/core/package.json /app/packages/core/
ADD ./packages/core/yarn.lock /app/packages/core/

ADD ./packages/frontend/package.json /app/packages/frontend/
ADD ./packages/frontend/yarn.lock /app/packages/frontend/

ADD ./packages/server/package.json /app/packages/server/
ADD ./packages/server/yarn.lock /app/packages/server/

RUN cd /app && npm run bootstrap

ADD ./packages /app/packages

RUN cd /app && npm-local-development --no-watcher

RUN cd /app/packages/frontend && ./node_modules/.bin/ng build --prod

RUN cd /app/packages/server && npm run build

RUN rm -r /app/packages/core

RUN cd /app/packages/frontend && rm -r node_modules/@glut && npm prune --production
RUN cd /app/packages/server && rm -r node_modules/@glut && npm prune --production


FROM node:11-alpine

EXPOSE 8080

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.8/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.8/community' >> /etc/apk/repositories
RUN apk --no-cache add tzdata redis mongodb
RUN mkdir -p /data/db

COPY --from=build /app /app

WORKDIR /app/packages/server

CMD sh run.sh

