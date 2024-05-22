import { App, Notice, PluginSettingTab, requestUrl, Setting } from "obsidian";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaCommand } from "model/OllamaCommand";
import { Ollama } from "Ollama";

export class OllamaSettingTab extends PluginSettingTab {
  plugin: Ollama;
  availableModels: Record<string, string>;
  availableModelsAndDefault: Record<string, string>;

  constructor(app: App, plugin: Ollama) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Ollama URL")
      .setDesc("URL of the Ollama server (e.g. http://localhost:11434)")
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:11434")
          .setValue(this.plugin.settings.ollamaUrl)
          .onChange(async (value) => {
            this.plugin.settings.ollamaUrl = value;
            setTimeout(async () => {
              await this.plugin.saveSettings();
              this.display();
            }, 1000); // wait for user to finish typing
          })
      );

    const loadingEl = containerEl.createEl("p", { text: "Loading..."});

    // Load available models
    this.loadAvailableModels().then(() => {
      // Load command settings if models are loaded
      containerEl.removeChild(loadingEl);

      new Setting(containerEl)
      .setName("Default model")
      .setDesc("Name of the default ollama model to use for prompts")
      .addDropdown((dropdown) =>
        dropdown
          .addOptions(this.availableModels)
          .setValue(this.plugin.settings.defaultModel)
          .onChange(async (value) => {
            this.plugin.settings.defaultModel = value;
            await this.plugin.saveSettings();
          })
      );

      new Setting(containerEl)
      .setName("Prompt template")
      .setDesc("Template applied to all command prompts. Use {prompt} to specify where the command prompt should be inserted when executing a command.")
      .addTextArea((text) =>
        text
          .setPlaceholder(
            "e.g. Act as a writer. {prompt} Output only the text and nothing else, do not chat, no preamble, get to the point."
          )
          .setValue(this.plugin.settings.promptTemplate)
          .onChange(async (value) => {
            this.plugin.settings.promptTemplate = value;
            await this.plugin.saveSettings();
          })
      );

      
      containerEl.createEl("h3", { text: "Commands" });

      const newCommand: OllamaCommand = {
        name: "",
        prompt: "",
        model: "Default",
        temperature: undefined,
      };
      this.displayCommandSettings(newCommand, containerEl);

      containerEl.createEl("h4", { text: "Existing Commands" });
      this.plugin.settings.commands.forEach((command) => {
        this.displayCommandSettings(command, containerEl);
      });

      containerEl.createEl("h4", { text: "Reset Commands" });

      new Setting(containerEl)
        .setName("Update Default Commands")
        .setDesc(
          "Update commands to the default commands. This cannot be undone and will overwrite some commands by matching names. This requires a reload of obsidian to take effect."
        )
        .addButton((button) => {
          button.setWarning();
          return button.setButtonText("Update").onClick(async () => {
            DEFAULT_SETTINGS.commands.forEach((command) => {
              const existingCommand = this.plugin.settings.commands.find(
                (c) => c.name === command.name
              );

              if (existingCommand) {
                existingCommand.prompt = command.prompt;
                existingCommand.model = command.model;
                existingCommand.temperature = command.temperature;
              } else {
                this.plugin.settings.commands.push(command);
              }
            });
            await this.plugin.saveSettings();
            this.display();
          });
        });

      new Setting(containerEl)
        .setName("Reset Commands")
        .setDesc(
          "Reset all commands to the default commands. This cannot be undone and will delete all your custom commands. This requires a reload of obsidian to take effect."
        )
        .addButton((button) => {
          button.setWarning();
          return button.setButtonText("Reset").onClick(async () => {
            this.plugin.settings.commands = DEFAULT_SETTINGS.commands;
            await this.plugin.saveSettings();
            this.display();
          });
        });

    })
    .catch((error) => {
      containerEl.removeChild(loadingEl);
      // TODO prompt user to enter the correct URL and refresh button
      new Notice("Ollama is not running or the URL is incorrect.");

      // TODO markdown [!failure] style box
      containerEl.createEl("p", { text: "Couldn't connect to Ollama. Please enter the correct URL." });
      const debug = containerEl.createEl("p", { text: `This error might help you figure out what went wrong:` });
      debug.createEl("pre", { text: error });
    });
  }

  // Loads the setting inputs for a single command to allow for editing/saving
  private async displayCommandSettings(command: OllamaCommand, containerEl: HTMLElement): Promise<void> {
    const commandIndex = this.plugin.settings.commands.findIndex(
      (c) => c.name === command.name
    );

    // Title
    if (commandIndex !== -1) {
      containerEl.createEl("h5", { text: command.name });
    }
    else {
      containerEl.createEl("h4", { text: "New Command" });
    }

    // Inputs
    new Setting(containerEl)
      .setName("Command name")
      .setDesc("Name of the command")
      .addText((text) =>
        text
          .setPlaceholder("e.g. Summarize selection")
          .setValue(command.name)
          .onChange(async (value) => {
            command.name = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Command prompt")
      .setDesc("Prompt for the command")
      .addTextArea((text) =>
        text // TODO expand the default size
          .setPlaceholder(
            "e.g. Summarize the text in a view sentences highlighting the key takeaways."
          )
          .setValue(command.prompt)
          .onChange(async (value) => {
            command.prompt = value;
          })
      );

    new Setting(containerEl)
      .setName("Command model")
      .setDesc("Run this model on a specific model or the default model.")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions(this.availableModelsAndDefault)
          .setValue(command.model || "Default")
          .onChange(async (value) => {
            command.model = value === "Default" ? undefined : value;
          });
      }
    );

    new Setting(containerEl)
      .setName("Command temperature")
      .setDesc("Temperature to use for the command")
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.01)
          .setValue(command.temperature || 0.2)
          .onChange(async (value) => {
            command.temperature = value;
          })
      );


    // Buttons

    // Only show add command button if new command
    if (commandIndex === -1) {
      new Setting(containerEl)
        .setDesc("This requires a reload of obsidian to take effect.")
        .addButton((button) =>
          button.setButtonText("Add Command").onClick(async () => {
            await this.addCommand(command);
          })
        );
    }
    else {
      // TODO add to one line
      new Setting(containerEl)
        .addButton((button) =>
          button.setButtonText("Save").onClick(async () => {
            await this.updateCommand(command, commandIndex);
          })
        );

      new Setting(containerEl)
        .addButton((button) =>
          button.setButtonText("Remove").onClick(async () => {
            this.plugin.settings.commands =
              this.plugin.settings.commands.filter(
                (c) => c.name !== command.name
              );
            await this.plugin.saveSettings();
            this.display();
          })
        );
    }
  }

  // Calls the Ollama /api/tags endpoint to get the list of installed models
  // If Ollama is not running/URL is incorrect, an error is thrown.
  async loadAvailableModels() {
    const response = await requestUrl({
        url: this.plugin.settings.ollamaUrl + '/api/tags',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const models: string[] = response.json.models.map( (model: { name: string }) => model.name.replace(':latest', '') );
    this.availableModels = models.reduce((record, model) => {
      record[model] = model;
      return record;
    }, {} as Record<string, string>);
    // availableModels is stored as a Record<string, string> because that's what addDropdown takes as options

    this.availableModelsAndDefault = { ...this.availableModels, "Default": "Default" };
  }

  // Save handlers

  private async addCommand(newCommand: OllamaCommand): Promise<void> {
    if (this.validateCommand(newCommand)) {
      this.plugin.settings.commands.push(newCommand);
      await this.plugin.saveSettings();
      this.display();
    }
  }

  private async updateCommand(command: OllamaCommand, index: number): Promise<void> {
    const existingCommand = this.plugin.settings.commands[index];

    if (this.validateCommand(command)) {
      if (existingCommand) {
        existingCommand.name = command.name;
        existingCommand.prompt = command.prompt;
        existingCommand.model = command.model;
        existingCommand.temperature = command.temperature;
      }
      else {
        // This shouldn't happen but just in case
        new Notice("Unable to edit the command. Creating a new one instead.")
        this.plugin.settings.commands.push(command);
      }

      await this.plugin.saveSettings();
      this.display();
    }
  }

  private validateCommand(command: OllamaCommand): boolean {
    if (!command.name) {
      new Notice("Please enter a name for the command.");
      return false;
    }

    if (
      this.plugin.settings.commands.find(
        (command) => command.name === command.name
      )
    ) {
      new Notice(
        `A command with the name "${command.name}" already exists.`
      );
      return false;
    }
    
    if (!command.prompt) {
      new Notice("Please enter a prompt for the command.");
      return false;
    }

    command.model = command.model === "Default" ? undefined : command.model;

    return true;
  }
}
