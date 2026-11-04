# FRONTEND

FROM node:24-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend .

RUN npm run build

# BACKEND

FROM node:24-alpine

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm ci

COPY backend .

COPY --from=frontend /app/frontend/dist ./public

# Install dependencies

WORKDIR /app/setup

COPY setup .

RUN sh uvx/install.sh

ENV PATH="/root/.local/bin:$PATH"

# Start the application

WORKDIR /app/backend

CMD ["npm", "start"]