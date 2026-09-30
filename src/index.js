export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return env.ASSETS.fetch(request);
    }
    if (request.method === "POST") {
      try {
        const { prompt } = await request.json();
        const MODEL = "damo-vilab/modelscope-text-to-video-synthesis";
        const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        });
        if (!res.ok) {
          const t = await res.text();
          return new Response(t, { status: 500 });
        }
        return new Response(res.body, { headers: { "Content-Type": "video/mp4" } });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }
    return new Response("Not found", { status: 404 });
  }
}
