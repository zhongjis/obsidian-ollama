import { App, Modal, Setting } from "obsidian";

export class CustomPromptModal extends Modal {
  prompt: string;
  onSubmit: (prompt: string) => void;

  constructor(app: App, onSubmit: (prompt: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl("h2", { text: "Enter Custom Prompt" });

    new Setting(contentEl)
      .setName("Prompt")
      .addText((text) => {
        text
        .setPlaceholder("e.g. Summarize the text in a few sentences highlighting the key takeaways.")
        .onChange((value) => {
          this.prompt = value;
        });
      });

    new Setting(contentEl)
      .addButton((button) => {
        button
          .setButtonText("Submit")
          .onClick(() => {
            this.onSubmit(this.prompt);
            this.close();
          });
      });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

}