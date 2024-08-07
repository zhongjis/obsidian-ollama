# Obsidian Ollama Fork

## Principles

The core principles of this plugin are:

1. Simple setup for beginners
2. Sophisticated advanced configuration for power users
3. That's it!

I (hopefully `we` in the future) believe in keeping things straightforward and user-friendly.

## About

This is a plugin for [Obsidian](https://obsidian.md) that allows you to use [Ollama](https://ollama.ai) within your notes.

You can create commands, which are reusable prompts to Ollama models.

By default, this plugin includes these commands.

    - Summarize selection
    - Explain selection
    - Expand selection
    - Rewrite selection (formal)
    - Rewrite selection (casual)
    - Rewrite selection (active voice)
    - Rewrite selection (bullet points)
    - Caption selection

But you can also configure your own prompts, specify their model and temperature. The plugin always passes the prompt and either selected text or full note to Ollama and inserts the result into your note at the cursor position.

This requires a local installation of [Ollama](https://ollama.ai) which can currently be installed as a [MacOS app](https://github.com/jmorganca/ollama#download). By default the plugin will connect to `http://localhost:11434` - the port of the MacOS app.

## Custom One-Off Prompts

The plugin command `Custom prompt` when ran will open a modal form where you can type a custom 1 time prompt to run on the selected text using the default model specified in the settings.

You can save the last custom prompt you ran to its own command using the command `Save custom prompt`.

## Tips and Tricks

### Prompts

To make it obvious in your prompt what context you are referring to, I recommend referring to your selected text as "the text" in the prompt, similar to how the prompt template refers to it.

### Prompt Template

This acts as wrapper text applied to all commands. For example, see the default prompt template:

```
Act as a writer. {prompt} Output only the text and nothing else, do not chat, no preamble, get to the point.
```

When you run a command, the `{prompt}` token is replaced with the command's prompt. If `{prompt}` is not specified, the template is appended to the prompt by default.

You may want certain commands to bypass this prompt template (for example if you wanted the model to act as another type of character). There is a setting for this.

### Model Template

The model template is a standard practice parameter of LLMs which help with formatting responses, specifying context and other fine-tuning.

Optionally, this plugin allows you to set a custom model template for the default model. If a command doesn't use the default model, the model template will be ignored.

The structure and syntax of a prompt template will depend on your model, utilising tokens that are specially recognised by that model. For example, a [llama3](https://llama.meta.com/docs/model-cards-and-prompt-formats/meta-llama-3/) model template would look something like this:

```
{{ if .System }}
<|start_header_id|>system<|end_header_id|>{{ .System }}<|eot_id|>
{{ end }}

<|start_header_id|>text<|end_header_id|>{text}<|eot_id|>

{{ if .Prompt }}<|start_header_id|>user<|end_header_id|>{{ .Prompt }}<|eot_id|>{{ end }}

<|start_header_id|>assistant<|end_header_id|>{{ .Response }}<|eot_id|>
```

Where the prompt is inserted is handled by the model (the prompt would be inserted at the llama3 token `{{ .Prompt }}`).

The selected text passed to a command would be inserted at the token `{text}`. This is handled by the plugin and will not depend on the model you use. You don't have to include this token in your model template (by default, the text is appended to the prompt).

Refer to the model's documentation for specific formatting information.

# Special Thanks

This repository is a fork from [Obsidian Ollama plugin](https://github.com/hinterdupfinger/obsidian-ollama) by [hinterdupfinger](https://github.com/hinterdupfinger).

Ideas drawn from [JPW03's fork](https://github.com/hinterdupfinger/obsidian-ollama/pull/2).
