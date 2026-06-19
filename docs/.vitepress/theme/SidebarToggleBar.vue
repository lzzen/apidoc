<script setup lang="ts">
import { onMounted } from 'vue';
import { searchToggleSvg, sidebarToggleSvg } from './icons';
import { setupSidebarUi, toggleSidebar } from './sidebar-ui';

onMounted(() => setupSidebarUi());
</script>

<template>
  <div id="fd-sidebar-toggle" class="fd-sidebar-toggle">
    <button
      type="button"
      class="fd-toggle-btn"
      data-fd-action="sidebar"
      title="展开侧栏"
      aria-label="展开侧栏"
      @click="toggleSidebar"
      v-html="sidebarToggleSvg"
    />
    <span class="fd-toggle-sep" />
    <button
      type="button"
      class="fd-toggle-btn fd-toggle-search"
      data-fd-action="search"
      title="搜索（暂未启用）"
      aria-label="搜索"
      tabindex="-1"
      v-html="searchToggleSvg"
    />
  </div>
</template>
