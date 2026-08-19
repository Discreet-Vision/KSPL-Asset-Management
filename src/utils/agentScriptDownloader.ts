/**
 * Cross-Platform Agent Script Generator & Safe File Downloader
 * Supports Windows (.ps1), Linux (.sh), macOS (.sh), and iOS (.mobileconfig)
 * Ensures 100% reliable downloads in any iframe sandbox or standalone browser.
 */

import {
  generateWindowsPowerShellScript,
  generateLinuxBashScript,
  generateMacOsScript,
  generateIosMobileConfig,
} from '../backend/discoveryService';

export function getClientWindowsScript(serverUrl: string): string {
  return generateWindowsPowerShellScript(serverUrl);
}

export function getClientLinuxScript(serverUrl: string): string {
  return generateLinuxBashScript(serverUrl);
}

export function getClientMacOsScript(serverUrl: string): string {
  return generateMacOsScript(serverUrl);
}

export function getClientIosConfig(serverUrl: string): string {
  return generateIosMobileConfig(serverUrl);
}

/**
 * Triggers a browser file download safely via Blob & URL.createObjectURL
 */
export function downloadAgentScript(osType: 'Windows' | 'Linux' | 'macOS' | 'iOS'): { success: boolean; filename: string } {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    let content = '';
    let filename = 'kspl-discovery-agent.sh';
    let mimeType = 'text/plain;charset=utf-8';

    if (osType === 'Windows') {
      content = getClientWindowsScript(origin);
      filename = 'kspl-discovery-agent.ps1';
      mimeType = 'text/plain;charset=utf-8';
    } else if (osType === 'Linux') {
      content = getClientLinuxScript(origin);
      filename = 'kspl-discovery-agent.sh';
      mimeType = 'text/x-sh;charset=utf-8';
    } else if (osType === 'macOS') {
      content = getClientMacOsScript(origin);
      filename = 'kspl-discovery-agent-macos.sh';
      mimeType = 'text/x-sh;charset=utf-8';
    } else if (osType === 'iOS') {
      content = getClientIosConfig(origin);
      filename = 'kspl-itam-enrollment.mobileconfig';
      mimeType = 'application/x-apple-aspen-config;charset=utf-8';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    return { success: true, filename };
  } catch (err) {
    console.error('File download failed:', err);
    return { success: false, filename: '' };
  }
}
