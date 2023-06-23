FROM node:19 AS base

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile --production

RUN npm run build

COPY . .

COPY ./dist ./dist

CMD ["node", "dist/main"]
