<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import SidebarHead from './SidebarHead.vue';
import SidebarToggleBar from './SidebarToggleBar.vue';
import { toggleSidebar } from './sidebar-ui';

const Layout = DefaultTheme.Layout;
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <SidebarHead />
    </template>
    <template #layout-top>
      <SidebarToggleBar />
      <div
        class="fd-sidebar-backdrop"
        data-fd-action="sidebar-backdrop"
        aria-hidden="true"
        @click="toggleSidebar"
      />
    </template>
  </Layout>
</template>
