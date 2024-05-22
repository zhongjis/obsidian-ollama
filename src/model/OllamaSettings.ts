import { OllamaCommand } from "model/OllamaCommand";

export interface OllamaSettings {
  ollamaUrl: string;
  defaultModel: string;
  promptTemplate: string;
  commands: OllamaCommand[];
}
