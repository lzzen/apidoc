<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import SidebarHead from './SidebarHead.vue';
import SidebarToggleBar from './SidebarToggleBar.vue';

const Layout = DefaultTheme.Layout;
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <SidebarHead />
    </template>
    <template #layout-top>
      <SidebarToggleBar />
    </template>
  </Layout>
</template>
