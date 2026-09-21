export const SHARED_RUNTIME = [
  {
    pkg: "ant-design-vue",
    from: "ant-design-vue/dist/antd.esm.min.js",
    to: "antd.js",
  },
  {
    pkg: "single-spa-css",
    from: "single-spa-css/lib/esm/single-spa-css.min.js",
    to: "single-spa-css.js",
  },
  {
    pkg: "single-spa",
    from: "single-spa/lib/es2015/esm/single-spa.min.js",
    to: "single-spa.js",
  },
  {
    pkg: "vue",
    from: "vue/dist/vue.runtime.esm-browser.prod.js",
    to: "vue.js",
  },
  {
    pkg: "vue-router",
    from: "vue-router/dist/vue-router.esm-browser.prod.js",
    to: "vue-router.js",
  },
]

export const SHARED_EXTERNALS = SHARED_RUNTIME.map(({ pkg }) => pkg)

export const MFE_MODULES = [
  {
    module: "@recrm/shell-host",
    port: 9001,
    buildPath: "/shell-host/shell-host.js",
    cssPath: "/shell-host/shell-host.css",
  },
  {
    module: "@recrm/leads",
    port: 9002,
    buildPath: "/leads/leads.js",
    cssPath: "/leads/leads.css",
  },
]
