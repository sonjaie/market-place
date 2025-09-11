# syntax=docker/dockerfile:1.7

# 1) Builder: install deps and build
FROM node:20-alpine AS builder
WORKDIR /app

# Install OS deps
RUN apk add --no-cache libc6-compat

# Install deps first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Ensure Next can read env at build time if needed
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=$NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET

RUN npm run build

# 2) Runner: minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy only what we need to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Next runtime envs (redefine to allow overriding at run time)
ENV NEXT_PUBLIC_SUPABASE_URL="" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="" \
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET="listing-images"

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]


