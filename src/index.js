export default {
  async fetch(request, env) {
    // Website dikhana
    if (request.method === "GET") {
      return env.ASSETS.fetch(request);
    }

    // Video banana
    if (request.method === "POST") {
      try {
        const { prompt } = await request.json();
        
        if (!prompt) {
          return new Response("Prompt missing", { status: 400 });
        }
        if (!env.HF_TOKEN) {
          return new Response("HF_TOKEN secret missing in Cloudflare", { status: 500 });
        }

        const MODEL = "damo-vilab/modelscope-text-to-video-synthesis";
        const url = `https://api-inference.huggingface.co/models/${MODEL}`;

        const hfRes = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.HF_TOKEN.trim()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true, use_cache: false }
          })
        });

        if (!hfRes.ok) {
          const err = await hfRes.text();
          return new Response(`HF Error ${hfRes.status}: ${err.slice(0, 600)}`, {
            status: 500,
            headers: { "Content-Type": "text/plain" }
          });
        }

        // Check if HF returned JSON error instead of video
        const ct = hfRes.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const err = await hfRes.text();
          return new Response(`HF JSON Error: ${err.slice(0, 600)}`, { status: 500 });
        }

        const videoBuffer = await hfRes.arrayBuffer();
        
        return new Response(videoBuffer, {
          headers: {
            "Content-Type": "video/mp4",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*"
          }
        });

      } catch (e) {
        return new Response("Worker Crash: " + e.message + " " + e.stack?.slice(0,300), { status: 500 });
      }
    }

    return new Response("Not found", { status: 404 });
  }
}
