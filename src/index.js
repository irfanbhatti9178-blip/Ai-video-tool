export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return env.ASSETS.fetch(request);
    }
    if (request.method === "POST") {
      try {
        const { prompt } = await request.json();
        if (!env.HF_TOKEN) return new Response("HF_TOKEN missing", { status: 500 });

        const MODEL = "damo-vilab/modelscope-text-to-video-synthesis";
        const hfRes = await fetch(`https://router.huggingface.co/hf-inference/models/${MODEL}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.HF_TOKEN.trim()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
        });

        if (!hfRes.ok) {
          const err = await hfRes.text();
          return new Response(`HF Error ${hfRes.status}: ${err}`, { status: 500 });
        }

        const buffer = await hfRes.arrayBuffer();
        return new Response(buffer, { headers: { "Content-Type": "video/mp4" } });

      } catch (e) {
        return new Response("Worker Error: " + e.message, { status: 500 });
      }
    }
  }
}
