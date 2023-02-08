# syntax=docker/dockerfile:1
FROM node:19.3-alpine

ENV NODE_ENV=production \
    BCRYPT_SALT_ROUNDS=8 \
    expiresInSec=1h \
    
WORKDIR /usr/src/app
COPY ["package.json", "./server/tsconfig.server.json", "./"]
RUN yarn install 
COPY . .
RUN yarn build
EXPOSE 3001
CMD ["yarn", "start"]