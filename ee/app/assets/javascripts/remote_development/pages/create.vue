<script>
import { GlAlert, GlButton, GlForm, GlFormGroup, GlFormSelect } from '@gitlab/ui';
import { s__ } from '~/locale';
import { createAlert } from '~/alert';
import { logError } from '~/lib/logger';
import { helpPagePath } from '~/helpers/help_page_helper';
import SearchProjectsListbox from '../components/create/search_projects_listbox.vue';
import GetProjectDetailsQuery from '../components/create/get_project_details_query.vue';
import workspaceCreateMutation from '../graphql/mutations/workspace_create.mutation.graphql';
import { addWorkspace } from '../services/apollo_cache_mutators';
import {
  DEFAULT_DESIRED_STATE,
  DEFAULT_DEVFILE_PATH,
  DEFAULT_EDITOR,
  ROUTES,
  PROJECT_VISIBILITY,
} from '../constants';

export const i18n = {
  title: s__('Workspaces|New workspace'),
  subtitle: s__(
    'Workspaces|A workspace is a virtual sandbox environment for your code in GitLab. You can create a workspace on its own or as part of a project.',
  ),
  form: {
    devfileProject: s__('Workspaces|Select project'),
    agentId: s__('Workspaces|Select cluster agent'),
    editor: s__('Workspaces|Select default editor'),
    help: {
      devfileProjectHelp: s__(
        'Workspaces|You can create a workspace for public Premium projects only.',
      ),
    },
  },
  invalidProjectAlert: {
    title: s__("Workspaces|You can't create a workspace for this project"),
    noAgentsContent: s__(
      "Workspaces|To create a workspace for this project, an administrator must configure an agent for the project's group.",
    ),
    noDevFileContent: s__(
      'Workspaces|To create a workspace, add a devfile to this project. A devfile is a configuration file for your workspace.',
    ),
  },
  submitButton: {
    create: s__('Workspaces|Create workspace'),
  },
  cancelButton: s__('Workspaces|Cancel'),
  createWorkspaceFailedMessage: s__('Workspaces|Failed to create workspace'),
  fetchProjectDetailsFailedMessage: s__(
    'Workspaces|Could not retrieve cluster agents for this project',
  ),
};

