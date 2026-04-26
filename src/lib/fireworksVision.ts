/**
 * FireworksVision — browser-safe Fireworks AI vision client.
 * Uses fetch + base64 encoding (no Node.js fs).
 */

const FIREWORKS_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
const FIREWORKS_MODEL = "accounts/fireworks/models/kimi-k2p6";

/** Convert a File or public-asset URL to a base64 data-URI. */
async function toDataUri(source: File | string): Promise<string> {
  if (typeof source === "string") {
    // Absolute http/https URL — keep as-is
    if (source.startsWith("http://") || source.startsWith("https://")) {
      return source;
    }
    // Treat as a public-folder path (e.g. "/knowledgebase/twill/image.jpeg")
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`Failed to fetch image asset: ${source} (Status: ${res.status})`);
    }
    const blob = await res.blob();
    return blobToDataUri(blob);
  }
  // File object from an <input type="file">
  return blobToDataUri(source);
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function imageBlock(uri: string) {
  return { type: "image_url", image_url: { url: uri } };
}

/**
 * Compare two images with the Fireworks vision model.
 *
 * @param apiKey   Fireworks API key
 * @param image1   First image (File | public path | http URL)
 * @param image2   Second image (File | public path | http URL)
 * @param aspect   The question to ask
 * @returns        Confidence score as a number between 0 and 100
 */
export async function compareImages(
  apiKey: string,
  image1: File | string,
  image2: File | string,
  aspect: string = "Do these two images show the same weave pattern?"
): Promise<number> {
  const [uri1, uri2] = await Promise.all([toDataUri(image1), toDataUri(image2)]);

  const response = await fetch(FIREWORKS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: FIREWORKS_MODEL,
      max_tokens: 2480,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You are a textile weave analysis expert. Your ONLY task is to compare two images and estimate the probability that they show the same weave pattern. Never provide explanations or descriptions. Answer with exactly one integer between 0 and 100 representing your confidence percentage."
        },
        {
          role: "user",
          content: [
            imageBlock(uri1),
            imageBlock(uri2),
            {
              type: "text",
              text: `${aspect}`,
            },
          ],
        },
      ],
      "thinking": {"type": "disabled"}
    }),
  });

  if (!response.ok) {
    throw new Error(`Fireworks API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const content = (data.choices[0].message.content as string).trim();
  console.log("Agent Response:", content);
  
  const match = content.match(/\d+/);
  if (match) {
    const score = parseInt(match[0], 10);
    return Math.min(Math.max(score, 0), 100);
  }
  return 0;
}
