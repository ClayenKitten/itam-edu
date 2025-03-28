PROMPT_COMMAND='PS1_CMD1=$(git branch --show-current 2>/dev/null)'; PS1='\[\e[32;1m\]\u@${PS1_CMD1}\[\e[0m\]:\[\e[34;1m\]\w\[\e[0m\]\$ '

alias ls='ls --color=auto'
alias ll='ls -la'

source /etc/bash/bash_completion.sh
