import { kebabCase } from "service/kebabCase";
import { Editor, Notice, Plugin, requestUrl } from "obsidian";
import { OllamaSettingTab } from "OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";
import { CustomPromptModal } from "CustomPromptModal";
import { OllamaCommand } from "model/OllamaCommand";

export class Ollama extends Plugin {
  settings: OllamaSettings;

  async onload() {
    await this.loadSettings();
    this.addCustomPromptCommand();
    this.addPromptCommands();
    this.addSettingTab(new OllamaSettingTab(this.app, this));
  }

  private addPromptCommands() {
    this.settings.commands.forEach((command) => {
      this.addCommand({
        id: kebabCase(command.name),
        name: command.name,
        editorCallback: (editor: Editor) => {
          this.promptOllama(editor, command);
        },
      });
    });
  }

  private addCustomPromptCommand() {
    this.addCommand({
      id: "custom-prompt",
      name: "Custom prompt",
      hotkeys: [{ modifiers: ["Mod"], key: "i" }],
      editorCallback: (editor: Editor) => {
        this.customPromptCommandCallback(editor);
      },
    });

    this.addRibbonIcon("bot", "Ollama Custom Prompt", () => {
      const editor = this.app.workspace.activeEditor?.editor;
      if (editor) {
        this.customPromptCommandCallback(editor);
      }
      else {
        new Notice("Please open a file and select some text.");
      }
    });
  }

  private customPromptCommandCallback(editor: Editor) {
    new CustomPromptModal(this.app, (prompt) => {
      const customCommand: OllamaCommand = {
        name: "Custom prompt",
        prompt: prompt,
      };
      // Uses the default model and temperature

      this.promptOllama(editor, customCommand);
    }).open();
  }

  private promptOllama(editor: Editor, command: OllamaCommand) {
    const selection = editor.getSelection();
    const text = selection ? selection : editor.getValue();

    // Construct full prompt
    let template = this.settings.promptTemplate;
    if (template.contains("{prompt}") === false) {
      new Notice("Warning: Your prompt template does not contain '{prompt}'. Your template will not be used.");
      template = "{prompt}";
    }
    const prompt = template.replace("{prompt}", command.prompt) + "\n\n" + text;

    const cursorPosition = editor.getCursor();
    editor.replaceRange("✍️", cursorPosition);

    new Notice("Prompted Ollama with the following:" + prompt, 5000);

    requestUrl({
      method: "POST",
      url: `${this.settings.ollamaUrl}/api/generate`,
      body: JSON.stringify({
        prompt: prompt,
        model: command.model || this.settings.defaultModel,
        options: {
          temperature: command.temperature || 0.2,
        },
      }),
    })
      .then((response) => {
        const steps = response.text
          .split("\n")
          .filter((step) => step && step.length > 0)
          .map((step) => JSON.parse(step));

        editor.replaceRange(
          steps
            .map((step) => step.response)
            .join("")
            .trim(),
          cursorPosition,
          {
            ch: cursorPosition.ch + 1, // accounts for the added writing emoji
            line: cursorPosition.line,
          }
        );
      })
      .catch((error) => {
        new Notice(`Error while generating text: ${error.message}`);
        editor.replaceRange("", cursorPosition, {
          ch: cursorPosition.ch + 1,
          line: cursorPosition.line,
        });
      });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
