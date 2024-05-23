# 🦙 Obsidian Ollama

This is a plugin for [Obsidian](https://obsidian.md) that allows you to use [Ollama](https://ollama.ai) within your notes.
There are different pre configured prompts:

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

## Tips and Tricks

### Prompt Template

This acts as a wrapper applied to all commands. For example, see the default prompt template:
```

```
(explanation)

### Model Template

The model template is a standard practice parameter of LLMs which help with formatting and fine-tuning your commands.

The structure and syntax of a prompt template will depend on your model. The following examples will be based on [llama3]()