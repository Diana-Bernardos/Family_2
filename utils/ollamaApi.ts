import axios from "axios"

const OLLAMA_API_URL = "http://localhost:11434/api/generate"

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model: "llama3.2:3b-instruct-q8_0",
      prompt: prompt,
      stream: false,
    })

    return response.data.response
  } catch (error) {
    console.error("Error calling Ollama API:", error)
    return "Lo siento, ha ocurrido un error al procesar tu solicitud."
  }
}

