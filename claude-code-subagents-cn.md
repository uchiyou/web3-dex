# 创建自定义 subagents

> 在 Claude Code 中创建和使用专门的 AI subagents，用于特定任务的工作流和改进的上下文管理。

Subagents 是处理特定类型任务的专门 AI 助手。每个 subagent 在自己的 context window 中运行，具有自定义系统提示、特定的工具访问权限和独立的权限。当 Claude 遇到与 subagent 描述相匹配的任务时，它会委托给该 subagent，该 subagent 独立工作并返回结果。

> **注意:** 如果您需要多个代理并行工作并相互通信，请参阅 agent teams。Subagents 在单个会话中工作；agent teams 跨多个会话进行协调。

Subagents 帮助您：

* **保留上下文**，通过将探索和实现保持在主对话之外
* **强制执行约束**，通过限制 subagent 可以使用的工具
* **跨项目重用配置**，使用用户级 subagents
* **专门化行为**，为特定领域使用专注的系统提示
* **控制成本**，通过将任务路由到更快、更便宜的模型（如 Haiku）

Claude 使用每个 subagent 的描述来决定何时委托任务。创建 subagent 时，请编写清晰的描述，以便 Claude 知道何时使用它。

Claude Code 包括几个内置 subagents，如 **Explore**、**Plan** 和 **general-purpose**。您也可以创建自定义 subagents 来处理特定任务。

## 内置 subagents

Claude Code 包括内置 subagents，Claude 在适当时自动使用。每个都继承父对话的权限，并有额外的工具限制。

### Explore

一个快速的、只读的代理，针对搜索和分析代码库进行了优化。

* **Model**: Haiku（快速、低延迟）
* **Tools**: 只读工具（拒绝访问 Write 和 Edit 工具）
* **Purpose**: 文件发现、代码搜索、代码库探索

当 Claude 需要搜索或理解代码库而不进行更改时，它会委托给 Explore。这样可以将探索结果保持在主对话上下文之外。

调用 Explore 时，Claude 指定一个彻底程度级别：**quick** 用于有针对性的查找，**medium** 用于平衡的探索，或 **very thorough** 用于全面分析。

### Plan

一个研究代理，在 plan mode 期间使用，以在呈现计划之前收集上下文。

* **Model**: 从主对话继承
* **Tools**: 只读工具（拒绝访问 Write 和 Edit 工具）
* **Purpose**: 用于规划的代码库研究

当您处于 plan mode 并且 Claude 需要理解您的代码库时，它会将研究委托给 Plan subagent。这可以防止无限嵌套（subagents 无法生成其他 subagents），同时仍然收集必要的上下文。

### General-purpose

一个能够处理复杂、多步骤任务的代理，需要探索和操作。

* **Model**: 从主对话继承
* **Tools**: 所有工具
* **Purpose**: 复杂研究、多步骤操作、代码修改

当任务需要探索和修改、复杂推理来解释结果或多个依赖步骤时，Claude 会委托给 general-purpose。

### Other

Claude Code 包括用于特定任务的其他辅助代理。这些通常会自动调用，因此您不需要直接使用它们。

| Agent             | Model  | Claude 何时使用它                 |
| :---------------- | :----- | :--------------------------- |
| statusline-setup  | Sonnet | 当您运行 `/statusline` 来配置您的状态行时 |
| Claude Code Guide | Haiku  | 当您提出关于 Claude Code 功能的问题时    |

## 快速入门：创建您的第一个 subagent

Subagents 在带有 YAML frontmatter 的 Markdown 文件中定义。您可以手动创建它们或使用 `/agents` 命令。

本演练指导您使用 `/agents` 命令创建用户级 subagent。该 subagent 审查代码并为代码库建议改进。

**步骤 1: 打开 subagents 界面**

在 Claude Code 中，运行：`/agents`

**步骤 2: 选择一个位置**

选择 **Create new agent**，然后选择 **Personal**。这会将 subagent 保存到 `~/.claude/agents/`，以便在所有项目中可用。

**步骤 3: 使用 Claude 生成**

选择 **Generate with Claude**。出现提示时，描述 subagent。

**步骤 4: 选择工具**

对于只读审查者，取消选择除 **Read-only tools** 之外的所有内容。如果您保持所有工具被选中，subagent 会继承主对话可用的所有工具。

**步骤 5: 选择模型**

选择 subagent 使用的模型。对于此示例代理，选择 **Sonnet**，它在分析代码模式的能力和速度之间取得平衡。

**步骤 6: 选择颜色**

为 subagent 选择背景颜色。这有助于您在 UI 中识别哪个 subagent 正在运行。

