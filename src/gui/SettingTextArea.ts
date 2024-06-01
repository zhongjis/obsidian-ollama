import { Setting } from "obsidian";

export class SettingTextArea extends Setting {

    constructor(containerEl: HTMLElement) {
        super(containerEl);
        this.settingEl.classList.remove("setting-item");
        this.settingEl.classList.add("setting-textarea");
    }

}