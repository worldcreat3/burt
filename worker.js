export default {
  async fetch(request) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    try {

      const body = await request.json()
      const prompt = body.prompt

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents:[{parts:[{text:prompt}]}]
          })
        }
      )

      const text = await response.text()

      return new Response(text,{
        headers:{
          "Content-Type":"application/json",
          "Access-Control-Allow-Origin":"*"
        }
      })

    } catch (err) {

      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status:500,
          headers:{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
          }
        }
      )

    }

  }
}
