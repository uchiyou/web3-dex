# Create custom subagents

> Create and use specialized AI subagents in Claude Code for task-specific workflows and improved context management.

Subagents are specialized AI assistants that handle specific types of tasks. Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions. When Claude encounters a task that matches a subagent's description, it delegates to that subagent, which works independently and returns results.

<Note>
  If you need multiple agents working in parallel and communicating with each other, see [agent teams](/en/agent-teams) instead. Subagents work within a single session; agent teams coordinate across separate sessions.
</Note>

Subagents help you:

* **Preserve context** by keeping exploration and implementation out of your main conversation
* **Enforce constraints** by limiting which tools a subagent can use
* **Reuse configurations** across projects with user-level subagents
* **Specialize behavior** with focused system prompts for specific domains
* **Control costs** by routing tasks to faster, cheaper models like Haiku

Claude uses each subagent's description to decide when to delegate tasks. When you create a subagent, write a clear description so Claude knows when to use it.

Claude Code includes several built-in subagents like **Explore**, **Plan**, and **general-purpose**. You can also create custom subagents to handle specific tasks. This page covers the built-in subagents, how to create your own, full configuration options, patterns for working with subagents, and example subagents.

## Built-in subagents

Claude Code includes built-in subagents that Claude automatically uses when appropriate. Each inherits the parent conversation's permissions with additional tool restrictions.

### Explore

A fast, read-only agent optimized for searching and analyzing codebases.

* **Model**: Haiku (fast, low-latency)
* **Tools**: Read-only tools (denied access to Write and Edit tools)
* **Purpose**: File discovery, code search, codebase exploration

Claude delegates to Explore when it needs to search or understand a codebase without making changes. This keeps exploration results out of your main conversation context.

When invoking Explore, Claude specifies a thoroughness level: **quick** for targeted lookups, **medium** for balanced exploration, or **very thorough** for comprehensive analysis.

### Plan

A research agent used during plan mode to gather context before presenting a plan.

* **Model**: Inherits from main conversation
* **Tools**: Read-only tools (denied access to Write and Edit tools)
* **Purpose**: Codebase research for planning

When you're in plan mode and Claude needs to understand your codebase, it delegates research to the Plan subagent. This prevents infinite nesting (subagents cannot spawn other subagents) while still gathering necessary context.

### General-purpose

A capable agent for complex, multi-step tasks that require both exploration and action.

* **Model**: Inherits from main conversation
* **Tools**: All tools
* **Purpose**: Complex research, multi-step operations, code modifications

Claude delegates to general-purpose when the task requires both exploration and modification, complex reasoning to interpret results, or multiple dependent steps.

### Other

Claude Code includes additional helper agents for specific tasks. These are typically invoked automatically, so you don't need to use them directly.

| Agent             | Model  | When Claude uses it                                      |
| :---------------- | :----- | :------------------------------------------------------- |
| statusline-setup  | Sonnet | When you run `/statusline` to configure your status line |
| Claude Code Guide | Haiku  | When you ask questions about Claude Code features        |

Beyond these built-in subagents, you can create your own with custom prompts, tool restrictions, permission modes, hooks, and skills.

## Quickstart: create your first subagent

Subagents are defined in Markdown files with YAML frontmatter. You can create them manually or use the `/agents` command.

This walkthrough guides you through creating a user-level subagent with the `/agents` command. The subagent reviews code and suggests improvements for the codebase.

**Step 1: Open the subagents interface**

In Claude Code, run: `/agents`

**Step 2: Choose a location**

Select **Create new agent**, then choose **Personal**. This saves the subagent to `~/.claude/agents/` so it's available in all your projects.

**Step 3: Generate with Claude**

Select **Generate with Claude**. When prompted, describe the subagent.

**Step 4: Select tools**

For a read-only reviewer, deselect everything except **Read-only tools**. If you keep all tools selected, the subagent inherits all tools available to the main conversation.

