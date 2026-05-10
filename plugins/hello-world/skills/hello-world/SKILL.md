---
name: hello-world
description: Use when the user types "/hello-world" or asks to verify the toolkit plugin loaded correctly
---

# Hello World

## Overview

A trivial skill that confirms this plugin is installed and discoverable by Claude Code.

## When to Use

- The user invokes `/hello-world`
- The user asks "is the toolkit loaded?" or similar
- You want to sanity-check skill discovery while developing the plugin

## What to Do

Reply with a single short sentence confirming the skill ran, and include:

1. The plugin name (`hello-world`)
2. The marketplace name (`jorgeilopez-toolkit`)
3. The current working directory

That's it. Do not call any tools unless the user asks you to.
