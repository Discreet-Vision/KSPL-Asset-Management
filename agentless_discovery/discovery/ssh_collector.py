from typing import Dict, Any
import re

try:
    import paramiko
except ImportError:  # The scanner reports a truthful configuration error.
    paramiko = None

class SSHCollector:
    def __init__(self, username: str, key_or_password: str, port: int = 22):
        self.username = username
        self.key_or_password = key_or_password
        self.port = port

    def collect(self, ip_address: str) -> Dict[str, Any]:
        if paramiko is None:
            return {"protocol": "SSH", "ip_address": ip_address, "error": "SSH_WORKER_NOT_CONFIGURED"}
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.RejectPolicy())
        try:
            connect = {"hostname": ip_address, "port": self.port, "username": self.username, "timeout": 15, "banner_timeout": 15, "auth_timeout": 15, "look_for_keys": False, "allow_agent": False}
            if self.key_or_password.startswith("-----BEGIN"):
                from io import StringIO
                connect["pkey"] = paramiko.RSAKey.from_private_key(StringIO(self.key_or_password))
            else:
                connect["password"] = self.key_or_password
            client.connect(**connect)
            def query(command: str) -> str:
                _, stdout, _ = client.exec_command(command, timeout=15)
                return stdout.read().decode("utf-8", "replace").strip()
            hostname = query("hostname")
            release = query(". /etc/os-release 2>/dev/null; printf '%s %s' \"$NAME\" \"$VERSION_ID\"; uname -s")
            cpu = query("lscpu 2>/dev/null | awk -F: '/Model name|Hardware/{gsub(/^ +/,\"\",$2); print $2; exit}'")
            cores = query("getconf _NPROCESSORS_ONLN")
            memory = query("awk '/MemTotal/{print $2*1024}' /proc/meminfo")
            disk = query("df -B1 --total 2>/dev/null | awk '$1==\"total\"{print $2}'")
            interfaces = []
            for line in query("ip -o link 2>/dev/null").splitlines():
                match = re.search(r"^\\d+: ([^:]+):.*link/\\S+ ([0-9a-f:]{17})", line, re.I)
                if match:
                    interfaces.append({"name": match.group(1), "mac": match.group(2), "status": "UP" if "UP" in line else "DOWN"})
            hardware = {"manufacturer": query("cat /sys/class/dmi/id/sys_vendor 2>/dev/null"), "model": query("cat /sys/class/dmi/id/product_name 2>/dev/null"), "serial_number": query("cat /sys/class/dmi/id/product_serial 2>/dev/null"), "system_uuid": query("cat /sys/class/dmi/id/product_uuid 2>/dev/null"), "cpu_model": cpu, "cpu_cores": int(cores) if cores.isdigit() else None, "ram_total_bytes": int(memory) if memory.isdigit() else None, "disk_total_bytes": int(disk) if disk.isdigit() else None}
            return {"protocol": "SSH", "ip_address": ip_address, "hostname": hostname, "hardware": {k: v for k, v in hardware.items() if v not in (None, "")}, "operating_system": {"name": release, "kernel_version": query("uname -r"), "architecture": query("uname -m")}, "network_interfaces": interfaces}
        except paramiko.AuthenticationException:
            return {"protocol": "SSH", "ip_address": ip_address, "error": "SSH_AUTH_FAILED"}
        except Exception as exc:
            return {"protocol": "SSH", "ip_address": ip_address, "error": "SSH_CONNECTION_FAILED", "error_detail": str(exc)}
        finally:
            client.close()
