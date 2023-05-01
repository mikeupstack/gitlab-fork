---
stage: Manage
group: Authentication and Authorization
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Use Microsoft Azure as an authentication provider **(FREE SELF)**

You can enable the Microsoft Azure OAuth 2.0 OmniAuth provider and sign in to
GitLab with your Microsoft Azure credentials. You can configure the provider that uses
[the earlier Azure Active Directory v1.0 endpoint](https://learn.microsoft.com/en-us/azure/active-directory/azuread-dev/v1-protocols-oauth-code),
or the provider that uses the v2.0 endpoint.

NOTE:
For new projects, Microsoft suggests you use the
[OpenID Connect protocol](../administration/auth/oidc.md#configure-microsoft-azure),
which uses the Microsoft identity platform (v2.0) endpoint.

## Migrate to the OpenID Connect protocol

To migrate to the OpenID Connect protocol, see [configure multiple OpenID Connect providers](../administration/auth/oidc.md#configure-multiple-openid-connect-providers).

You must set the `uid_field`, which differs across the providers:

| Provider                                                                                                        | `uid` | Remarks                                                               |
|-----------------------------------------------------------------------------------------------------------------|-------|-----------------------------------------------------------------------|
| [`omniauth-azure-oauth2`](https://gitlab.com/gitlab-org/gitlab/-/tree/master/vendor/gems/omniauth-azure-oauth2) | `sub` | Additional attributes `oid`, `tid` are offered within the info object |
| [`omniauth-azure-activedirectory-v2`](https://github.com/RIPAGlobal/omniauth-azure-activedirectory-v2/)         | `oid` | You must configure `oid` as `uid_field` when migrating                |
| [`omniauth_openid_connect`](https://github.com/omniauth/omniauth_openid_connect/)                               | `sub` | Specify `uid_field` to use another field                              |

To migrate from `omniauth-azure-oauth2` to `omniauth_openid_connect` you
must change the configuration:

- **For Omnibus installations**

```diff
gitlab_rails['omniauth_providers'] = [
  {
    name: "azure_oauth2",
    # label: "Provider name", # optional label for login button, defaults to "Azure AD"
    args: {
+      name: "azure_oauth2",
+      strategy_class: "OmniAuth::Strategies::OpenIDConnect",
+      scope: ["openid", "profile", "email"],
+      response_type: "code",
+      issuer:  "https://login.microsoftonline.com/<tenant_id>/v2.0",
+      client_auth_method: "query",
+      discovery: true,
+      uid_field: "sub",
+      client_options: {
+        identifier: "<client_id>",
+        secret: "<client_secret>",
+        redirect_uri: "https://gitlab.example.com/users/auth/azure_oauth2/callback"
+      }
-      client_id: "<client_id>",
-      client_secret: "<client_secret>",
-      tenant_id: "<tenant_id>",
    }
  }
]
```

- **For installations from source**

```diff
  - { name: 'azure_oauth2',
      # label: 'Provider name', # optional label for login button, defaults to "Azure AD"
-      args: { client_id: '<client_id>',
-              client_secret: '<client_secret>',
-              tenant_id: '<tenant_id>' } }
+      icon: "<custom_provider_icon>",
+      args: {
+        name: "azure_oauth2",
+        strategy_class: "OmniAuth::Strategies::OpenIDConnect",
+        scope: ["openid","profile","email"],
+        response_type: "code",
+        issuer: 'https://login.microsoftonline.com/<tenant_id>/v2.0',
+        discovery: true,
+        client_auth_method: 'query',
+        uid_field: 'sub',
+        send_scope_to_token_endpoint: "false",
+        client_options: {
+          identifier: "<client_id>",
+          secret: "<client_secret>",
+          redirect_uri: "<your_gitlab_url>/users/auth/azure_oauth2/callback"
+        }
+      }
    }
```

To migrate for example from `omniauth-azure-activedirectory-v2` to `omniauth_openid_connect` you
must change the configuration:

- **For Omnibus installations**

```diff
gitlab_rails['omniauth_providers'] = [
  {
 -    name: "azure_activedirectory_v2",
    # label: "Provider name", # optional label for login button, defaults to "Azure AD v2"
    args: {
+      name: "azure_activedirectory_v2",
+      strategy_class: "OmniAuth::Strategies::OpenIDConnect",
+      scope: ["openid", "profile", "email"],
+      response_type: "code",
+      issuer:  "https://login.microsoftonline.com/<tenant_id>/v2.0",
+      client_auth_method: "query",
+      discovery: true,
+      uid_field: "oid",
+      client_options: {
+        identifier: "<client_id>",
+        secret: "<client_secret>",
+        redirect_uri: "https://gitlab.example.com/users/auth/azure_activedirectory_v2/callback"
+      }
-      client_id: "<client_id>",
-      client_secret: "<client_secret>",
-      tenant_id: "<tenant_id>",
    }
  }
]
```

- **For installations from source**

```diff
  - { name: 'azure_activedirectory_v2',
      # label: 'Provider name', # optional label for login button, defaults to "Azure AD v2"
-      args: { client_id: '<client_id>',
-              client_secret: '<client_secret>',
-              tenant_id: '<tenant_id>' } }
+      icon: "<custom_provider_icon>",
+      args: {
+        name: "azure_activedirectory_v2",
+        strategy_class: "OmniAuth::Strategies::OpenIDConnect",
+        scope: ["openid","profile","email"],
+        response_type: "code",
+        issuer: 'https://login.microsoftonline.com/<tenant_id>/v2.0',
+        discovery: true,
+        client_auth_method: 'query',
+        uid_field: 'oid',
+        send_scope_to_token_endpoint: "false",
+        client_options: {
+          identifier: "<client_id>",
+          secret: "<client_secret>",
+          redirect_uri: "<your_gitlab_url>/users/auth/azure_activedirectory_v2/callback"
+        }
+      }
    }
```

For more information on other customizations, see [`gitlab_username_claim`](index.md#authentication-sources).

## Register an Azure application

To enable the Microsoft Azure OAuth 2.0 OmniAuth provider, you must register
an Azure application and get a client ID and secret key.

1. Sign in to the [Azure portal](https://portal.azure.com).
1. If you have multiple Azure Active Directory tenants, switch to the desired tenant. Note the tenant ID.
1. [Register an application](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
   and provide the following information:
   - The redirect URI, which requires the URL of the Azure OAuth callback of your GitLab
     installation. For example:
     - For the v1.0 endpoint: `https://gitlab.example.com/users/auth/azure_oauth2/callback`.
     - For the v2.0 endpoint: `https://gitlab.example.com/users/auth/azure_activedirectory_v2/callback`.
   - The application type, which must be set to **Web**.
1. Save the client ID and client secret. The client secret is only
   displayed once.

   If required, you can [create a new application secret](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#option-2-create-a-new-application-secret).

`client ID` and `client secret` are terms associated with OAuth 2.0.
In some Microsoft documentation, the terms are named `Application ID` and
`Application Secret`.

## Add API permissions (scopes)

If you're using the v2.0 endpoint, after you create the application, [configure it to expose a web API](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis).
Add the following delegated permissions under the Microsoft Graph API:

- `email`
- `openid`
- `profile`

Alternatively, add the `User.Read.All` application permission.

## Enable Microsoft OAuth in GitLab

1. On your GitLab server, open the configuration file.

   - **For Omnibus installations**

     ```shell
     sudo editor /etc/gitlab/gitlab.rb
     ```

   - **For installations from source**

     ```shell
     cd /home/git/gitlab

     sudo -u git -H editor config/gitlab.yml
     ```

1. Configure the [common settings](omniauth.md#configure-common-settings)
   to add `azure_oauth2` as a single sign-on provider. This enables Just-In-Time
   account provisioning for users who do not have an existing GitLab account.

1. Add the provider configuration. Replace `<client_id>`, `<client_secret>`, and `<tenant_id>`
   with the values you got when you registered the Azure application.

   - **For Omnibus installations**

     For the v1.0 endpoint:

     ```ruby
     gitlab_rails['omniauth_providers'] = [
       {
         name: "azure_oauth2",
         # label: "Provider name", # optional label for login button, defaults to "Azure AD"
         args: {
           client_id: "<client_id>",
           client_secret: "<client_secret>",
           tenant_id: "<tenant_id>",
         }
       }
     ]
     ```

     For the v2.0 endpoint:

     ```ruby
     gitlab_rails['omniauth_providers'] = [
       {
         "name" => "azure_activedirectory_v2",
         "label" => "Provider name", # optional label for login button, defaults to "Azure AD v2"
         "args" => {
           "client_id" => "<client_id>",
           "client_secret" => "<client_secret>",
           "tenant_id" => "<tenant_id>",
         }
       }
     ]
     ```

     For [alternative Azure clouds](https://learn.microsoft.com/en-us/azure/active-directory/develop/authentication-national-cloud),
     configure `base_azure_url` under the `args` section. For example, for Azure Government Community Cloud (GCC):

     ```ruby
     gitlab_rails['omniauth_providers'] = [
       {
         "name" => "azure_activedirectory_v2",
         "label" => "Provider name", # optional label for login button, defaults to "Azure AD v2"
         "args" => {
           "client_id" => "<client_id>",
           "client_secret" => "<client_secret>",
           "tenant_id" => "<tenant_id>",
           "base_azure_url" => "https://login.microsoftonline.us"
         }
       }
     ]
     ```

   - **For installations from source**

     For the v1.0 endpoint:

     ```yaml
     - { name: 'azure_oauth2',
         # label: 'Provider name', # optional label for login button, defaults to "Azure AD"
         args: { client_id: '<client_id>',
                 client_secret: '<client_secret>',
                 tenant_id: '<tenant_id>' } }
     ```

     For the v2.0 endpoint:

     ```yaml
     - { name: 'azure_activedirectory_v2',
         label: 'Provider name', # optional label for login button, defaults to "Azure AD v2"
         args: { client_id: "<client_id>",
                 client_secret: "<client_secret>",
                 tenant_id: "<tenant_id>" } }
     ```

     For [alternative Azure clouds](https://learn.microsoft.com/en-us/azure/active-directory/develop/authentication-national-cloud),
     configure `base_azure_url` under the `args` section. For example, for Azure Government Community Cloud (GCC):

     ```yaml
     - { name: 'azure_activedirectory_v2',
         label: 'Provider name', # optional label for login button, defaults to "Azure AD v2"
         args: { client_id: "<client_id>",
                 client_secret: "<client_secret>",
                 tenant_id: "<tenant_id>",
                 base_azure_url: "https://login.microsoftonline.us" } }
     ```

   You can also optionally add the `scope` for [OAuth 2.0 scopes](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow) parameter to the `args` section. The default is `openid profile email`.

1. Save the configuration file.

1. [Reconfigure GitLab](../administration/restart_gitlab.md#omnibus-gitlab-reconfigure)
   if you installed using Omnibus, or [restart GitLab](../administration/restart_gitlab.md#installations-from-source)
   if you installed from source.

1. Refresh the GitLab sign-in page. A Microsoft icon should display below the
   sign-in form.

1. Select the icon. Sign in to Microsoft and authorize the GitLab application.

Read [Enable OmniAuth for an existing user](omniauth.md#enable-omniauth-for-an-existing-user)
for information on how existing GitLab users can connect to their new Azure AD accounts.
