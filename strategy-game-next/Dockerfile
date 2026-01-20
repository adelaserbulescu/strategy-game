# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_USER_API
ARG NEXT_PUBLIC_CHAT_API
ARG NEXT_PUBLIC_CHAT_URL

ENV NEXT_PUBLIC_USER_API=$NEXT_PUBLIC_USER_API
ENV NEXT_PUBLIC_CHAT_API=$NEXT_PUBLIC_CHAT_API
ENV NEXT_PUBLIC_CHAT_URL=$NEXT_PUBLIC_CHAT_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- run ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
