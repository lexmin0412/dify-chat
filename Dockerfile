# =================================================================
# Stage 1: Build the React application using a Node.js environment
# =================================================================
FROM node:23-alpine AS builder

# Install pnpm globally in the container
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definition files first to leverage Docker cache
# This is crucial for a monorepo setup
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy package.json from each workspace package
# This allows pnpm to resolve the workspace structure without copying all source code yet
COPY packages/theme/package.json ./packages/theme/
COPY packages/api/package.json ./packages/api/
COPY packages/components/package.json ./packages/components/
COPY packages/core/package.json ./packages/core/
COPY packages/docs/package.json ./packages/docs/
COPY packages/helpers/package.json ./packages/helpers/
COPY packages/server/package.json ./packages/server/
COPY packages/react-app/package.json ./packages/react-app/

# Install all dependencies for the entire monorepo
# Using --frozen-lockfile is a best practice for CI/CD
RUN pnpm install --frozen-lockfile

# Now copy the rest of the source code
COPY . .

# Run the build command specifically for the react-app package
# The --filter flag tells pnpm to only run the command in the specified package
# The output will be in /app/packages/react-app/dist
RUN pnpm build

# =================================================================
# Stage 2: Serve the application with a lightweight Nginx server
# =================================================================
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/dify-chat.conf

# Copy the built static files from the 'builder' stage
# The destination directory inside the Nginx container will be /usr/share/nginx/html/dify-chat
COPY --from=builder /app/packages/react-app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# The default command for the nginx image is to start the server in the foreground.
# CMD ["nginx", "-g", "daemon off;"]