export default {
  components: {
    GlAlert,
    GlButton,
    GlForm,
    GlFormGroup,
    GlFormSelect,
    SearchProjectsListbox,
    GetProjectDetailsQuery,
  },
  data() {
    return {
      selectedProject: null,
      selectedAgent: null,
      isCreatingWorkspace: false,
      clusterAgents: [],
      hasDevFile: null,
      groupPath: null,
      projectId: null,
      rootRef: null,
      projectDetailsLoaded: false,
      error: '',
    };
  },
  computed: {
    emptyAgents() {
      return this.clusterAgents.length === 0;
    },
    displayClusterAgentsAlert() {
      return this.projectDetailsLoaded && this.emptyAgents;
    },
    displayNoDevFileAlert() {
      return this.projectDetailsLoaded && !this.displayClusterAgentsAlert && !this.hasDevFile;
    },
    saveWorkspaceEnabled() {
      return this.selectedProject && this.selectedAgent && this.hasDevFile;
    },
    workspacesHelpPath() {
      return helpPagePath('user/project/remote_development/index', { anchor: 'workspace' });
    },
    selectedProjectFullPath() {
      return this.selectedProject?.fullPath;
    },
  },
  watch: {
    selectedProject() {
      this.clusterAgents = [];
      this.selectedAgent = null;
      this.projectDetailsLoaded = false;
    },
  },
  methods: {
    onProjectDetailsResult({ hasDevFile, clusterAgents, id, rootRef }) {
      this.projectDetailsLoaded = true;
      this.hasDevFile = hasDevFile;
      this.clusterAgents = clusterAgents;
      this.projectId = id;
      this.rootRef = rootRef;
    },
    onProjectDetailsError() {
      createAlert({ message: i18n.fetchProjectDetailsFailedMessage });
    },
    async createWorkspace() {
      try {
        this.isCreatingWorkspace = true;

        const result = await this.$apollo.mutate({
          mutation: workspaceCreateMutation,
          variables: {
            input: {
              projectId: this.projectId,
              clusterAgentId: this.selectedAgent,
              editor: DEFAULT_EDITOR,
              desiredState: DEFAULT_DESIRED_STATE,
              devfilePath: DEFAULT_DEVFILE_PATH,
              devfileRef: this.rootRef,
            },
          },
          update(store, { data }) {
            if (data.workspaceCreate.errors.length > 0) {
              return;
            }

            addWorkspace(store, data.workspaceCreate.workspace);
          },
        });

        const {
          errors: [error],
        } = result.data.workspaceCreate;

        if (error) {
          this.error = error;
          return;
        }

        this.$router.push(ROUTES.index);
      } catch (error) {
        logError(error);
        this.error = i18n.createWorkspaceFailedMessage;
      } finally {
        this.isCreatingWorkspace = false;
      }
    },
  },
  i18n,
  ROUTES,
  PROJECT_VISIBILITY,
};
</script>
<template>
  <div class="gl-display-flex gl-sm-flex-direction-column">
    <div class="gl-flex-basis-third gl-mr-5">
      <h2 ref="pageTitle" class="page-title gl-font-size-h-display">
        {{ $options.i18n.title }}
      </h2>
      <p>
        {{ $options.i18n.subtitle }}
      </p>
    </div>
    <get-project-details-query
      :project-full-path="selectedProjectFullPath"
      @result="onProjectDetailsResult"
      @error="onProjectDetailsError"
    />
    <gl-form class="gl-mt-6 gl-flex-basis-two-thirds" @submit.prevent="createWorkspace">
      <gl-form-group
        :label="$options.i18n.form.devfileProject"
        :label-description="$options.i18n.form.help.devfileProjectHelp"
        label-for="workspace-devfile-project-id"
      >
        <search-projects-listbox
          v-model="selectedProject"
          :visibility="$options.PROJECT_VISIBILITY.public"
        />
        <gl-alert
          v-if="displayClusterAgentsAlert"
          data-testid="no-agents-alert"
          class="gl-mt-3"
          :title="$options.i18n.invalidProjectAlert.title"
          variant="danger"
          :dismissible="false"
        >
          {{ $options.i18n.invalidProjectAlert.noAgentsContent }}
        </gl-alert>
        <gl-alert
          v-if="displayNoDevFileAlert"
          data-testid="no-dev-file-alert"
          class="gl-mt-3"
          :title="$options.i18n.invalidProjectAlert.title"
          variant="danger"
          :dismissible="false"
        >
          {{ $options.i18n.invalidProjectAlert.noDevFileContent }}
        </gl-alert>
      </gl-form-group>
      <gl-form-group
        v-if="!emptyAgents"
        :label="$options.i18n.form.agentId"
        label-for="workspace-cluster-agent-id"
        data-testid="workspace-cluster-agent-form-group"
      >
        <gl-form-select
          id="workspace-cluster-agent-id"
          v-model="selectedAgent"
          :options="clusterAgents"
          required
          class="gl-max-w-full"
          autocomplete="off"
          data-qa-selector="workspace_cluster_agent_id_field"
        />
      </gl-form-group>
      <div>
        <gl-button
          :loading="isCreatingWorkspace"
          :disabled="!saveWorkspaceEnabled"
          type="submit"
          data-testid="create-workspace"
          variant="confirm"
          data-qa-selector="save_workspace_button"
        >
          {{ $options.i18n.submitButton.create }}
        </gl-button>
        <gl-button class="gl-ml-3" data-testid="cancel-workspace" :to="$options.ROUTES.index">
          {{ $options.i18n.cancelButton }}
        </gl-button>
      </div>
      <gl-alert
        v-if="error"
        data-testid="create-workspace-error-alert"
        class="gl-mt-3"
        variant="danger"
        dismissible
        @dismiss="error = ''"
      >
        {{ error }}
      </gl-alert>
    </gl-form>
  </div>
</template>
