FROM node:22.5.1 AS build
RUN mkdir -p /app
ADD  . /app/dify-chat
WORKDIR /app/dify-chat
RUN npm install pnpm -g
RUN pnpm install && \
    pnpm build
FROM nginx:stable AS dist
RUN mkdir /app
COPY --from=build /app/dify-chat/dist/ /app/dify-chat/
RUN  chmod -R +r /app/dify-chat/
RUN apt update && \
    apt install -y vim
