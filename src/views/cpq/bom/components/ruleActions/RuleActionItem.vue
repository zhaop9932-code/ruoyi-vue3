<template>
  <div class="action-item">
    <ActionHeader 
      :element="element" 
      :index="index"
      @toggle-expand="handleToggleExpand"
      @delete-action="handleDeleteAction"
    />
    <ActionContent 
      :element="element" 
      :is-expanded="isExpanded"
      :bom-id="bomId"
      @update:element="handleElementUpdate"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ActionHeader from './ActionHeader.vue'
import ActionContent from './ActionContent.vue'

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  expandedActionId: {
    type: [String, Number, null],
    default: null
  },
  expandedActionIndex: {
    type: [Number, null],
    default: null
  },
  bomId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:element', 'delete-action', 'toggle-expand'])

const isExpanded = computed(() => {
  return props.element.actionId === props.expandedActionId || 
         (props.element.actionId === null && props.expandedActionIndex === props.index)
})

const handleToggleExpand = () => {
  emit('toggle-expand', props.element)
}

const handleDeleteAction = () => {
  emit('delete-action', props.index)
}

const handleElementUpdate = (updatedElement) => {
  emit('update:element', updatedElement)
}
</script>

<style scoped>
.action-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.action-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>