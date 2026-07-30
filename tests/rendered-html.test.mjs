import assert from "node:assert/strict";
import test from "node:test";

async function renderHome() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the website-creation landing page", async () => {
  const response = await renderHome();
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /Sites que explicam, convencem/);
  assert.match(html, /Sites recentes/);
  assert.match(html, /Quem está por trás/);
  assert.match(html, /Soluções complementares/);
  assert.match(html, /Vamos conversar/);
  assert.doesNotMatch(html, /Projetos selecionados/);
  assert.doesNotMatch(html, /O que eu faço/);
});

test("renders absolute social sharing metadata", async () => {
  const response = await renderHome();
  const html = await response.text();

  assert.match(
    html,
    /property="og:image" content="http:\/\/localhost(?::3000)?\/og\.png"/,
  );
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});
