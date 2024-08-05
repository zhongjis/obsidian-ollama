import { OllamaCommand } from "model/OllamaCommand";
import { App, Modal, Setting } from "obsidian";

export class SaveCustomPromptModal extends Modal {
  command: OllamaCommand;
  onSubmit: (previousCustomPrompt: OllamaCommand) => void;

  constructor(
    app: App,
    previousCustomPrompt: OllamaCommand,
    onSubmit: (previousCustomPrompt: OllamaCommand) => void,
  ) {
    super(app);
    this.command = previousCustomPrompt;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "Saving Custom Prompt" });

    contentEl.createEl("p", {
      text: `Enter a name for the prompt "${this.command.prompt}".`,
    });

    new Setting(contentEl).setName("Name").addText((text) => {
      text.setPlaceholder("e.g. Summarize Text").onChange((value) => {
        this.command.name = value;
      });
    });

    new Setting(contentEl).addButton((button) => {
      button.setButtonText("Submit").onClick(() => {
        this.onSubmit(this.command);
        this.close();
      });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
