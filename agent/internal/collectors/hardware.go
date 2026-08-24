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

// CollectHardware retrieves only values exposed by the local operating system.  A
// failed query is deliberately represented by an empty field; inventory must never
// manufacture a serial, RAM total, disk, or model.
func CollectHardware() schema.HardwareInfo {
	h := schema.HardwareInfo{CPUCores: runtime.NumCPU(), CPUArch: runtime.GOARCH}
	switch runtime.GOOS {
	case "linux":
		h.Manufacturer = readFirst("/sys/class/dmi/id/sys_vendor")
		h.Model = readFirst("/sys/class/dmi/id/product_name")
		h.SerialNumber = readFirst("/sys/class/dmi/id/product_serial")
		h.SystemUUID = readFirst("/sys/class/dmi/id/product_uuid")
		h.BIOSVersion = readFirst("/sys/class/dmi/id/bios_version")
		h.CPUModel = cpuModelFromProc()
		h.RAMTotalBytes = memoryFromProc()
		h.DiskTotalBytes = dfTotal()
	case "darwin":
		h.Model = command("sysctl", "-n", "hw.model")
		h.CPUModel = command("sysctl", "-n", "machdep.cpu.brand_string")
		h.SystemUUID = command("ioreg", "-rd1", "-c", "IOPlatformExpertDevice")
		h.RAMTotalBytes = int64From(command("sysctl", "-n", "hw.memsize"))
		h.DiskTotalBytes = dfTotal()
	case "windows":
		// CIM is available on supported Windows versions and does not expose secrets.
		h.Manufacturer = powershell("(Get-CimInstance Win32_ComputerSystem).Manufacturer")
		h.Model = powershell("(Get-CimInstance Win32_ComputerSystem).Model")
		h.SerialNumber = powershell("$bios=(Get-CimInstance Win32_BIOS).SerialNumber; $product=(Get-CimInstance Win32_ComputerSystemProduct).IdentifyingNumber; if ($bios -and $bios -notmatch '^(Default String|To Be Filled By O\\.E\\.M\\.|None|Unknown)$') { $bios } elseif ($product -and $product -notmatch '^(Default String|To Be Filled By O\\.E\\.M\\.|None|Unknown)$') { $product }")
		h.SystemUUID = powershell("(Get-CimInstance Win32_ComputerSystemProduct).UUID")
		h.BIOSVersion = powershell("(Get-CimInstance Win32_BIOS).SMBIOSBIOSVersion")
		h.CPUModel = powershell("(Get-CimInstance Win32_Processor | Select-Object -First 1).Name")
		h.RAMTotalBytes = int64From(powershell("(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"))
		h.DiskTotalBytes = int64From(powershell("(Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | Measure-Object -Property Size -Sum).Sum"))
	}
	return h
}

func readFirst(path string) string { b, err := os.ReadFile(path); if err != nil { return "" }; return strings.TrimSpace(string(b)) }
func command(name string, args ...string) string { b, err := exec.Command(name, args...).Output(); if err != nil { return "" }; return strings.TrimSpace(string(b)) }
func powershell(script string) string { return command("powershell", "-NoProfile", "-NonInteractive", "-Command", script) }
func int64From(value string) int64 { n, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64); if err != nil { return 0 }; return n }
func cpuModelFromProc() string { f, err := os.Open("/proc/cpuinfo"); if err != nil { return "" }; defer f.Close(); s := bufio.NewScanner(f); for s.Scan() { p := strings.SplitN(s.Text(), ":", 2); if len(p) == 2 && (strings.TrimSpace(p[0]) == "model name" || strings.TrimSpace(p[0]) == "Hardware") { return strings.TrimSpace(p[1]) } }; return "" }
func memoryFromProc() int64 { f, err := os.Open("/proc/meminfo"); if err != nil { return 0 }; defer f.Close(); s := bufio.NewScanner(f); for s.Scan() { p := strings.Fields(s.Text()); if len(p) >= 2 && p[0] == "MemTotal:" { kb, _ := strconv.ParseInt(p[1], 10, 64); return kb * 1024 } }; return 0 }
func dfTotal() int64 { out := command("df", "-B1", "--total"); for _, line := range strings.Split(out, "\n") { f := strings.Fields(line); if len(f) >= 2 && f[0] == "total" { return int64From(f[1]) } }; return 0 }