**Step 5: Select model**

Choose which model the subagent uses. For this example agent, select **Sonnet**, which balances capability and speed for analyzing code patterns.

**Step 6: Choose a color**

Pick a background color for the subagent. This helps you identify which subagent is running in the UI.

**Step 7: Configure memory**

Select **User scope** to give the subagent a persistent memory directory at `~/.claude/agent-memory/`. The subagent uses this to accumulate insights across conversations. Select **None** if you don't want the subagent to persist learnings.

**Step 8: Save and try it out**

Review the configuration summary. Press `s` or `Enter` to save, or press `e` to save and edit the file in your editor. The subagent is available immediately. Try it:

```
Use the code-improver agent to suggest improvements in this project
```

Claude delegates to your new subagent, which scans the codebase and returns improvement suggestions.

## Configure subagents

### Use the /agents command

The `/agents` command provides an interactive interface for managing subagents. Run `/agents` to:

* View all available subagents (built-in, user, project, and plugin)
* Create new subagents with guided setup or Claude generation
* Edit existing subagent configuration and tool access
* Delete custom subagents
* See which subagents are active when duplicates exist

This is the recommended way to create and manage subagents. For manual creation or automation, you can also add subagent files directly.

To list all configured subagents from the command line without starting an interactive session, run `claude agents`. This shows agents grouped by source and indicates which are overridden by higher-priority definitions.

### Choose the subagent scope

Subagents are Markdown files with YAML frontmatter. Store them in different locations depending on scope. When multiple subagents share the same name, the higher-priority location wins.

| Location                     | Scope                   | Priority    | How to create                                 |
| :--------------------------- | :---------------------- | :---------- | :-------------------------------------------- |
| Managed settings             | Organization-wide       | 1 (highest) | Deployed via managed settings                 |
| `--agents` CLI flag          | Current session         | 2           | Pass JSON when launching Claude Code          |
| `.claude/agents/`            | Current project         | 3           | Interactive or manual                         |
| `~/.claude/agents/`          | All your projects       | 4           | Interactive or manual                         |
| Plugin's `agents/` directory | Where plugin is enabled | 5 (lowest)  | Installed with plugins                        |

**Project subagents** (`.claude/agents/`) are ideal for subagents specific to a codebase. Check them into version control so your team can use and improve them collaboratively.

**User subagents** (`~/.claude/agents/`) are personal subagents available in all your projects.

**CLI-defined subagents** are passed as JSON when launching Claude Code. They exist only for that session and aren't saved to disk, making them useful for quick testing or automation scripts. You can define multiple subagents in a single `--agents` call:

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

### Write subagent files

Subagent files use YAML frontmatter for configuration, followed by the system prompt in Markdown:

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

The frontmatter defines the subagent's metadata and configuration. The body becomes the system prompt that guides the subagent's behavior. Subagents receive only this system prompt (plus basic environment details like working directory), not the full Claude Code system prompt.

#### Supported frontmatter fields

The following fields can be used in the YAML frontmatter. Only `name` and `description` are required.

