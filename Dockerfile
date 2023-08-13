FROM nginx:alpine
COPY . /usr/share/nginx/html
# Set the default value for PORT environment variable
ENV PORT 8080
