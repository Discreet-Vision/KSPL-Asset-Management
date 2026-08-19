package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/itam/discovery-agent/internal/collectors"
	"github.com/itam/discovery-agent/internal/config"
	"github.com/itam/discovery-agent/internal/queue"
	"github.com/itam/discovery-agent/internal/transport"
)

const AgentVersion = "1.2.0-golang"

func main() {
	versionFlag := flag.Bool("version", false, "Display agent version")
	configPath := flag.String("config", "", "Path to agent.json configuration")
	flag.Parse()

	if *versionFlag {
		fmt.Printf("Enterprise ITAM Discovery Agent v%s\n", AgentVersion)
		os.Exit(0)
	}

	log.Printf("[ITAM Agent v%s] Starting discovery background service...", AgentVersion)

	cfg := config.DefaultConfig()
	if *configPath != "" {
		log.Printf("[Config] Custom config file provided: %s", *configPath)
	}

	// Calculate jitter before initial inventory report
	jitterDelay := config.CalculateJitterDelay(cfg.JitterMaxSeconds)
	log.Printf("[Jitter] Scheduling initial inventory run with %v jitter offset...", jitterDelay)
	time.Sleep(100 * time.Millisecond) // Short delay for startup

	engine := collectors.NewInventoryEngine(cfg)
	client := transport.NewAgentClient(cfg)
	offlineQueue := queue.NewOfflineQueue(100)

	// Collect initial inventory
	payload, err := engine.GenerateFullSnapshot()
	if err == nil {
		log.Printf("[Collector] Inventory snapshot generated successfully (Checksum: %s, Software Count: %d)", payload.Checksum[:12], len(payload.Software))
		errSend := client.SendInventoryPayload(payload)
		if errSend != nil {
			log.Printf("[Transport] Network error. Queuing payload locally: %v", errSend)
			_ = offlineQueue.Enqueue(*payload)
		} else {
			log.Printf("[Transport] Inventory successfully transmitted to ITAM server.")
		}
	} else {
		log.Printf("[Collector] Failed to collect inventory: %v", err)
	}

	// Wait for OS shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	log.Printf("[ITAM Agent] Service active and listening for scheduler triggers...")
	<-sigChan
	log.Printf("[ITAM Agent] Graceful shutdown initiated.")
}