**步骤 7: 配置内存**

选择 **User scope** 为 subagent 提供一个 persistent memory directory，位于 `~/.claude/agent-memory/`。Subagent 使用这个来在对话中积累见解，例如代码库模式和重复出现的问题。

**步骤 8: 保存并尝试**

查看配置摘要。按 `s` 或 `Enter` 保存，或按 `e` 在编辑器中保存并编辑文件。Subagent 立即可用。尝试它：

```
Use the code-improver agent to suggest improvements in this project
```

Claude 委托给您的新 subagent，它扫描代码库并返回改进建议。

## 配置 subagents

### 使用 /agents 命令

`/agents` 命令提供了一个交互式界面来管理 subagents。运行 `/agents` 来：

* 查看所有可用的 subagents（内置、用户、项目和 plugin）
* 使用引导式设置或 Claude 生成创建新的 subagents
* 编辑现有 subagent 配置和工具访问
* 删除自定义 subagents
* 查看当存在重复时哪些 subagents 是活跃的

这是创建和管理 subagents 的推荐方式。对于手动创建或自动化，您也可以直接添加 subagent 文件。

要从命令行列出所有配置的 subagents 而不启动交互式会话，请运行 `claude agents`。

### 选择 subagent 范围

Subagents 是带有 YAML frontmatter 的 Markdown 文件。根据范围将它们存储在不同的位置。当多个 subagents 共享相同的名称时，更高优先级的位置获胜。

| Location              | Scope         | Priority | 如何创建                                      |
| :-------------------- | :------------ | :------- | :---------------------------------------- |
| 托管设置                  | 组织范围          | 1（最高）    | 通过托管设置部署 |
| `--agents` CLI 标志     | 当前会话          | 2        | 启动 Claude Code 时传递 JSON                   |
| `.claude/agents/`     | 当前项目          | 3        | 交互式或手动                                    |
| `~/.claude/agents/`   | 所有您的项目        | 4        | 交互式或手动                                    |
| Plugin 的 `agents/` 目录 | 启用 plugin 的位置 | 5（最低）    | 与 plugins 一起安装          |

**项目 subagents**（`.claude/agents/`）非常适合特定于代码库的 subagents。将它们检入版本控制，以便您的团队可以协作使用和改进它们。

**用户 subagents**（`~/.claude/agents/`）是在所有项目中可用的个人 subagents。

**CLI 定义的 subagents** 在启动 Claude Code 时作为 JSON 传递。它们仅存在于该会话中，不会保存到磁盘，使其对快速测试或自动化脚本很有用。您可以在单个 `--agents` 调用中定义多个 subagents：

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer.",
    "prompt": "You are a senior code reviewer.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

### 编写 subagent 文件

Subagent 文件使用 YAML frontmatter 进行配置，然后是 Markdown 中的系统提示：

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

Frontmatter 定义了 subagent 的元数据和配置。正文成为指导 subagent 行为的系统提示。

#### 支持的 frontmatter 字段

以下字段可以在 YAML frontmatter 中使用。只有 `name` 和 `description` 是必需的。

| Field             | Required | Description                                                                                                                                                                   |
| :---------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Yes      | 使用小写字母和连字符的唯一标识符                                                                                                                                                              |
| `description`     | Yes      | Claude 何时应该委托给此 subagent                                                                                                                                                      |
| `tools`           | No       | subagent 可以使用。如果省略，继承所有工具                                                                                                                           |
| `disallowedTools` | No       | 要拒绝的工具，从继承或指定的列表中删除                                                                                                                                                           |
| `model`           | No       | 使用：`sonnet`、`opus`、`haiku`、完整模型 ID（例如，`claude-opus-4-6`）或 `inherit`。默认为 `inherit`                                                                    |
| `permissionMode`  | No       | 权限模式：`default`、`acceptEdits`、`auto`、`dontAsk`、`bypassPermissions` 或 `plan`                                                                    |
| `maxTurns`        | No       | subagent 停止前的最大代理轮数                                                                                                                                                           |
| `skills`          | No       | 在启动时加载到 subagent 的上下文中的 Skills                                                                                     |
| `mcpServers`      | No       | 对此 subagent 可用的 MCP 服务器                                                                                 |
| `hooks`           | No       | 生命周期 hooks 限定于此 subagent                                                                                                                  |
| `memory`          | No       | 持久内存范围：`user`、`project` 或 `local`。启用跨会话学习                                                                                       |
| `background`      | No       | 设置为 `true` 以始终将此 subagent 作为后台任务运行。默认：`false`                                                                      |
| `effort`          | No       | 此 subagent 活跃时的努力级别。覆盖会话努力级别。默认：从会话继承                                                                                              |
| `isolation`       | No       | 设置为 `worktree` 以在临时 git worktree 中运行 subagent                                                                 |
| `color`           | No       | Subagent 在任务列表和转录中的显示颜色                                                                                    |
| `initialPrompt`   | No       | 当此代理作为主会话代理运行时，自动提交为第一个用户轮次                                                                                                                 |

