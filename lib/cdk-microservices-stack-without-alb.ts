import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns');
import serviceDiscovery = require('@aws-cdk/aws-servicediscovery');
import iam = require('@aws-cdk/aws-iam');

export class CdkMicroservicesStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const vpc = new ec2.Vpc(this, 'vpc', {
			maxAzs: 2,
			natGateways: 1
		});

		const cluster = new ecs.Cluster(this, 'cluster', {
			vpc: vpc
		});

		cluster.addDefaultCloudMapNamespace({
			name: 'noload.com',
			type: serviceDiscovery.NamespaceType.DNS_PRIVATE,
			vpc: vpc
		});

		const fgtd = new ecs.FargateTaskDefinition(this, 'fargateTD', {
			cpu: 512,
			memoryLimitMiB: 1024
		});

		const container = new ecs.ContainerDefinition(this, 'web', {
			image: ecs.ContainerImage.fromAsset('./api'),
			taskDefinition: fgtd,
			cpu: 256,
			memoryLimitMiB: 512,
			logging: new ecs.AwsLogDriver({
				streamPrefix: 'webLog'
			})
		});

		container.addPortMappings({
			containerPort: 80,
			protocol: ecs.Protocol.TCP
		});

		const fargateService = new ecs.FargateService(this, 'fgService', {
			cluster: cluster,
			taskDefinition: fgtd,
			desiredCount: 2,
			assignPublicIp: true,
			cloudMapOptions: {
				name: 'api',
				dnsRecordType: serviceDiscovery.DnsRecordType.A,
				dnsTtl: cdk.Duration.seconds(30)
			}
		});

		// Setup AutoScaling policy
		const scaling = fargateService.autoScaleTaskCount({ maxCapacity: 50 });
		scaling.scaleOnCpuUtilization('CpuScaling', {
			targetUtilizationPercent: 50,
			scaleInCooldown: cdk.Duration.seconds(60),
			scaleOutCooldown: cdk.Duration.seconds(60)
		});

		const xray = fargateService.taskDefinition.addContainer('xray-daemon', {
			image: ecs.ContainerImage.fromRegistry('amazon/aws-xray-daemon'),
			cpu: 32,
			memoryReservationMiB: 256,
			logging: new ecs.AwsLogDriver({
				streamPrefix: 'xrayLog'
			}),
			essential: false
		});
		// grant the task role rights to put segments
		xray.taskDefinition.taskRole.addManagedPolicy(
			iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess')
		);
		xray.addPortMappings({
			containerPort: 2000,
			protocol: ecs.Protocol.UDP
		});
	}
}