| Field             | Required | Description                                                                                                                                                                                                                                                                  |
| :---------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Yes      | Unique identifier using lowercase letters and hyphens                                                                                                                                                                                                                        |
| `description`     | Yes      | When Claude should delegate to this subagent                                                                                                                                                                                                                                 |
| `tools`           | No       | Tools the subagent can use. Inherits all tools if omitted                                                                                                                                                                                                                    |
| `disallowedTools` | No       | Tools to deny, removed from inherited or specified list                                                                                                                                                                                                                      |
| `model`           | No       | Model to use: `sonnet`, `opus`, `haiku`, a full model ID (for example, `claude-opus-4-6`), or `inherit`. Defaults to `inherit`                                                                                                                            |
| `permissionMode`  | No       | Permission mode: `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, or `plan`                                                                                                                                                            |
| `maxTurns`        | No       | Maximum number of agentic turns before the subagent stops                                                                                                                                                                                                                    |
| `skills`          | No       | Skills to load into the subagent's context at startup. The full skill content is injected, not just made available for invocation. Subagents don't inherit skills from the parent conversation                                                                 |
| `mcpServers`      | No       | MCP servers available to this subagent. Each entry is either a server name referencing an already-configured server or an inline definition                                                                 |
| `hooks`           | No       | Lifecycle hooks scoped to this subagent                                                                                                                                                                                                       |
| `memory`          | No       | Persistent memory scope: `user`, `project`, or `local`. Enables cross-session learning                                                                                                                                                          |
| `background`      | No       | Set to `true` to always run this subagent as a background task. Default: `false`                                                                                                                                               |
| `effort`          | No       | Effort level when this subagent is active. Overrides the session effort level. Default: inherits from session. Options: `low`, `medium`, `high`, `max`                                                                                                       |
| `isolation`       | No       | Set to `worktree` to run the subagent in a temporary git worktree, giving it an isolated copy of the repository. The worktree is automatically cleaned up if the subagent makes no changes      |
| `color`           | No       | Display color for the subagent in the task list and transcript. Accepts `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, or `cyan`                                                                                                                              |
| `initialPrompt`   | No       | Auto-submitted as the first user turn when this agent runs as the main session agent. Prepended to any user-provided prompt                                          |

### Choose a model

The `model` field controls which AI model the subagent uses:

* **Model alias**: Use one of the available aliases: `sonnet`, `opus`, or `haiku`
* **Full model ID**: Use a full model ID such as `claude-opus-4-6` or `claude-sonnet-4-6`
* **inherit**: Use the same model as the main conversation
* **Omitted**: If not specified, defaults to `inherit`

When Claude invokes a subagent, it can also pass a `model` parameter for that specific invocation. Claude Code resolves the subagent's model in this order:

1. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable, if set
2. The per-invocation `model` parameter
3. The subagent definition's `model` frontmatter
4. The main conversation's model

### Control subagent capabilities

You can control what subagents can do through tool access, permission modes, and conditional rules.

#### Available tools

Subagents can use any of Claude Code's internal tools. By default, subagents inherit all tools from the main conversation, including MCP tools.

To restrict tools, use either the `tools` field (allowlist) or the `disallowedTools` field (denylist). This example uses `tools` to exclusively allow Read, Grep, Glob, and Bash:

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

This example uses `disallowedTools` to inherit every tool from the main conversation except Write and Edit:

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

If both are set, `disallowedTools` is applied first, then `tools` is resolved against the remaining pool.

#### Restrict which subagents can be spawned

When an agent runs as the main thread with `claude --agent`, it can spawn subagents using the Agent tool. To restrict which subagent types it can spawn, use `Agent(agent_type)` syntax in the `tools` field:

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

This is an allowlist: only the `worker` and `researcher` subagents can be spawned. If the agent tries to spawn any other type, the request fails.

To allow spawning any subagent without restrictions, use `Agent` without parentheses:

```yaml
tools: Agent, Read, Bash
```

If `Agent` is omitted from the `tools` list entirely, the agent cannot spawn any subagents.

#### Scope MCP servers to a subagent

Use the `mcpServers` field to give a subagent access to MCP servers that aren't available in the main conversation. Inline servers defined here are connected when the subagent starts and disconnected when it finishes.

```yaml
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github
---

Use the Playwright tools to navigate, screenshot, and interact with pages.
```

#### Permission modes

The `permissionMode` field controls how the subagent handles permission prompts:

| Mode                | Behavior                                                                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `default`           | Standard permission checking with prompts                                                                                                   |
| `acceptEdits`       | Auto-accept file edits except in protected directories                                                                                      |
| `auto`              | Auto mode: a background classifier reviews commands and protected-directory writes |
| `dontAsk`           | Auto-deny permission prompts (explicitly allowed tools still work)                                                                          |
| `bypassPermissions` | Skip permission prompts                                                                                                                     |
| `plan`              | Plan mode (read-only exploration)                                                                                                           |

