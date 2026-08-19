package macos

// LaunchdPlist returns the launchd service definition for macOS endpoints.
func LaunchdPlist() string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.itam.discoveryagent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Library/Application Support/ITAM/itam-agent</string>
        <string>-config</string>
        <string>/Library/Application Support/ITAM/agent.json</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/itam-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/itam-agent.err</string>
</dict>
</plist>
`
}
