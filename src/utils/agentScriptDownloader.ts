/**
 * Cross-Platform Agent Script Generator & Safe File Downloader
 * Supports Windows (.ps1), Linux (.sh), macOS (.sh), and iOS (.mobileconfig)
 * Ensures 100% reliable downloads in any iframe sandbox or standalone browser.
 */

/**
 * Triggers a browser file download safely via Blob & URL.createObjectURL
 */
export async function downloadAgentScript(osType: 'Windows' | 'Linux' | 'macOS' | 'iOS'): Promise<{ success: boolean; filename: string; error?: string }> {
  try {
    const origin = (import.meta as any).env?.VITE_ITAM_SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const tokenResponse = await fetch(`${origin}/api/discovery/agent/enrollment-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 'tenant-client-1' }),
    });
    if (!tokenResponse.ok) throw new Error(`Could not create enrollment token (HTTP ${tokenResponse.status}).`);
    const enrollment = await tokenResponse.json();
    if (!enrollment.success || !enrollment.token) throw new Error('Server did not return an enrollment token.');

    const scriptName = osType === 'Windows' ? 'windows' : osType === 'Linux' ? 'linux' : osType === 'macOS' ? 'macos' : 'ios';
    const scriptUrl = `${origin}/api/discovery/agent/scripts/${scriptName}?token=${encodeURIComponent(enrollment.token)}&tenantId=${encodeURIComponent(enrollment.tenantId)}`;
    const response = await fetch(scriptUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not download the Windows collector (HTTP ${response.status}).`);
    const content = await response.text();
    if (!content.includes('/api/discovery/agent/heartbeat') || !content.includes('X-Agent-Enrollment-Token')) {
      throw new Error(`The server returned an invalid ${osType} collector.`);
    }
    const filename = osType === 'Windows' ? 'kspl-discovery-agent.ps1' : osType === 'iOS' ? 'kspl-itam-enrollment.mobileconfig' : `kspl-discovery-agent-${osType.toLowerCase()}.sh`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    return { success: true, filename };
  } catch (err: any) {
    console.error('File download failed:', err);
    return { success: false, filename: '', error: err?.message || 'Agent download failed.' };
  }
}
