FROM node:16-alpine

RUN mkdir -p /usr/src/app

COPY . /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN apk update \
&& apk add --virtual build-dependencies \
build-base \
gcc \
wget \
git 

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN npm install
RUN npm run prisma:generate
RUN npm run build
RUN npm run start
