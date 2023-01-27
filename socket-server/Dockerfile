# syntax=docker/dockerfile:1
FROM node:19.3-alpine

ENV NODE_ENV=production \
    BCRYPT_SALT_ROUNDS=8 \
    expiresInSec=1h \
    AWS_BUCKET_NAME=momstown-images \
    DB_HOST=mongodb+srv://suyeon:jeremy7474@cluster0.ixgejvq.mongodb.net/?retryWrites=true&w=majority \
    JWT_SECRET=KQd-3Kxc7k@JhzyxHEsgco \
    AWS_BUCKET_REGION=ap-northeast-2 \
    AWS_IDENTITY_POOL_ID=ap-northeast-2:eccb94fd-378e-403e-ac32-fa0c10efaeb8 \
    AWS_ACCESS_KEY_ID=AKIAX267OPWTSZTPTH4A \
    AWS_SECRET_ACCESS_KEY=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
WORKDIR /usr/src/app
COPY ["package.json", "./server/tsconfig.server.json", "./"]
RUN yarn install 
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]