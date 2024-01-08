FROM node:21-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build && rm -rf node_modules

FROM nginx:1-alpine

COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

COPY --from=build /app/build /etc/nginx/html
