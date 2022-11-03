FROM node:16-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install
RUN npm ci --only=production
RUN prisma generate
RUN npm run build
RUN npm run start
