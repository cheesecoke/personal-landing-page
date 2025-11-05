import { x as ensure_array_like, y as attr, z as attr_class, F as attr_style, G as stringify, J as head } from "../../chunks/index.js";
import "clsx";
import "d3";
import "topojson-client";
function Globe($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<svg class="globe svelte-11hybid" width="400" height="400" viewBox="0 0 400 400"></svg>`);
  });
}
function Hero($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<section class="hero" id="hero"><div class="hero__stars hero__stars--1"></div> <div class="hero__stars hero__stars--2"></div> <div class="hero__stars hero__stars--3"></div> <div class="hero__stars hero__stars--4"></div> <div class="hero__stars hero__stars--5"></div> <div class="hero__large-name" aria-hidden="true"></div> <div class="hero__planet">`);
    Globe($$renderer2);
    $$renderer2.push(`<!----></div> <div class="hero__content"><p class="hero__tagline"></p> <div class="hero__scroll-hint"><span>Scroll to begin the journey</span> <svg class="scroll-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4 L12 20 M12 20 L6 14 M12 20 L18 14" stroke="currentColor" stroke-width="2" fill="none"></path></svg></div></div></section>`);
  });
}
function Kansas($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<section class="kansas svelte-1210ca5" id="kansas"><div class="kansas__hills-layer svelte-1210ca5"><svg class="kansas__sun svelte-1210ca5" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><circle cx="600" cy="520" r="180" fill="rgba(237, 135, 45, 0.15)"></circle><circle cx="600" cy="520" r="140" fill="rgba(242, 153, 74, 0.25)"></circle><circle cx="600" cy="520" r="100" fill="rgba(245, 176, 65, 0.7)"><animate attributeName="r" values="100;105;100" dur="4s" repeatCount="indefinite"></animate></circle><circle cx="600" cy="520" r="70" fill="rgba(250, 200, 100, 0.8)"></circle></svg> <svg class="kansas__hills kansas__hills--back svelte-1210ca5" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,800 L0,500 Q300,450 600,500 T1200,450 L1200,800 Z" fill="rgba(139, 160, 120, 0.9)"></path></svg> <svg class="kansas__hills kansas__hills--middle svelte-1210ca5" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,800 L0,550 Q300,500 600,550 T1200,500 L1200,800 Z" fill="rgba(120, 140, 100, 0.95)"></path></svg> <svg class="kansas__hills kansas__hills--front svelte-1210ca5" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,800 L0,600 Q300,570 600,600 T1200,570 L1200,800 Z" fill="rgba(100, 120, 80, 1)"></path></svg> <svg class="kansas__wheat svelte-1210ca5" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg"><!--[-->`);
    const each_array = ensure_array_like(Array(15));
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      $$renderer2.push(`<path class="wheat-stalk"${attr("d", `M${stringify(80 + i * 80)},800 Q${stringify(80 + i * 80)},${stringify(800 - Math.random() * 150)} ${stringify(80 + i * 80)},${stringify(800 - 250 - Math.random() * 80)}`)} stroke="rgba(201, 184, 150, 0.4)" stroke-width="2" fill="none" opacity="0.3"></path>`);
    }
    $$renderer2.push(`<!--]--></svg></div> <div class="kansas__content svelte-1210ca5"><h1 class="kansas__title svelte-1210ca5" style="transform: translateY(30px);">Kansas – Where I Found My Foundation</h1> <p class="kansas__text svelte-1210ca5" style="transform: translateY(30px);">In Kansas, I grew as a leader and a learner. School and college sparked my love for design—where I earned my art degree and discovered how to weave concepts into experiences that speak.</p></div> <div class="kansas__wireframes svelte-1210ca5"><!--[-->`);
    const each_array_1 = ensure_array_like(Array(8));
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      each_array_1[i];
      $$renderer2.push(`<div${attr_class(`wireframe-shape wireframe-shape--${stringify(i)}`, "svelte-1210ca5")}${attr_style(`left: ${stringify(15 + i * 12)}%; top: ${stringify(20 + Math.sin(i) * 30)}%;`)}><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="svelte-1210ca5"><rect x="10" y="10" width="80" height="80" fill="none" stroke="rgba(201, 184, 150, 0.3)" stroke-width="1" class="svelte-1210ca5"></rect><line x1="50" y1="10" x2="50" y2="90" stroke="rgba(201, 184, 150, 0.2)" stroke-width="1" class="svelte-1210ca5"></line><line x1="10" y1="50" x2="90" y2="50" stroke="rgba(201, 184, 150, 0.2)" stroke-width="1" class="svelte-1210ca5"></line></svg></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="kansas__transition svelte-1210ca5"></div></section>`);
  });
}
function California($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let patternCount = 150;
    let gridCols = 15;
    $$renderer2.push(`<section class="california svelte-a05zb6" id="california"><div class="california__svg-container svelte-a05zb6"><img src="/assets/California.svg" alt="California coastline illustration" class="svelte-a05zb6"/></div> <div class="california__content svelte-a05zb6"><h1 class="california__title svelte-a05zb6" style="transform: translateY(30px);">California – Where I Found Creation</h1> <p class="california__text svelte-a05zb6" style="transform: translateY(30px);">In California, I discovered collaboration and innovation. The West Coast sparked my passion for building—where I honed my technical skills and learned how to craft experiences that resonate.</p></div> <div class="surfboard-pattern svelte-a05zb6"><!--[-->`);
    const each_array = ensure_array_like(Array(patternCount));
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      if (i % 2 === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<img src="/assets/surfboard.svg" alt="" class="surfboard-item svelte-a05zb6"${attr_style(`left: ${stringify(i % gridCols * 130)}px; top: ${stringify(Math.floor(i / gridCols) * 130)}px;`)}/>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<img src="/assets/palmtree.svg" alt="" class="surfboard-item palmtree-item svelte-a05zb6"${attr_style(`left: ${stringify(i % gridCols * 130)}px; top: ${stringify(Math.floor(i / gridCols) * 130)}px;`)}/>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="california__transition svelte-a05zb6"></div></section>`);
  });
}
function Fire($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<section class="fire svelte-1gs3ezg" id="fire" aria-label="Fire chapter - Wildland firefighting experiences"><div class="fire__ember-layer svelte-1gs3ezg" aria-hidden="true"><svg class="fire__embers svelte-1gs3ezg" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg"><!--[-->`);
    const each_array = ensure_array_like(Array(25));
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      $$renderer2.push(`<g class="ember-particle svelte-1gs3ezg"${attr("transform", `translate(${stringify(60 + i * 50)}, ${stringify(700 + Math.random() * 100)})`)}><circle cx="0" cy="0"${attr("r", 4 + Math.random() * 3)}${attr("fill", `rgba(255, 140, 60, ${stringify(0.7 + Math.random() * 0.3)})`)} class="svelte-1gs3ezg"><animate attributeName="opacity" values="0.9;0.4;0.9"${attr("dur", `${stringify(2 + Math.random() * 2)}s`)} repeatCount="indefinite" class="svelte-1gs3ezg"></animate></circle><circle cx="0" cy="0"${attr("r", 8 + Math.random() * 4)} fill="rgba(255, 100, 30, 0.3)" class="svelte-1gs3ezg"><animate attributeName="r"${attr("values", `${stringify(8 + Math.random() * 4)};${stringify(14 + Math.random() * 4)};${stringify(8 + Math.random() * 4)}`)}${attr("dur", `${stringify(2 + Math.random() * 2)}s`)} repeatCount="indefinite" class="svelte-1gs3ezg"></animate></circle></g>`);
    }
    $$renderer2.push(`<!--]--></svg></div> <div class="fire__image-layer svelte-1gs3ezg" aria-hidden="true"><img src="/assets/fire.png" alt="" class="fire__image svelte-1gs3ezg"/></div> <div class="fire__heat-shimmer svelte-1gs3ezg" aria-hidden="true"></div> <div class="fire__content svelte-1gs3ezg"><h1 class="fire__title svelte-1gs3ezg">Fire – Where I Learned Humility and Strength</h1> <p class="fire__text svelte-1gs3ezg">In wildland firefighting, I discovered resilience and perspective. The mountains taught me humility—where I learned to respond to chaos with controlled strength and understood the weight of forces larger than myself.</p></div> <div class="fire__transition svelte-1gs3ezg"></div></section>`);
  });
}
function Colorado($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<section class="colorado svelte-oh1z2l" id="colorado"><div class="colorado__svg-container svelte-oh1z2l"><img src="/assets/colorado.svg" alt="Colorado mountains illustration" class="svelte-oh1z2l"/></div> <div class="colorado__artifacts svelte-oh1z2l" role="button" tabindex="0" aria-label="Hover to align code artifacts into grid pattern"><div class="code-artifact code-artifact--1 svelte-oh1z2l" style="left: 15%; top: 20%;"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="50" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.3)" font-size="60" font-family="monospace" class="svelte-oh1z2l">{ }</text></svg></div> <div class="code-artifact code-artifact--2 svelte-oh1z2l" style="left: 75%; top: 25%;"><svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="10" y="40" fill="rgba(139, 157, 131, 0.25)" font-size="24" font-family="monospace" class="svelte-oh1z2l">() =></text></svg></div> <div class="code-artifact code-artifact--3 svelte-oh1z2l" style="left: 10%; top: 65%;"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="50" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.3)" font-size="50" font-family="monospace" class="svelte-oh1z2l">&lt; ></text></svg></div> <div class="code-artifact code-artifact--4 svelte-oh1z2l" style="left: 80%; top: 70%;"><svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="10" y="40" fill="rgba(139, 157, 131, 0.25)" font-size="20" font-family="monospace" class="svelte-oh1z2l">const</text></svg></div> <div class="code-artifact code-artifact--5 svelte-oh1z2l" style="left: 50%; top: 15%;"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="50" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.2)" font-size="40" font-family="monospace" class="svelte-oh1z2l">fn</text></svg></div> <div class="code-artifact code-artifact--6 svelte-oh1z2l" style="left: 35%; top: 75%;"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="50" y="60" text-anchor="middle" fill="rgba(139, 157, 131, 0.3)" font-size="50" font-family="monospace" class="svelte-oh1z2l">[ ]</text></svg></div> <div class="code-artifact code-artifact--7 svelte-oh1z2l" style="left: 65%; top: 50%;"><svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg" class="svelte-oh1z2l"><text x="30" y="60" text-anchor="middle" fill="rgba(91, 143, 163, 0.25)" font-size="60" font-family="monospace" class="svelte-oh1z2l">;</text></svg></div></div> <div class="colorado__content svelte-oh1z2l"><h1 class="colorado__title svelte-oh1z2l" style="opacity: 0; transform: scale(0.95);">Colorado – A New Chapter in Code and Nature</h1> <p class="colorado__text svelte-oh1z2l" style="opacity: 0; transform: scale(0.95);">In Colorado, I found renewal—where mountains meet monitors, where trails inspire 
      algorithms. Here, nature and code aren't separate—they're intertwined. Each hike 
      clarifies a complex problem. Each line of code mirrors the precision of a summit. 
      This is where I build with purpose, blending outdoor wonder with technical craft.</p></div> <div class="colorado__transition svelte-oh1z2l"></div></section>`);
  });
}
function Epilogue($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    function createStars(count) {
      const stars2 = [];
      for (let i = 0; i < count; i++) {
        stars2.push({
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2
        });
      }
      return stars2;
    }
    const stars = createStars(150);
    $$renderer2.push(`<section class="epilogue svelte-1xotgno" id="epilogue"><div class="epilogue__starfield svelte-1xotgno"><!--[-->`);
    const each_array = ensure_array_like(stars);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let star = each_array[i];
      $$renderer2.push(`<div${attr_class(`epilogue__star star-${stringify(i)}`, "svelte-1xotgno")}${attr_style(`left: ${stringify(star.left)}%; top: ${stringify(star.top)}%; width: ${stringify(star.size)}px; height: ${stringify(star.size)}px;`)}></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="epilogue__circles svelte-1xotgno"><div class="epilogue__circle epilogue__circle--outer svelte-1xotgno"></div> <div class="epilogue__circle epilogue__circle--middle svelte-1xotgno"></div> <div class="epilogue__circle epilogue__circle--inner svelte-1xotgno"></div></div> <div class="epilogue__content svelte-1xotgno"><div class="epilogue__ctas svelte-1xotgno"><a href="mailto:your.email@example.com" class="epilogue__cta-button epilogue__cta-button--primary svelte-1xotgno" aria-label="Contact me via email">Contact Me</a> <a href="https://cheesecoke.github.io/cheesecoke/" class="epilogue__cta-button epilogue__cta-button--secondary svelte-1xotgno" target="_blank" rel="noopener noreferrer" aria-label="View my projects in progress">View My Projects</a></div> <p class="epilogue__narrative svelte-1xotgno">This is just the beginning—<br class="svelte-1xotgno"/> let's code the next chapter together.</p></div></section>`);
  });
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
  $$renderer.push(`<!---->  `);
  Hero($$renderer);
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
