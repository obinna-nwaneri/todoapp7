FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm install && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY .env ./.env
EXPOSE 4000
CMD ["node", "dist/main.js"]
