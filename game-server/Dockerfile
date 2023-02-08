# syntax=docker/dockerfile:1
FROM node:19.3-alpine

ENV NODE_ENV=production \
    BCRYPT_SALT_ROUNDS=8 \
    PORT=8080 \
    SOCKET_PORT=5002 \
    expiresInSec=1h \


WORKDIR /usr/src/app
COPY ["package.json", "./server/tsconfig.server.json", "./"]
RUN yarn install 
COPY . .
RUN yarn build
EXPOSE 8080
CMD ["yarn", "start"]