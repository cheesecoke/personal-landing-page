import { x as head } from "../../chunks/index.js";
import "clsx";
function Kansas($$renderer) {
  $$renderer.push(`<section class="kansas svelte-1210ca5"><p>Kansas - Placeholder</p></section>`);
}
function California($$renderer) {
  $$renderer.push(`<section class="california svelte-a05zb6"><p>California - Placeholder</p></section>`);
}
function Fire($$renderer) {
  $$renderer.push(`<section class="fire svelte-1gs3ezg"><p>Fire - Placeholder</p></section>`);
}
function Colorado($$renderer) {
  $$renderer.push(`<section class="colorado svelte-oh1z2l"><p>Colorado - Placeholder</p></section>`);
}
function Epilogue($$renderer) {
  $$renderer.push(`<section class="epilogue svelte-1xotgno"><p>Epilogue - Placeholder</p></section>`);
}
function GuidingLine($$renderer) {
  $$renderer.push(`<div class="guiding-line svelte-1hbk461"></div>`);
}
function Navigation($$renderer) {
  $$renderer.push(`<nav class="navigation svelte-ocbj1u"></nav>`);
}
function _page($$renderer) {
  head($$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Chase Cole - A Journey Through Code</title>`);
    });
    $$renderer2.push(`<meta name="description" content="A cinematic journey through Kansas, California, Fire, Colorado - told through code and design."/>`);
  });
  $$renderer.push(`<main class="scroll-container svelte-1uha8ag">`);
  Navigation($$renderer);
  $$renderer.push(`<!----> `);
  GuidingLine($$renderer);
  $$renderer.push(`<!----> `);
  Kansas($$renderer);
  $$renderer.push(`<!----> `);
  California($$renderer);
  $$renderer.push(`<!----> `);
  Fire($$renderer);
  $$renderer.push(`<!----> `);
  Colorado($$renderer);
  $$renderer.push(`<!----> `);
  Epilogue($$renderer);
  $$renderer.push(`<!----></main>`);
}
export {
  _page as default
};
