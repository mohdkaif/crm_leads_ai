<template>
  <component :is="iconComponent" :class="iconClass" />
</template>

<script setup>
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentIcon,
  ChartPieIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    default: 'w-5 h-5'
  }
})

const iconMap = {
  'heroicons:home': HomeIcon,
  'heroicons:users': UsersIcon,
  'heroicons:chart-bar': ChartBarIcon,
  'heroicons:sparkles': SparklesIcon,
  'heroicons:clock': ClockIcon,
  'heroicons:user-group': UserGroupIcon,
  'heroicons:cog-6-tooth': Cog6ToothIcon,
  'heroicons:x-mark': XMarkIcon,
  'heroicons:bars-3': Bars3Icon,
  'heroicons:bell': BellIcon,
  'heroicons:chevron-down': ChevronDownIcon,
  'heroicons:check-circle': CheckCircleIcon,
  'heroicons:currency-dollar': CurrencyDollarIcon,
  'heroicons:funnel': FunnelIcon,
  'heroicons:plus': PlusIcon,
  'heroicons:eye': EyeIcon,
  'heroicons:eye-slash': EyeSlashIcon,
  'heroicons:arrow-path': ArrowPathIcon,
  'heroicons:document-text': DocumentTextIcon,
  'heroicons:phone': PhoneIcon,
  'heroicons:envelope': EnvelopeIcon,
  'heroicons:calendar': CalendarIcon,
  'heroicons:document': DocumentIcon,
  'heroicons:chart-pie': ChartPieIcon
}

const iconComponent = computed(() => {
  return iconMap[props.name] || DocumentIcon
})

const iconClass = computed(() => {
  return props.class
})
</script>