### 选择模型

`model` 字段控制 subagent 使用的 AI 模型：

* **Model alias**: 使用可用的别名之一：`sonnet`、`opus` 或 `haiku`
* **Full model ID**: 使用完整的模型 ID，如 `claude-opus-4-6` 或 `claude-sonnet-4-6`
* **inherit**: 使用与主对话相同的模型
* **Omitted**: 如果未指定，默认为 `inherit`

当 Claude 调用 subagent 时，它也可以为该特定调用传递 `model` 参数。Claude Code 按以下顺序解析 subagent 的模型：

1. `CLAUDE_CODE_SUBAGENT_MODEL` 环境变量，如果设置
2. 每次调用的 `model` 参数
3. Subagent 定义的 `model` frontmatter
4. 主对话的模型

### 控制 subagent 能力

您可以通过工具访问、权限模式和条件规则来控制 subagents 可以做什么。

#### 可用工具

Subagents 可以使用 Claude Code 的任何内部工具。默认情况下，subagents 继承主对话的所有工具，包括 MCP 工具。

要限制工具，使用 `tools` 字段（允许列表）或 `disallowedTools` 字段（拒绝列表）。

此示例使用 `tools` 来专门允许 Read、Grep、Glob 和 Bash：

```yaml
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
---
```

此示例使用 `disallowedTools` 来继承主对话的每个工具，除了 Write 和 Edit：

```yaml
---
name: no-writes
description: Inherits every tool except file writes
disallowedTools: Write, Edit
---
```

#### 限制可以生成哪些 subagents

当代理作为主线程运行时，使用 `claude --agent`，它可以使用 Agent 工具生成 subagents。要限制它可以生成的 subagent 类型，在 `tools` 字段中使用 `Agent(agent_type)` 语法。

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

这是一个允许列表：只有 `worker` 和 `researcher` subagents 可以被生成。

要允许生成任何 subagent 而不受限制，使用不带括号的 `Agent`：

```yaml
tools: Agent, Read, Bash
```

#### 将 MCP 服务器限定于 subagent

使用 `mcpServers` 字段为 subagent 提供对主对话中不可用的 MCP 服务器的访问：

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

#### 权限模式

`permissionMode` 字段控制 subagent 如何处理权限提示：

| Mode                | Behavior                                                                                 |
| :------------------ | :--------------------------------------------------------------------------------------- |
| `default`           | 标准权限检查，带有提示                                                                              |
| `acceptEdits`       | 自动接受文件编辑，除了受保护的目录                                                                        |
| `auto`              | Auto mode：后台分类器审查命令和受保护目录的写入 |
| `dontAsk`           | 自动拒绝权限提示（显式允许的工具仍然工作）                                                                    |
| `bypassPermissions` | 跳过权限提示                                                                                   |
| `plan`              | Plan mode（只读探索）                                                                          |

> **警告:** 谨慎使用 `bypassPermissions`。它跳过权限提示，允许 subagent 在没有批准的情况下执行操作。

#### 将技能预加载到 subagents

使用 `skills` 字段在启动时将技能内容注入到 subagent 的上下文中：

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

#### 启用持久内存

`memory` 字段为 subagent 提供一个在对话中幸存的持久目录：

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---

