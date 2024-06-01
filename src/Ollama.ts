import { kebabCase } from "service/kebabCase";
import { Editor, Notice, Plugin, requestUrl } from "obsidian";
import { OllamaSettingTab } from "gui/OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";
import { CustomPromptModal } from "gui/CustomPromptModal";
import { OllamaCommand } from "model/OllamaCommand";
import { SaveCustomPromptModal } from "gui/SaveCustomPromptModal";

export class Ollama extends Plugin {
  settings: OllamaSettings;
  previousCustomPrompt: OllamaCommand | null = null;

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

    // Add custom prompt command to ribbon
    this.addRibbonIcon("bot", "Ollama Custom Prompt", () => {
      const editor = this.app.workspace.activeEditor?.editor;
      if (editor) {
        this.customPromptCommandCallback(editor);
      }
      else {
        new Notice("Please open a file and select some text.");
      }
    });

    // Allow users to save their previous custom prompt to a command
    this.addCommand({
      id: "save-custom-prompt",
      name: "Save custom prompt",
      callback: () => {
        if (!this.previousCustomPrompt) {
          new Notice("No custom prompt to save.");
        }
        else {
          // Open modal to ask user for command name.
          new SaveCustomPromptModal(this.app, this.previousCustomPrompt, (previousCustomPrompt) => {
            this.settings.commands.push(previousCustomPrompt);
            new Notice("Custom prompt saved.");
          }).open();
        }
      },
    });
  }

  private customPromptCommandCallback(editor: Editor) {
    new CustomPromptModal(this.app, (prompt) => {
      const customCommand: OllamaCommand = {
        name: "Custom prompt",
        prompt: prompt,
      };
      // Uses the default model and temperature

      // Record this custom prompt in case the user wants to save it
      this.previousCustomPrompt = customCommand;

      this.promptOllama(editor, customCommand);
    }).open();
  }

  private promptOllama(editor: Editor, command: OllamaCommand) {
    const selection = editor.getSelection();
    const text = selection ? selection : editor.getValue();

    const textInTemplate = this.settings.modelTemplate.contains("{text}");
    const promptInTemplate = this.settings.promptTemplate.contains("{prompt}");
    // new Notice(`debug: ${textInTemplate} ${promptInTemplate}`, 5000);
    // new Notice(`debug: ${this.settings.promptTemplate} ${this.settings.modelTemplate}`, 5000);

    let prompt = command.prompt;
    if (!command.ignorePromptTemplate) {
      // If the prompt template doesn't specify where the prompt should be inserted, prepend the prompt.
      prompt = promptInTemplate ? 
        this.settings.promptTemplate.replace("{prompt}", command.prompt) :
        command.prompt + "\n\n" + this.settings.promptTemplate;
    }
    
    // If the model template doesn't specify where the text should be inserted, append to prompt.
    prompt = textInTemplate ? 
      prompt : 
      prompt + "\n\n\"" + text + "\"";

    const template = textInTemplate ? 
      this.settings.modelTemplate.replace("{text}", text) : 
      this.settings.modelTemplate;

    const cursorPosition = editor.getCursor();
    editor.replaceRange("✍️", cursorPosition);

    // new Notice("debug: Prompted Ollama with the following: " + prompt, 5000);

    requestUrl({
      method: "POST",
      url: `${this.settings.ollamaUrl}/api/generate`,
      body: JSON.stringify({
        prompt,
        model: command.model || this.settings.defaultModel,
        options: {
          temperature: command.temperature || 0.2,
        },
        template,
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
