FROM node:16

RUN mkdir -p /usr/src/app

COPY . /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app




RUN npm install
RUN npm run prisma:generate
RUN npm run build
CMD ["npm", "run", "start"]
