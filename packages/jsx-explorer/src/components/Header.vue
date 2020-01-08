<template>
  <div class="header">
    <button
      :class="{ active: evaluate }"
      @click="$emit('toggleEvaluate')"
    >
      Evaluate
    </button>
    <button
      :class="{ active: compilationVisible }"
      @click="$emit('toggleCompilation')"
    >
      Compilation Result
    </button>
    <div class="space" />
    <button
      v-for="sugar in sugars"
      :key="sugar"
      :class="{ active: enabledSugars.includes(sugar) }"
      @click="$emit('toggleSugar', sugar)"
    >
      {{ sugar }}
    </button>
    <button
      :class="{ active: plugin }"
      @click="$emit('togglePlugin')"
    >
      JSX Transform
    </button>
  </div>
</template>

<script>
export default {
  props: ['compilationVisible', 'evaluate', 'plugin', 'enabledSugars'],
  data: () => ({
    sugars: ['functional']
  })
}
</script>

<style>
.header {
  border-bottom: 1px solid #bbb;
  display: flex;
  padding: 0 .5rem;
}

.space {
  flex-grow: 1;
}

button {
  height: 100%;
  margin: 0 .5rem;
  background: #ddd;
  border: 0 none;
  padding: 0 2rem;
  cursor: pointer;
  font-size: 1.2rem;
  outline: none;
  flex-grow: 0;
}

button.active {
  background: #eee;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, .2);
}
</style>
