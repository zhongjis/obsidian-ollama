import { OllamaSettings } from "model/OllamaSettings";

export const DEFAULT_SETTINGS: OllamaSettings = {
  ollamaUrl: "http://localhost:11434",
  defaultModel: "llama2",
  promptTemplate: "Act as a writer. {prompt} Output only the text and nothing else, do not chat, no preamble, get to the point.",
  commands: [
    {
      name: "Summarize selection",
      prompt:
        "Summarize the text in a few sentences highlighting the key takeaways.",
    },
    {
      name: "Explain selection",
      prompt:
        "Explain the text in simple and concise terms keeping the same meaning.",
    },
    {
      name: "Expand selection",
      prompt:
        "Expand the text by adding more details while keeping the same meaning.",
    },
    {
      name: "Rewrite selection (formal)",
      prompt:
        "Rewrite the text in a more formal style while keeping the same meaning.",
    },
    {
      name: "Rewrite selection (casual)",
      prompt:
        "Rewrite the text in a more casual style while keeping the same meaning.",
    },
    {
      name: "Rewrite selection (active voice)",
      prompt:
        "Rewrite the text in with an active voice while keeping the same meaning.",
    },
    {
      name: "Rewrite selection (bullet points)",
      prompt:
        "Rewrite the text into bullet points while keeping the same meaning.",
    },
    {
      name: "Caption selection",
      prompt:
        "Create only one single heading for the whole text that is giving a good understanding of what the reader can expect. Your format should be ## Caption.",
    },
  ],
};
