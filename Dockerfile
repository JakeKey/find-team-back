FROM node:14-alpine

RUN mkdir -p /usr/app
WORKDIR /usr/app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm install 

EXPOSE 3003
CMD npm run build && npm run start-prod