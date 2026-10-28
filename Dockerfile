
# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Stage 2: Create the smaller runtime image
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json app.js ./

USER node

EXPOSE 3000

CMD ["node", "app.js"]
