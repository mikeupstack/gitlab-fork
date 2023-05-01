import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import mutations from './mutations';
import createState from './state';

Vue.use(Vuex);

export default () =>
  new Vuex.Store({
    actions,
    getters,
    mutations,
    state: createState(),
  });

export const createRefModule = () => ({
  namespaced: true,
  actions,
  getters,
  mutations,
  state: createState(),
});