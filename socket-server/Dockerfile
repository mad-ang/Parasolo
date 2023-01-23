# syntax=docker/dockerfile:1
FROM node:19.3-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./server/tsconfig.server.json", "./"]
RUN yarn install 
COPY . .
RUN yarn build
EXPOSE 5002
CMD ["yarn", "start"]