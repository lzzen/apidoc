<script setup lang="ts">
import { onMounted } from 'vue';
import { withBase } from 'vitepress';
import { siteConfig } from '../../../lib/site.config';
import { sidebarToggleSvg } from './icons';
import { setupSidebarUi, toggleSidebar } from './sidebar-ui';

onMounted(() => setupSidebarUi());
</script>

<template>
  <div class="fd-sidebar-head">
    <a :href="withBase('/')" class="fd-sidebar-brand">{{ siteConfig.brandName }}</a>
    <button
      type="button"
      class="fd-toggle-btn fd-toggle-inline"
      data-fd-action="sidebar"
      title="收起侧栏"
      aria-label="收起侧栏"
      @click="toggleSidebar"
      v-html="sidebarToggleSvg"
    />
  </div>
</template>
