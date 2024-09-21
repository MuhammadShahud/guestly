# Guestly Backend

Dev URL: https://dev-api.guestly.ai

## Development Stack
- TypeScript
- Nest JS
- AWS SDK
- Socket.io

## Deployment Stack
- Serverless Framework ([serverless.com](https://serverless.com/))
- AWS Lambda
- AWS API Gateway
- AWS CloudFront
- AWS Codepipeline & Codebuild

#


## Development Setup

1. Clone the Repo:
````bash
git clone https://github.com/guestly-ai/guestly-backend
````
Then `cd` into the `guestly-backend` directory

2. Switch the branch (optional):
````bash
git checkout $branch_name
````

3. Install Dependencies:

```bash
npm install
```

4. Set the environment variables in the `configs/config.{environment_name}.env` file. If it doesn't exists then create one.

5. Run the project
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

6. Test in serverless mode
```bash
npm run build && npm run start:dev
```

### Run unit tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Deployment Setup
Deployment on cloud will just take 1 step, pushing the code on Github.
Thanks to AWS Codepipeline the code will be deployed automatically.

Here are some details about the setup, if there are any changes required in production in future.

### [Serverless Framework Config](/serverless.yaml)

- All configuration of serverless framework is in serverless.yaml

- If cannot use `.env` like Nest.

- For environment variable, there's a script `/build-env.js` that's run by AWS Codebuild to generate a compitable environment variable file that'll be used in deployment stage

### [AWS Lambda](https://eu-central-1.console.aws.amazon.com/lambda/home?region=eu-central-1#/functions)

- AWS Lambda is running the Nest Code
![alt text](/screenshots/lambda.png)

- It can work with both x86_64 and arm64 architecture for this lambda function. You can see other configuration in the image below:
![alt text](/screenshots/lambda-config.png)



### [API Gateway](https://eu-central-1.console.aws.amazon.com/apigateway/home?region=eu-central-1)

- There are two API Gateways
![alt text](/screenshots/api-gateway.png)

- Rest based API gateway is used to invoke lambda function on HTTP request

- WebSocket based API gateway is used to invoke lambda function on WSS request

- Lambda does not support WSS connections by default, that's why WebSocket based API gateway is used to handle web socket connections, however it'll also invoke the same lambda function



### [Cloudfront](https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=eu-central-1#/distributions)

- Cloudfront is pointed towards the API gateways
![alt text](/screenshots/cloudfront-origin.png)

- By Default request will be forwarded to WSS API Gateway

- If request URL starts with `/api` then it'll will be forwarded to HTTP API Gateway

- No cache is enable by default
![alt text](/screenshots/cloudfront-behaviour.png)

### [CodePipeline](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/home?region=eu-central-1)

- Pipeline will be triggered automatically when the code is updated in the `dev` or `master` branch.
![alt text](/screenshots/codepipeline.png)

- Its Code pipeline has three stages
- Stage 1: Source (to pull the code from GitHub)
- Stage 2: Build (It builds the Nest JS application for production)
- Stage 3: Deploy (It deploys the backend application and its infrastructure including lambda & API gateway)


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Nest.js Documentation](https://docs.nestjs.com/) - learn about Nest.js Features.
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs) - learn about Serverless Framework.
