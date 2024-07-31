# Obsidian Ollama Fork

This repository is a fork of the [original Obsidian Ollama plugin](https://github.com/hinterdupfinger/obsidian-ollama) by [hinterdupfinger](https://github.com/hinterdupfinger).

Additional inspiration has been drawn from [JPW03's fork](https://github.com/JPW03/obsidian-ollama/tree/main).

## Principles

The core principles of this plugin are:

1. Simple setup for beginners
2. Sophisticated advanced configuration for power users
3. That's it!

I (hopefully `we` in the future) believe in keeping things straightforward and user-friendly.

## About

This is a plugin for [Obsidian](https://obsidian.md) that allows you to use [Ollama](https://ollama.ai) within your notes.
There are different pre configured promts:

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
