# AWS CDK Fargate X-Ray Service Discovery examples
And example of a VPC with a Fargate deployed simple Node.js API with X-Ray and Service Discovery enabled

cdk-microservices-stack-without-alb.ts is the same stack but without the Application Load Balancer (so therefore a more manual setup without the ecs-pattern).

# Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
