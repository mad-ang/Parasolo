# # syntax=docker/dockerfile:1

# FROM nginx
# WORKDIR /usr/share/react

# RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash -
# RUN apt-get install -y nodejs
# RUN npm install -g yarn
# COPY ["package.json", "package-lock.json","tscconfig.*","yarn.lock", "./"]
# ENV NODE_ENV=production
# RUN yarn
# COPY . .
# RUN yarn build

# RUN rm -r /usr/share/nginx/html/*

# RUN cp -a dist/. /usr/share/nginx/html

# CMD ["yarn", "dev"]
# syntax=docker/dockerfile:1
FROM node:19.3-alpine

ENV NODE_ENV=production \
    VITE_DEV_MODE=false \
    # VITE_SERVER=DEV \
    VITE_SERVER=PRO
    # VITE_SERVER_URL=www.momstown.link \
    # VITE_SERVER_URL=43.201.32.156:8080 \
    # VITE_SERVER_URL=momstown.herokuapp.com/ \
WORKDIR /app
COPY ["package.json", "package-lock.json*","tsconfig.*", "./"]
RUN yarn 
COPY . .
RUN yarn build
EXPOSE 5173
CMD ["yarn", "dev"]