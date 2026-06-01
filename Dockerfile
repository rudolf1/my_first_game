# ── Build stage ──────────────────────────────────────────────────────────────
# Vite 8 uses Rolldown which contains platform-specific native binaries.
# We therefore run the JS build on the host (npm run build) and copy the
# resulting dist/ folder into the image, keeping the final image tiny.
#
# To rebuild before deploying:
#   npm install && npm run build
#   docker build -t quiz-game:latest .
#   docker stack deploy -c docker-compose.yml quiz
#
# ── Serve stage ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy the pre-built Vite production bundle
COPY dist/ /usr/share/nginx/html/

# Custom nginx config: SPA fallback + asset caching headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
