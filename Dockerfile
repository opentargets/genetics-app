# Multi-stage dockerfile where the 1st stage builds the app on a specific version of node,
# and the 2nd stage sets up the latest nginx:alpine.

# ============================== node/build section =====================================================
FROM node:14.17-alpine as build_section

ARG REACT_APP_GRAPHQL_API_URL=https://genetics-api.opentargets.io
ARG REACT_APP_PLATFORM_URL=https://targetvalidation.org
ARG REACT_APP_CONTACT_URL=mailto:geneticsportal@opentargets.org

RUN apk update && apk add --update git
COPY ./ /app/
WORKDIR /app
RUN yarn install && yarn build

# ============================== nginx section =====================================================
FROM nginx:1.16-alpine


# copy nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf
# copy build result from 1st stage
COPY --from=build_section /app/build/ /usr/share/nginx/html/

EXPOSE 80
