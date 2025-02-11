FROM node:22-alpine as build
WORKDIR /usr/src/app
COPY package.json package-lock.json tsconfig.json .
RUN npm i

COPY ./src/  ./src
COPY ./prisma/  ./prisma

RUN npm run client
RUN npm run build

FROM node:22-alpine
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist .

COPY ../package.json package-lock.json .
COPY ../prisma/schema.prisma ./prisma/schema.prisma
COPY ../prisma/migrations ./prisma/migrations

COPY .env.docker .env

RUN npm ci --omit=dev
RUN npm run client

EXPOSE 80
ENTRYPOINT ["node", "--env-file=.env", "index.js"]
#[ENTRYPOINT ["tail", "-f", "/dev/null"]