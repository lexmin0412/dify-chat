FROM node:22.0.0-bullseye AS build
RUN mkdir -p /app
ADD  . /app/dify-chat
WORKDIR /app/dify-chat
RUN corepack enable pnpm
RUN pnpm install && \
    pnpm build
FROM nginx:stable AS dist
RUN mkdir /app
COPY --from=build /app/dify-chat/dist/ /app/dify-chat/
RUN RUN chmod -R +r /app/dify-chat/
RUN apt update && \
    apt install -y vim

