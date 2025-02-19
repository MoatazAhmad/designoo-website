import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default {
  plugins: [tailwindcss()],
  root: "./src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: "./src/index.html",
        aboutUs: "./src/pages/about-us.html",
        contact: "./src/pages/contact.html",
        locations: "./src/pages/locations.html",
        graphicDesignProjects: "./src/pages/graphic-design-projects.html",
        appDesignProjects: "./src/pages/app-design-projects.html",
        webDesignProjects: "./src/pages/web-design-projects.html",
      },
      output: {
        entryFileNames: "js/[name].js",
        chunkFileNames: "js/[name].js",
        assetFileNames: ({ name }) => {
          if (name && name.endsWith(".css")) {
            return "css/[name][extname]";
          }
          if (name && /\.(png|jpe?g|gif|svg|webp)$/.test(name)) {
            return "assets/images/[name][extname]";
          }
          // Add more asset types as needed
          return "assets/[name][extname]";
        },
      },
    },
  },
};
// todo => make build version project structure looks good , images in images folder ,
// todo => css in css folder , js in js folder

// export default {
//   root: "./src",
//   build: {
//     outDir: "/dist",
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         index: "./src/index.html",
//         aboutUs: "./src/pages/about-us.html",
//         contact: "./src/pages/contact.html",
//         locations: "./src/pages/locations.html",
//         graphicDesignProjects: "./src/pages/graphic-design-projects.html",
//         appDesignProjects: "./src/pages/app-design-projects.html",
//         webDesignProjects: "./src/pages/web-design-projects.html",
//       },
//       output: {
//         entryFileNames: "scripts/[name].js",
//         chunkFileNames: "scripts/[name].js",
//         assetFileNames: ({ name }) => {
//           if (name && name.endsWith(".css")) {
//             return "css/[name][extname]";
//           }
//           if (name && /\.(png|jpe?g|gif|svg|webp)$/.test(name)) {
//             return "images/[name][extname]";
//           }
//           // Add more asset types as needed
//           return "assets/[name][extname]";
//         },
//       },
//     },
//   },
// };
