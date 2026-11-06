ARG NPM_REGISTRY=https://nexus.awsinternal.mediaset.es/repository/npm-group/
ARG APP_LOCATION=/usr/src/app

# Shared base (helper stage)
FROM 088427993007.dkr.ecr.eu-west-1.amazonaws.com/nodejs:22.21.0-trixie-slim_mdsv20260128170413 AS base
ARG APP_LOCATION
WORKDIR $APP_LOCATION
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl procps && \
    rm -rf /var/lib/apt/lists/*
COPY ["package.json", "package-lock.json", "./"]

# Development stage: run through docker compose, with ./src bind mounted for hot reload
FROM base AS development
ARG NPM_REGISTRY
ENV NODE_ENV=development
RUN npm ci --registry=$NPM_REGISTRY --ignore-scripts
COPY . .
CMD ["npm", "run", "dev"]

# Compiles the app and removes dev dependencies (helper stage)
FROM base AS builder
ARG NPM_REGISTRY
RUN npm ci --include=dev --registry=$NPM_REGISTRY --ignore-scripts
COPY . .
RUN npm run build && npm prune --omit=dev --registry=$NPM_REGISTRY

# Pre-production stage
FROM base AS preproduction
ARG APP_LOCATION
ENV NODE_ENV=production
COPY --from=builder $APP_LOCATION/dist ./dist
COPY --from=builder $APP_LOCATION/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]

# Production stage: keep it last so a build without --target produces this image
FROM base AS production
ARG APP_LOCATION
ENV NODE_ENV=production
COPY --from=builder $APP_LOCATION/dist ./dist
COPY --from=builder $APP_LOCATION/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
