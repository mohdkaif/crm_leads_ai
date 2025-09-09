<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-4xl">
      <div class="flex justify-center mb-8">
        <h1 class="text-3xl font-bold text-gradient">CRM Leads AI</h1>
      </div>
      
      <div class="bg-white py-12 px-8 shadow-xl sm:rounded-2xl sm:px-12">
        <slot />
      </div>
    </div>
  </div>
</template>

