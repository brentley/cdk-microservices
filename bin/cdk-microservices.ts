#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { CdkMicroservicesStack } from '../lib/cdk-microservices-stack';

const app = new cdk.App();
new CdkMicroservicesStack(app, 'CdkMicroservicesStack');