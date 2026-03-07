FROM public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /usr/app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build
    
FROM public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/index.js ./
COPY --from=builder /usr/app/certs ./certs
CMD ["index.handler"]