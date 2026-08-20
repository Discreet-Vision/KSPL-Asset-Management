package collectors

import (
	"bufio"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"

	"github.com/itam/discovery-agent/pkg/schema"
)

// CollectOS retrieves operating system platform details for Windows, Linux, and macOS.
func CollectOS() schema.OSInfo {
	info := schema.OSInfo{Architecture: runtime.GOARCH}
	switch runtime.GOOS {
	case "windows":
		info.Name = "Windows"; info.Version = ps("(Get-CimInstance Win32_OperatingSystem).Caption"); info.BuildNumber = ps("(Get-CimInstance Win32_OperatingSystem).BuildNumber"); info.KernelVer = ps("[System.Environment]::OSVersion.Version.ToString()"); info.Architecture = ps("(Get-CimInstance Win32_OperatingSystem).OSArchitecture"); info.UptimeSec = uptimeFromWindows()
	case "darwin":
		info.Name = "macOS"; info.Version = cmd("sw_vers", "-productVersion"); info.BuildNumber = cmd("sw_vers", "-buildVersion"); info.KernelVer = cmd("uname", "-r"); info.UptimeSec = uptimeFromProc()
	default:
		info.Name = "Linux"; info.Version, info.Edition = linuxRelease(); info.KernelVer = cmd("uname", "-r"); info.UptimeSec = uptimeFromProc()
	}
	return info
}

func cmd(name string, args ...string) string { b, err := exec.Command(name, args...).Output(); if err != nil { return "" }; return strings.TrimSpace(string(b)) }
func ps(script string) string { return cmd("powershell", "-NoProfile", "-NonInteractive", "-Command", script) }
func linuxRelease() (string, string) { f, err := os.Open("/etc/os-release"); if err != nil { return "", "" }; defer f.Close(); var name, version string; s := bufio.NewScanner(f); for s.Scan() { p := strings.SplitN(s.Text(), "=", 2); if len(p) != 2 { continue }; v := strings.Trim(p[1], "\""); if p[0] == "NAME" { name = v }; if p[0] == "VERSION_ID" { version = v } }; return strings.TrimSpace(name + " " + version), name }
func uptimeFromProc() int64 { b, err := os.ReadFile("/proc/uptime"); if err != nil { return 0 }; f := strings.Fields(string(b)); if len(f) == 0 { return 0 }; v, _ := strconv.ParseFloat(f[0], 64); return int64(v) }
func uptimeFromWindows() int64 { return int64FromPs(ps("[math]::Floor((Get-CimInstance Win32_OperatingSystem).LastBootUpTime | ForEach-Object { (Get-Date) - $_ }).TotalSeconds")) }
func int64FromPs(value string) int64 { n, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64); if err != nil { return 0 }; return n }
