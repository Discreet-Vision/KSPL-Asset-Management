package linux

// SystemdUnitFile returns the standard systemd service unit file for Linux installations.
func SystemdUnitFile() string {
	return `[Unit]
Description=Enterprise ITAM Discovery Agent
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/itam-agent -config /etc/itam/agent.json
Restart=on-failure
RestartSec=10s
User=root
Group=root
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
`
}
