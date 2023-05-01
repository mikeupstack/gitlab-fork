---
stage: SaaS Platforms
group: GitLab Dedicated
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# GitLab Dedicated

NOTE:
GitLab Dedicated is currently in limited availability. You can learn more and join the waitlist [on our website](https://about.gitlab.com/single-tenant-saas).

GitLab Dedicated is a fully isolated, single-tenant SaaS service that is:

- Hosted and managed by GitLab, Inc.
- Deployed on AWS in a cloud region of your choice (see the [regions that are not supported](#aws-regions-not-supported)).

GitLab Dedicated removes the overhead of platform management to increase your operational efficiency, reduce risk, and enhance the speed and agility of your organization. Each GitLab Dedicated instance is highly available with disaster recovery and deployed into the cloud region of your choice. GitLab teams fully manage the maintenance and operations of each isolated instance, so customers can access our latest product improvements while meeting the most complex compliance standards.

It's the offering of choice for enterprises and organizations in highly regulated industries that have complex regulatory, compliance, and data residency requirements.

## Available features

### Data residency

GitLab Dedicated allows you to select the cloud region where your data will be stored. Upon [onboarding](../../administration/dedicated/index.md#onboarding), choose the cloud region where you want to deploy your Dedicated instance. Some AWS regions have limited features and as a result, we are not able to deploy production instances to those regions. See below for the [full list of regions](#aws-regions-not-supported) not supported.

### Availability and scalability

GitLab Dedicated leverages the GitLab [Cloud Native Hybrid reference architectures](../../administration/reference_architectures/index.md#cloud-native-hybrid) with high availability enabled. When [onboarding](../../administration/dedicated/index.md#onboarding), GitLab will match you to the closest reference architecture size based on your number of users. Learn about the [current Service Level Objective](https://about.gitlab.com/handbook/engineering/infrastructure/team/gitlab-dedicated/slas/#current-service-level-objective).

#### Disaster Recovery

When [onboarding](../../administration/dedicated/index.md#onboarding) to GitLab Dedicated, you can provide a Secondary AWS region in which your data is stored. This region is used to recover your GitLab Dedicated instance in case of a disaster. Regular backups of all GitLab Dedicated datastores (including Database and Git repositories) are taken and tested regularly and stored in your desired secondary region. GitLab Dedicated also provides the ability to store copies of these backups in a separate cloud region of choice for greater redundancy.

For more information, read about the [recovery plan for GitLab Dedicated](https://about.gitlab.com/handbook/engineering/infrastructure/team/gitlab-dedicated/slas/#disaster-recovery-plan) as well as RPO and RTO targets.

### Security

#### Authentication and authorization

GitLab Dedicated supports instance-level [SAML OmniAuth](../../integration/saml.md) functionality. Your GitLab Dedicated instance acts as the service provider, and you must provide the necessary [configuration](../../integration/saml.md#configure-saml-support-in-gitlab) in order for GitLab to communicate with your IdP. For more information, see how to [configure SAML](../../administration/dedicated/index.md#saml) for your instance.

- SAML [request signing](../../integration/saml.md#sign-saml-authentication-requests-optional), [group sync](../../user/group/saml_sso/group_sync.md#configure-saml-group-sync), and [SAML groups](../../integration/saml.md#configure-users-based-on-saml-group-membership) are supported.

#### Secure networking

GitLab Dedicated offers public connectivity by default with support for IP allowlists. You can [optionally specify a list of IP addresses](../../administration/dedicated/index.md#ip-allowlist) that can access your GitLab Dedicated instance. Subsequently, when an IP not on the allowlist tries to access your instance the connection is refused.

Private connectivity via [AWS PrivateLink](https://aws.amazon.com/privatelink/) is also offered as an option. Both [inbound](../../administration/dedicated/index.md#inbound-private-link) and [outbound](../../administration/dedicated/index.md#outbound-private-link) PrivateLinks are supported. When connecting to an internal service running in your VPC over HTTPS via PrivateLink, GitLab Dedicated supports the ability to use a private SSL certificate, which can be provided when [updating your instance configuration](../../administration/dedicated/index.md#custom-certificates).

#### Encryption

Data is encrypted at rest and in transit using the latest encryption standards.

#### Bring your own key encryption

During onboarding, you can specify an AWS KMS encryption key stored in your own AWS account that GitLab uses to encrypt the data for your Dedicated instance. This gives you full control over the data you store in GitLab.

### Compliance

#### Certifications

GitLab Dedicated offers the following [compliance certifications](https://about.gitlab.com/security/):

- SOC 2 Type 1 Report (Security and Confidentiality criteria)
- ISO/IEC 27001:2013
- ISO/IEC 27017:2015
- ISO/IEC 27018:2019

#### Isolation

As a single-tenant SaaS service, GitLab Dedicated provides infrastructure-level isolation of your GitLab environment. Your environment is placed into a separate AWS account from other tenants. This AWS account contains all of the underlying infrastructure necessary to host the GitLab application and your data stays within the account boundary. You administer the application while GitLab manages the underlying infrastructure. Tenant environments are also completely isolated from GitLab.com.

#### Access controls

GitLab Dedicated adheres to the [principle of least privilege](https://about.gitlab.com/handbook/security/access-management-policy.html#principle-of-least-privilege) to control access to customer tenant environments. Tenant AWS accounts live under a top-level GitLab Dedicated AWS parent organization. Access to the AWS Organization is restricted to select GitLab team members. All user accounts within the AWS Organization follow the overall GitLab Access Management Policy [outlined here](https://about.gitlab.com/handbook/security/access-management-policy.html). Direct access to customer tenant environments is restricted to a single Hub account. The GitLab Dedicated Control Plane uses the Hub account to perform automated actions over tenant accounts when managing environments. Similarly, GitLab Dedicated engineers do not have direct access to customer tenant environments. In break glass situations, where access to resources in the tenant environment is required to address a high-severity issue, GitLab engineers must go through the Hub account to manage those resources. This is done via an approval process, and after permission is granted, the engineer will assume an IAM role on a temporary basis to access tenant resources through the Hub account. All actions within the hub account and tenant account are logged to CloudTrail.

Inside tenant accounts, GitLab leverages Intrusion Detection and Malware Scanning capabilities from AWS GuardDuty. Infrastructure logs are monitored by the GitLab Security Incident Response Team to detect anomalous events.

#### Audit and observability

GitLab Dedicated provides access to [audit and system logs](../../administration/dedicated/index.md#access-to-application-logs) generated by the application.

### Maintenance

GitLab leverages [weekly maintenance windows](../../administration/dedicated/index.md#maintenance-window) to keep your instance up to date, fix security issues, and ensure the overall reliability and performance of your environment.

#### Upgrades

GitLab performs monthly upgrades to your instance with the latest security release during your preferred [maintenance window](../../administration/dedicated/index.md#maintenance-window) tracking one release behind the latest GitLab release. For example, if the latest version of GitLab available is 15.8, GitLab Dedicated runs on 15.7.

#### Unscheduled maintenance

GitLab may conduct unscheduled maintenance to address high-severity issues affecting the security, availability, or reliability of your instance.

### Application

GitLab Dedicated comes with the self-managed [Ultimate feature set](https://about.gitlab.com/pricing/feature-comparison/) with the exception of the unsupported features [listed below](#features-that-are-not-available).

#### GitLab Runners

With GitLab Dedicated, you must [install the GitLab Runner application](https://docs.gitlab.com/runner/install/index.html) on infrastructure that you own or manage. If hosting GitLab Runners on AWS, you can avoid having requests from the Runner fleet route through the public internet by setting up a secure connection from the Runner VPC to the GitLab Dedicated endpoint via AWS Private Link. Learn more about [networking options](#secure-networking).

#### Migration

To help you migrate your data to GitLab Dedicated, you can choose from the following options:

1. When migrating from another GitLab instance, you can either:
    - Use the UI, including [group import](../../user/group/import/index.md) and [project import](../../user/project/settings/import_export.md).
    - Use APIs, including the [group import API](../../api/group_import_export.md) and [project import API](../../api/project_import_export.md).
    - Note: Import functionality behind a feature flag (such as `bulk_import_project`) is not supported in GitLab Dedicated.
1. When migrating from third-party services, you can use [the GitLab importers](../../user/project/import/index.md#available-project-importers).
1. You can perform a fully-automated migration through the [Congregate Automation Tool](../../user/project/import/index.md#automate-group-and-project-import), which supports migrating from existing GitLab instances as well as third-party services.

## Features that are not available

### GitLab application features

The following GitLab application features are not available:

- LDAP, Smartcard, or Kerberos authentication
- Multiple login providers
- Advanced search
- GitLab Pages
- FortiAuthenticator, or FortiToken 2FA
- Reply-by email
- Service Desk
- GitLab-managed runners (hosted runners)
- Any feature [not listed above](#available-features) which must be configured outside of the GitLab user interface.

The following features will not be supported:

- Mattermost
- Server-side Git hooks. Use [push rules](../../user/project/repository/push_rules.md) instead.

### GitLab Dedicated service features

The following operational features are not available:

- Custom domains
- Multiple Geo secondaries (Geo replicas) beyond the secondary site included by default
- Self-serve purchasing and configuration
- Multiple login providers
- Support for deploying to non-AWS cloud providers, such as GCP or Azure
- Observability Dashboard using Switchboard
- Pre-Production Instance

### AWS regions not supported

The following AWS regions are not available:

- Jakarta (`ap-southeast-3`)
- Bahrain (`me-south-1`)
- Hong Kong (`ap-east-1`)
- Cape Town (`af-south-1`)
- Milan (`eu-south-1`)
- Paris (`eu-west-3`)
- Zurich (`eu-central-2`)
- GovCloud (US-East) (`us-gov-east-1`)
- GovCloud (US-West) (`us-gov-west-1`)

## Planned features

For more information about the planned improvements to GitLab Dedicated,
see the [category direction page](https://about.gitlab.com/direction/saas-platforms/dedicated/).

## Join the GitLab Dedicated waitlist

As we scale this new offering, we are making GitLab Dedicated available by inviting customers to [join our waitlist](https://about.gitlab.com/dedicated/).
