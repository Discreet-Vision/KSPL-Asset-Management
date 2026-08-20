package collectors

import (
	"bufio"
	"os/exec"
	"runtime"
	"strings"

	"github.com/itam/discovery-agent/pkg/schema"
)

// CollectSoftware reads the local package inventory where the OS permits it.  It
// intentionally returns an empty list when no supported package source is available.
func CollectSoftware() []schema.SoftwareEntry {
	switch runtime.GOOS {
	case "linux": return linuxPackages()
	case "darwin": return linesToPackages(output("system_profiler", "SPApplicationsDataType", "-detailLevel", "mini"), "system_profiler")
	case "windows": return linesToPackages(output("powershell", "-NoProfile", "-NonInteractive", "-Command", "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object DisplayName | ForEach-Object { $_.DisplayName + '|' + $_.DisplayVersion + '|' + $_.Publisher }"), "registry")
	default: return nil
	}
}

func output(name string, args ...string) string { b, err := exec.Command(name, args...).Output(); if err != nil { return "" }; return string(b) }
func linuxPackages() []schema.SoftwareEntry { if out := output("dpkg-query", "-W", "-f=${Package}|${Version}\\n"); out != "" { return linesToPackages(out, "dpkg") }; return linesToPackages(output("rpm", "-qa", "--qf", "%{NAME}|%{VERSION}-%{RELEASE}\\n"), "rpm") }
func linesToPackages(raw, source string) []schema.SoftwareEntry { if raw == "" { return nil }; entries := []schema.SoftwareEntry{}; s := bufio.NewScanner(strings.NewReader(raw)); for s.Scan() { p := strings.Split(s.Text(), "|"); if len(p) == 0 || strings.TrimSpace(p[0]) == "" { continue }; item := schema.SoftwareEntry{Name: strings.TrimSpace(p[0]), Source: source, PackageID: strings.TrimSpace(p[0])}; if len(p) > 1 { item.Version = strings.TrimSpace(p[1]) }; if len(p) > 2 { item.Publisher = strings.TrimSpace(p[2]) }; entries = append(entries, item) }; return entries }
