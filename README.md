# Council_XL
Ai council templating engine

A Python web API that routes an idea through a council of specialized AI agents, each powered by 0G Private Computer's OpenAI-compatible inference API (models like DeepSeek, Qwen, GLM). The council brutally stress-tests the idea, then synthesizes a structured implementation plan.



```
Council_XL/
├── app/
│   ├── main.py              # FastAPI entrypoint
│   ├── db.py 
│   ├── council/
│   │   ├── agents.py        # Agent definitions (system prompts + model assignments)
│   │   ├── runner.py        # Parallel execution + synthesis logic
│   │   └── templates.py     # Output schema / report templates
│   ├── api/
│   │   └── routes.py        # POST /evaluate endpoint
│   └── config.py            # 0G endpoint, API keys, model assignments
├── tests/
├── .env
├── requirements.txt
└── README.md
```
