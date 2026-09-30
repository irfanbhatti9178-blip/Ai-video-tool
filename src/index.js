export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return env.ASSETS.fetch(request);
    }
    if (request.method === "POST") {
      try {
        const { prompt } = await request.json();
        if (!env.HF_TOKEN) return new Response("HF_TOKEN nahi mila", { status: 500 });

        // NAYA HF LINK - yehi ab chalta hai
        const MODEL = "ali-vilab/text-to-video-ms-1.7b";
        const URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`;

        const res = await fetch(URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } }),
        });

        const contentType = res.headers.get("content-type") || "";
        
        // Agar error aaya to usko text ke tor pe dikhao
        if (!res.ok || contentType.includes("application/json")) {
          const errText = await res.text();
          return new Response(errText, { status: 500, headers: { "Content-Type": "text/plain" } });
        }

        return new Response(res.body, {
          headers: { "Content-Type": "video/mp4" },
        });
      } catch (e) {
        return new Response("Worker Error: " + e.message, { status: 500 });
      }
    }
  },
};