You are a code reviewer. As you review code, update your agent memory with
patterns, conventions, and recurring issues you discover.
```

根据内存应该应用的广泛程度选择范围：

| Scope     | Location                                      | 使用时机                          |
| :-------- | :-------------------------------------------- | :---------------------------- |
| `user`    | `~/.claude/agent-memory/<name-of-agent>/`     | subagent 应该在所有项目中记住学习         |
| `project` | `.claude/agent-memory/<name-of-agent>/`       | subagent 的知识是特定于项目的并可通过版本控制共享 |
| `local`   | `.claude/agent-memory-local/<name-of-agent>/` | subagent 的知识是特定于项目的但不应检入版本控制  |

启用内存时：

* Subagent 的系统提示包括读取和写入内存目录的说明
* Read、Write 和 Edit 工具会自动启用

#### 使用 hooks 的条件规则

为了更动态地控制工具使用，使用 `PreToolUse` hooks 在执行前验证操作：

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

#### 禁用特定 subagents

您可以通过将 subagents 添加到您的设置中的 `deny` 数组来防止 Claude 使用特定 subagents：

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

### 为 subagents 定义 hooks

Subagents 可以定义在 subagent 的生命周期中运行的 hooks。有两种方式来配置 hooks：

1. **在 subagent 的 frontmatter 中**：定义仅在该 subagent 活跃时运行的 hooks
2. **在 `settings.json` 中**：定义在 subagents 启动或停止时在主会话中运行的 hooks

#### Subagent frontmatter 中的 Hooks

| Event         | Matcher input | 何时触发                                   |
| :------------ | :------------ | :------------------------------------- |
| `PreToolUse`  | Tool name     | 在 subagent 使用工具之前                      |
| `PostToolUse` | Tool name     | 在 subagent 使用工具之后                      |
| `Stop`        | (none)        | 当 subagent 完成时                          |

#### 用于 subagent 事件的项目级 hooks

| Event           | Matcher input   | 何时触发             |
| :-------------- | :-------------- | :--------------- |
| `SubagentStart` | Agent type name | 当 subagent 开始执行时 |
| `SubagentStop`  | Agent type name | 当 subagent 完成时   |

## 使用 subagents

### 理解自动委托

Claude 根据您请求中的任务描述、subagent 配置中的 `description` 字段和当前上下文自动委托任务。

### 显式调用 subagents

当自动委托不够时，您可以自己请求 subagent。三种模式：

* **自然语言**：在提示中命名 subagent；Claude 决定是否委托
* **@-mention**：保证 subagent 为一个任务运行
* **会话范围**：整个会话使用该 subagent 的系统提示、工具限制和模型，通过 `--agent` 标志

对于自然语言：

```
Use the test-runner subagent to fix failing tests
```

**@-mention subagent。** 输入 `@` 并从类型提前中选择 subagent：

```
@"code-reviewer (agent)" look at the auth changes
```

**将整个会话作为 subagent 运行：**

```bash
claude --agent code-reviewer
```

要使其成为项目中每个会话的默认值，在 `.claude/settings.json` 中设置 `agent`：

```json
{
  "agent": "code-reviewer"
}
```

### 在前台或后台运行 subagents

Subagents 可以在前台（阻塞）或后台（并发）运行：

* **前台 subagents** 阻塞主对话直到完成
* **后台 subagents** 在您继续工作时并发运行

Claude 根据任务决定是否在前台或后台运行 subagents。您也可以：

* 要求 Claude "run this in the background"
* 按 **Ctrl+B** 将运行中的任务放在后台

### 常见模式

#### 隔离高容量操作

subagents 最有效的用途之一是隔离产生大量输出的操作。运行测试、获取文档或处理日志文件可能会消耗大量上下文。通过将这些委托给 subagent，详细输出保留在 subagent 的上下文中，而只有相关摘要返回到您的主对话。

```
Use a subagent to run the test suite and report only the failing tests with their error messages
```

#### 运行并行研究

对于独立的调查，生成多个 subagents 以同时工作：

```
Research the authentication, database, and API modules in parallel using separate subagents
```

#### 链接 subagents

对于多步骤工作流，要求 Claude 按顺序使用 subagents：

```
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

### 在 subagents 和主对话之间选择

在以下情况下使用 **主对话**：

* 任务需要频繁的来回或迭代细化
* 多个阶段共享重要上下文（规划 → 实现 → 测试）
* 您正在进行快速、有针对性的更改
* 延迟很重要

在以下情况下使用 **subagents**：

* 任务产生您不需要在主上下文中的详细输出
* 您想强制执行特定的工具限制或权限
* 工作是自包含的，可以返回摘要

### 管理 subagent 上下文

#### 恢复 subagents

每个 subagent 调用都会创建一个具有新鲜上下文的新实例。要继续现有 subagent 的工作而不是重新开始，要求 Claude 恢复它。

恢复的 subagents 保留其完整的对话历史。Subagent 从它停止的地方继续，而不是从头开始。

#### 自动压缩

Subagents 支持使用与主对话相同的逻辑进行自动压缩。默认情况下，自动压缩在大约 95% 容量时触发。

## 示例 subagents

### 代码审查者

一个只读 subagent，审查代码而不修改它：

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

### 调试器

一个可以分析和修复问题的 subagent：

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

### 数据科学家

一个用于数据分析工作的特定领域 subagent：

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
- Format results for readability
- Provide data-driven recommendations
```

### 数据库查询验证器

一个允许 Bash 访问但验证命令以仅允许只读 SQL 查询的 subagent：

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

来源: [Claude Code 官方文档 - Subagents](https://code.claude.com/docs/zh-CN/sub-agents)
