import { OllamaCommand } from "model/OllamaCommand";

export interface OllamaSettings {
  ollamaUrl: string;
  defaultModel: string;
  modelTemplate: string; // The template parameter of the model
  promptTemplate: string; // A wrapper applied to all command prompts
  commands: OllamaCommand[];
}
