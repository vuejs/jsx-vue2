<template>
  <div class="frame-container">
    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <iframe />
  </div>
</template>

<script>
export default {
  props: ['code'],
  data: () => ({
    error: '',
  }),
  mounted () {
    const iframe = this.$el.querySelector('iframe')
    const iframeWindow = iframe.contentWindow
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    const vueScript = document.createElement('script')
    vueScript.setAttribute('src', 'https://unpkg.com/vue')
    iframeWindow.document.body.appendChild(app)
    iframeWindow.document.body.appendChild(vueScript)
    const callback = () => {
      const appScript = document.createElement('script')
      appScript.innerHTML = this.code
      iframeWindow.document.body.appendChild(appScript)
    }
    vueScript.onreadystatechange = callback
    vueScript.onload = callback
    iframeWindow.addEventListener('error', err => {
      this.error = err.error.stack
    })
  },
}
</script>

<style>
.frame-container {
  position: relative;
}

.error {
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, .25);
  color: red;
  white-space: pre-wrap;
}

iframe {
  border: 0 none;
  height: 100%;
  width: 100%;
}
</style>
