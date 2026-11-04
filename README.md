# JIRAI

An application for inspecting the state of your Jira project with AI.

*This application uses LLM agents to grade your Jira project. Output may not always be factual or consistent.*

## Installation

### Windows

1. Right click on your desktop, and click: *Open in Terminal*

2. Send the command: *git clone https://github.com/Mi1-programming/Jirai.git*

3. If you are running Podman, then send the command: *podman compose build && podman compose up -d*
For Docker: *docker compose build && docker compose up -d*
If you are having problems, then try running *docker compose build* first and then *docker compose up -d* if the first one works

4. Open the URL *localhost:8080* in your browser

## Connecting Jira & AI

### Jira

1. Input the username. It's usually the email you are logged in with.

2. Input the project URL. It's usually the base domain you are connected to when you are in your organization's page. For example: *https://comapnyname.atlassian.net/*.

3. Input the project name. It tells the AI what project you want to inspect. Please note, that the name of the project and this are different.
This property can be found at the end of your URL when you are inside the core of your project. For example *https://username.atlassian.net/jira/core/projects/HERE* <---

4. Input the API key. You can get one from [here](https://id.atlassian.com/manage-profile/security/api-tokens).

### AI

1. Input the host. An example for OpenRouter could be: *https://openrouter.ai/api/v1*.
If you are running locally, then one for Ollama would be *http://YOUR_IP:11434/v1/*

2. Input the model you want to use. This could be any model you have access to, or that you can run on your own if you are hosting it yourself.

3. Input the API key. If you are using OpenRouter, then you can get one from [here](https://openrouter.ai/workspaces/default/keys).
For Ollama you can likely leave it empty unless your setup explicitly requires one.