<Warning>
  Use `bypassPermissions` with caution. It skips permission prompts, allowing the subagent to execute operations without approval.
</Warning>

#### Preload skills into subagents

Use the `skills` field to inject skill content into a subagent's context at startup:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

The full content of each skill is injected into the subagent's context, not just made available for invocation. Subagents don't inherit skills from the parent conversation; you must list them explicitly.

#### Enable persistent memory

The `memory` field gives the subagent a persistent directory that survives across conversations:

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

Choose a scope based on how broadly the memory should apply:

| Scope     | Location                                      | Use when                                                                                    |
| :-------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `user`    | `~/.claude/agent-memory/<name-of-agent>/`     | the subagent should remember learnings across all projects                                  |
| `project` | `.claude/agent-memory/<name-of-agent>/`       | the subagent's knowledge is project-specific and shareable via version control              |
| `local`   | `.claude/agent-memory-local/<name-of-agent>/` | the subagent's knowledge is project-specific but should not be checked into version control |

When memory is enabled:

* The subagent's system prompt includes instructions for reading and writing to the memory directory.
* The subagent's system prompt also includes the first 200 lines or 25KB of `MEMORY.md` in the memory directory.
* Read, Write, and Edit tools are automatically enabled so the subagent can manage its memory files.

#### Conditional rules with hooks

For more dynamic control over tool usage, use `PreToolUse` hooks to validate operations before they execute:

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

#### Disable specific subagents

You can prevent Claude from using specific subagents by adding them to the `deny` array in your settings:

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

This works for both built-in and custom subagents. You can also use the `--disallowedTools` CLI flag.

### Define hooks for subagents

Subagents can define hooks that run during the subagent's lifecycle. There are two ways to configure hooks:

1. **In the subagent's frontmatter**: Define hooks that run only while that subagent is active
2. **In `settings.json`**: Define hooks that run in the main session when subagents start or stop

#### Hooks in subagent frontmatter

Define hooks directly in the subagent's markdown file. These hooks only run while that specific subagent is active.

| Event         | Matcher input | When it fires                                                       |
| :------------ | :------------ | :------------------------------------------------------------------ |
| `PreToolUse`  | Tool name     | Before the subagent uses a tool                                     |
| `PostToolUse` | Tool name     | After the subagent uses a tool                                      |
| `Stop`        | (none)        | When the subagent finishes                                          |

#### Project-level hooks for subagent events

Configure hooks in `settings.json` that respond to subagent lifecycle events:

| Event           | Matcher input   | When it fires                    |
| :-------------- | :-------------- | :------------------------------- |
| `SubagentStart` | Agent type name | When a subagent begins execution |
| `SubagentStop`  | Agent type name | When a subagent completes        |

## Work with subagents

### Understand automatic delegation

Claude automatically delegates tasks based on the task description in your request, the `description` field in subagent configurations, and current context. To encourage proactive delegation, include phrases like "use proactively" in your subagent's description field.

### Invoke subagents explicitly

When automatic delegation isn't enough, you can request a subagent yourself. Three patterns:

* **Natural language**: name the subagent in your prompt; Claude decides whether to delegate
* **@-mention**: guarantees the subagent runs for one task
* **Session-wide**: the whole session uses that subagent's system prompt via the `--agent` flag

For natural language:

```
Use the test-runner subagent to fix failing tests
Have the code-reviewer subagent look at my recent changes
```

**@-mention the subagent.** Type `@` and pick the subagent from the typeahead:

```
@"code-reviewer (agent)" look at the auth changes
```

**Run the whole session as a subagent:**

```bash
claude --agent code-reviewer
```

To make it the default for every session in a project, set `agent` in `.claude/settings.json`:

```json
{
  "agent": "code-reviewer"
}
```

