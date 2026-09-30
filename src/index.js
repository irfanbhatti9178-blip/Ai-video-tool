export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return env.ASSETS.fetch(request);
    }
    if (request.method === "POST") {
      try {
        const { prompt } = await request.json();
        if (!env.HF_TOKEN) return new Response("HF_TOKEN missing", { status: 500 });
        const res = await fetch("https://api-inference.huggingface.co/models/damo-vilab/modelscope-text-to-video-synthesis", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.HF_TOKEN.trim()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
        });
        if (!res.ok) {
          const t = await res.text();
          return new Response(`HF ${res.status}: ${t.slice(0,500)}`, { status: 500 });
        }
        const buf = await res.arrayBuffer();
        return new Response(buf, { headers: { "Content-Type": "video/mp4" } });
      } catch (e) {
        return new Response("Crash: " + e.message, { status: 500 });
      }
    }
  }
}
