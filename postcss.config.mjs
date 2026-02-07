/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {}, // <--- Change this back to just 'tailwindcss'
    autoprefixer: {},
  },
};

export default config;