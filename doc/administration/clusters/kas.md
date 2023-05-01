---
stage: Deploy
group: Environments
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Install the GitLab agent server for Kubernetes (KAS) **(FREE SELF)**

> - [Introduced](https://gitlab.com/groups/gitlab-org/-/epics/3834) in GitLab 13.10, the GitLab agent server (KAS) became available on GitLab.com at `wss://kas.gitlab.com`.
> - [Moved](https://gitlab.com/groups/gitlab-org/-/epics/6290) from GitLab Premium to GitLab Free in 14.5.

The agent server is a component you install together with GitLab. It is required to
manage the [GitLab agent for Kubernetes](https://gitlab.com/gitlab-org/cluster-integration/gitlab-agent).

The KAS acronym refers to the former name, `Kubernetes agent server`.

The agent server for Kubernetes is installed and available on GitLab.com at `wss://kas.gitlab.com`.
If you use self-managed GitLab, you must install an agent server or specify an external installation.

## Installation options

As a GitLab administrator, you can install the agent server:

- For [Omnibus installations](#for-omnibus).
- For [GitLab Helm Chart installations](#for-gitlab-helm-chart).

### For Omnibus

You can enable the agent server for [Omnibus](https://docs.gitlab.com/omnibus/) package installations on a single node, or on multiple nodes at once.

#### Enable on a single node

To enable the agent server on a single node:

1. Edit `/etc/gitlab/gitlab.rb`:

   ```ruby
   gitlab_kas['enable'] = true
   ```

1. [Reconfigure GitLab](../restart_gitlab.md#omnibus-gitlab-reconfigure).

For additional configuration options, see the **Enable GitLab KAS** section of the
[`gitlab.rb.template`](https://gitlab.com/gitlab-org/omnibus-gitlab/-/blob/master/files/gitlab-config-template/gitlab.rb.template).

##### Configure KAS to listen on a UNIX socket

If you use GitLab behind a proxy, KAS might not work correctly. You can resolve this issue on a single-node installation, you can configure KAS to listen on a UNIX socket.

To configure KAS to listen on a UNIX socket:

1. Create a directory for the KAS sockets:

   ```shell
   sudo mkdir -p /var/opt/gitlab/gitlab-kas/sockets/
   ```

1. Edit `/etc/gitlab/gitlab.rb`:

   ```ruby
   gitlab_kas['internal_api_listen_network'] = 'unix'
   gitlab_kas['internal_api_listen_address'] = '/var/opt/gitlab/gitlab-kas/sockets/internal-api.socket'
   gitlab_kas['private_api_listen_network'] = 'unix'
   gitlab_kas['private_api_listen_address'] = '/var/opt/gitlab/gitlab-kas/sockets/private-api.socket'
   gitlab_kas['env'] = {
     'SSL_CERT_DIR' => "/opt/gitlab/embedded/ssl/certs/",
     'OWN_PRIVATE_API_URL' => 'unix:///var/opt/gitlab/gitlab-kas/sockets/private-api.socket'
   }
   ```

1. [Reconfigure GitLab](../restart_gitlab.md#omnibus-gitlab-reconfigure).

#### Enable on multiple nodes

To enable the agent server on multiple nodes:

1. For each agent server node, edit `/etc/gitlab/gitlab.rb`:

   ```ruby
   gitlab_kas_external_url 'wss://kas.gitlab.example.com/'

   gitlab_kas['enable'] = true
   gitlab_kas['api_secret_key'] = '<32_bytes_long_base64_encoded_value>'
   gitlab_kas['private_api_secret_key'] = '<32_bytes_long_base64_encoded_value>'
   gitlab_kas['private_api_listen_address'] = '0.0.0.0:8155'
   gitlab_kas['env'] = {
     'SSL_CERT_DIR' => "/opt/gitlab/embedded/ssl/certs/",
     'OWN_PRIVATE_API_URL' => 'grpc://<ip_or_hostname_of_this_host>:8155'
   }

   gitlab_rails['gitlab_kas_enabled'] = true
   gitlab_rails['gitlab_kas_external_url'] = 'wss://gitlab.example.com/-/kubernetes-agent/'
   gitlab_rails['gitlab_kas_internal_url'] = 'grpc://kas.internal.gitlab.example.com'
   gitlab_rails['gitlab_kas_external_k8s_proxy_url'] = 'https://gitlab.example.com/-/kubernetes-agent/k8s-proxy/'
   ```

1. [Reconfigure GitLab](../restart_gitlab.md#omnibus-gitlab-reconfigure).

##### Agent server node settings

| Setting | Description |
|---------|-------------|
| `gitlab_kas['private_api_listen_address']` | The address the agent server listens on. Set to `0.0.0.0` or to an IP address reachable by other nodes in the cluster. |
| `gitlab_kas['api_secret_key']` | The shared secret used for authentication between KAS and GitLab. The value must be Base64-encoded and exactly 32 bytes long. |
| `gitlab_kas['private_api_secret_key']` | The shared secret used for authentication between different KAS instances. The value must be Base64-encoded and exactly 32 bytes long. |
| `OWN_PRIVATE_API_URL` | The environment variable used by KAS for service discovery. Set to the hostname or IP address of the node you're configuring. The node must be reachable by other nodes in the cluster. |
| `gitlab_kas_external_url` | The user-facing URL for the in-cluster `agentk`. Can be a fully qualified domain or subdomain, <sup>**1**</sup> or a GitLab external URL. <sup>**2**</sup> If blank, defaults to a GitLab external URL. |
| `gitlab_rails['gitlab_kas_external_url']` | The user-facing URL for the in-cluster `agentk`. If blank, defaults to the `gitlab_kas_external_url`. |
| `gitlab_rails['gitlab_kas_external_k8s_proxy_url']` | The user-facing URL for Kubernetes API proxying. If blank, defaults to a URL based on `gitlab_kas_external_url`. |
| `gitlab_rails['gitlab_kas_internal_url']` | The internal URL the GitLab backend uses to communicate with KAS. |

1. For example, `wss://kas.gitlab.example.com/`.
1. For example, `wss://gitlab.example.com/-/kubernetes-agent/`.

### For GitLab Helm Chart

For GitLab [Helm Chart](https://docs.gitlab.com/charts/) installations:

1. Set `global.kas.enabled` to `true`. For example, in a shell with `helm` and `kubectl`
   installed, run:

   ```shell
   helm repo add gitlab https://charts.gitlab.io/
   helm repo update
   helm upgrade --install gitlab gitlab/gitlab \
     --timeout 600s \
     --set global.hosts.domain=<YOUR_DOMAIN> \
     --set global.hosts.externalIP=<YOUR_IP> \
     --set certmanager-issuer.email=<YOUR_EMAIL> \
     --set global.kas.enabled=true # <-- without this setting, the agent server will not be installed
   ```

1. To configure the agent server, use a `gitlab.kas` sub-section in your `values.yaml` file:

   ```yaml
   gitlab:
     kas:
       # put your custom options here
   ```

For details, see [how to use the GitLab-KAS chart](https://docs.gitlab.com/charts/charts/gitlab/kas/).

## Kubernetes API proxy cookie

> Introduced in GitLab 15.10 [with feature flags](../feature_flags.md) named `kas_user_access` and `kas_user_access_project`. Disabled by default.

FLAG:
On self-managed GitLab, by default this feature is not available. To make it available, ask an administrator to [enable the feature flags](../feature_flags.md) named `kas_user_access` and `kas_user_access_project`.

KAS proxies Kubernetes API requests to the GitLab agent with either:

- A [CI/CD job](https://gitlab.com/gitlab-org/cluster-integration/gitlab-agent/-/blob/master/doc/kubernetes_ci_access.md).
- [GitLab user credentials](https://gitlab.com/gitlab-org/cluster-integration/gitlab-agent/-/blob/master/doc/kubernetes_user_access.md).

To authenticate with user credentials, Rails sets a cookie for the GitLab frontend.
This cookie is called `_gitlab_kas` and it contains an encrypted
session ID, like the [`_gitlab_session` cookie](../../user/profile/index.md#cookies-used-for-sign-in).
The `_gitlab_kas` cookie must be sent to the KAS proxy endpoint with every request
to authenticate and authorize the user.

## Troubleshooting

If you have issues while using the agent server for Kubernetes, view the
service logs by running the following command:

```shell
kubectl logs -f -l=app=kas -n <YOUR-GITLAB-NAMESPACE>
```

In Omnibus GitLab, find the logs in `/var/log/gitlab/gitlab-kas/`.

You can also [troubleshoot issues with individual agents](../../user/clusters/agent/troubleshooting.md).

### GitOps: failed to get project information

If you get the following error message:

```json
{"level":"warn","time":"2020-10-30T08:37:26.123Z","msg":"GitOps: failed to get project info","agent_id":4,"project_id":"root/kas-manifest001","error":"error kind: 0; status: 404"}
```

The project specified by the manifest (`root/kas-manifest001`)
doesn't exist or the project where the manifest is kept is private. To fix this issue,
ensure the project path is correct and that the project's visibility is [set to public](../../user/public_access.md).

### Configuration file not found

If you get the following error message:

```plaintext
time="2020-10-29T04:44:14Z" level=warning msg="Config: failed to fetch" agent_id=2 error="configuration file not found: \".gitlab/agents/test-agent/config.yaml\
```

The path is incorrect for either:

- The repository where the agent was registered.
- The agent configuration file.

To fix this issue, ensure that the paths are correct.

### `dial tcp <GITLAB_INTERNAL_IP>:443: connect: connection refused`

If you are running self-managed GitLab and:

- The instance isn't running behind an SSL-terminating proxy.
- The instance doesn't have HTTPS configured on the GitLab instance itself.
- The instance's hostname resolves locally to its internal IP address.

When the agent server tries to connect to the GitLab API, the following error might occur:

```json
{"level":"error","time":"2021-08-16T14:56:47.289Z","msg":"GetAgentInfo()","correlation_id":"01FD7QE35RXXXX8R47WZFBAXTN","grpc_service":"gitlab.agent.reverse_tunnel.rpc.ReverseTunnel","grpc_method":"Connect","error":"Get \"https://gitlab.example.com/api/v4/internal/kubernetes/agent_info\": dial tcp 172.17.0.4:443: connect: connection refused"}
```

To fix this issue for [Omnibus](https://docs.gitlab.com/omnibus/) package installations,
set the following parameter in `/etc/gitlab/gitlab.rb`. Replace `gitlab.example.com` with your GitLab instance's hostname:

```ruby
gitlab_kas['gitlab_address'] = 'http://gitlab.example.com'
```
