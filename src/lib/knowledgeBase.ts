/**
 * Knowledge-base manifest.
 * Each entry maps a human-readable pattern name to its reference
 * image path (served from /public, so the browser can fetch it).
 */

export interface KnowledgeBaseEntry {
  name: string;
  /** Path relative to the public root, e.g. "/knowledgebase/twill/image.jpeg" */
  imagePath: string;
}

export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    name: "Diamond Weave",
    imagePath:
      "/knowledgebase/diamond/WhatsApp Image 2026-04-26 at 22.55.45.jpeg",
  },
  {
    name: "Plain Weave",
    imagePath:
      "/knowledgebase/plain-weave/WhatsApp Image 2026-04-26 at 22.50.58 (1).jpeg",
  },
  {
    name: "Herringbone",
    imagePath:
      "/knowledgebase/Herringbone/WhatsApp Image 2026-04-27 at 1.33.56 AM.jpeg",
  },
  {
    name: "Twill Weave",
    imagePath:
      "/knowledgebase/twill/WhatsApp Image 2026-04-26 at 22.51.53.jpeg",
  },
];
