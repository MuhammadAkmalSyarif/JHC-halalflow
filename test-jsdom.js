const { JSDOM } = require("jsdom");
const fs = require("fs");

const html = `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>JHC HalalFlow</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

const dom = new JSDOM(html, {
  url: "https://www.halalflow.or.id/",
  runScripts: "dangerously",
  resources: "usable"
});

dom.window.console.error = function(...args) {
  console.log("JSDOM CONSOLE ERROR:", ...args);
};
dom.window.console.log = function(...args) {
  console.log("JSDOM CONSOLE LOG:", ...args);
};

// Listen for uncaught exceptions
dom.window.addEventListener("error", event => {
  console.log("JSDOM UNCAUGHT ERROR:", event.error);
});

// Load the compiled JS
const jsContent = fs.readFileSync("./frontend/dist/assets/index-Cbtv70sU.js", "utf8");
const script = dom.window.document.createElement("script");
script.textContent = jsContent;
dom.window.document.head.appendChild(script);

setTimeout(() => {
  console.log("Done checking.");
  process.exit(0);
}, 2000);
