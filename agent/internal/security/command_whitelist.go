package security

import (
	"errors"
	"strings"
)

var AllowedAgentCommands = map[string]bool{
	"inventory.refresh": true,
	"agent.status":      true,
	"agent.update":      true,
	"agent.logs.fetch":  true,
}

// ValidateAgentCommand ensures the agent strictly rejects unapproved remote shell or code execution requests.
func ValidateAgentCommand(commandName string) error {
	cmdClean := strings.TrimSpace(strings.ToLower(commandName))
	if !AllowedAgentCommands[cmdClean] {
		return errors.New("SECURITY VIOLATION: Unauthorized agent command rejected. General remote shell execution is strictly prohibited")
	}
	return nil
}