### Run subagents in foreground or background

Subagents can run in the foreground (blocking) or background (concurrent):

* **Foreground subagents** block the main conversation until complete.
* **Background subagents** run concurrently while you continue working. Before launching, Claude Code prompts for any tool permissions the subagent will need.

Claude decides whether to run subagents in the foreground or background based on the task. You can also:

* Ask Claude to "run this in the background"
* Press **Ctrl+B** to background a running task

### Common patterns

#### Isolate high-volume operations

One of the most effective uses for subagents is isolating operations that produce large amounts of output. Running tests, fetching documentation, or processing log files can consume significant context. By delegating these to a subagent, the verbose output stays in the subagent's context while only the relevant summary returns to your main conversation.

```
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### Run parallel research

For independent investigations, spawn multiple subagents to work simultaneously:

```
Research the authentication, database, and API modules in parallel using separate subagents
```

Each subagent explores its area independently, then Claude synthesizes the findings. This works best when the research paths don't depend on each other.

#### Chain subagents

For multi-step workflows, ask Claude to use subagents in sequence:

```
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### Choose between subagents and main conversation

Use the **main conversation** when:

* The task needs frequent back-and-forth or iterative refinement
* Multiple phases share significant context (planning, implementation, testing)
* You're making a quick, targeted change
* Latency matters. Subagents start fresh and may need time to gather context

Use **subagents** when:

* The task produces verbose output you don't need in your main context
* You want to enforce specific tool restrictions or permissions
* The work is self-contained and can return a summary

### Manage subagent context

#### Resume subagents

Each subagent invocation creates a new instance with fresh context. To continue an existing subagent's work instead of starting over, ask Claude to resume it.

Resumed subagents retain their full conversation history, including all previous tool calls, results, and reasoning. The subagent picks up exactly where it stopped rather than starting fresh.

#### Auto-compaction

Subagents support automatic compaction using the same logic as the main conversation. By default, auto-compaction triggers at approximately 95% capacity.

## Example subagents

### Code reviewer

A read-only subagent that reviews code without modifying it:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality, security, and maintainability.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are a senior code reviewer ensuring high standards of code quality and security.

When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations addressed

Provide feedback organized by priority:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (consider improving)

Include specific examples of how to fix issues.
```

### Debugger

A subagent that can both analyze and fix issues:

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior.
tools: Read, Edit, Bash, Grep, Glob
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes
- Form and test hypotheses
- Add strategic debug logging
- Inspect variable states

For each issue, provide:
- Root cause explanation
- Evidence supporting the diagnosis
- Specific code fix
- Testing approach
- Prevention recommendations

Focus on fixing the underlying issue, not the symptoms.
```

### Data scientist

A domain-specific subagent for data analysis work:

```markdown
---
name: data-scientist
description: Data analysis expert for SQL queries, BigQuery operations, and data insights.
tools: Bash, Read, Write
model: sonnet
---

You are a data scientist specializing in SQL and BigQuery analysis.

When invoked:
1. Understand the data analysis requirement
2. Write efficient SQL queries
3. Use BigQuery command line tools (bq) when appropriate
4. Analyze and summarize results
5. Present findings clearly

Key practices:
- Write optimized SQL queries with proper filters
- Use appropriate aggregations and joins
- Include comments explaining complex logic
- Format results for readability
- Provide data-driven recommendations

For each analysis:
- Explain the query approach
- Document any assumptions
- Highlight key findings
- Suggest next steps based on data

Always ensure queries are efficient and cost-effective.
```

### Database query validator

A subagent that allows Bash access but validates commands to permit only read-only SQL queries:

```markdown
---
name: db-reader
description: Execute read-only database queries. Use when analyzing data or generating reports.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---

You are a database analyst with read-only access. Execute SELECT queries to answer questions about the data.
```

---

Source: [Claude Code Official Documentation - Subagents](https://code.claude.com/docs/en/sub-agents.md)
