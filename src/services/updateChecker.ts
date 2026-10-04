export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  downloadUrl?: string;
  releaseNotes?: string;
}

export const CURRENT_APP_VERSION = 'v1.0.0';

/**
 * Checks GitHub Releases for a newer version than CURRENT_APP_VERSION.
 * Runs asynchronously and fails silently if offline or rate-limited.
 */
export async function checkForAppUpdate(): Promise<UpdateInfo> {
  try {
    const response = await fetch(
      'https://api.github.com/repos/whosumitjangra/RouteWise/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
    }

    const data = await response.json();
    const latestTag = data.tag_name;

    // Check if the latest tag is newer than current
    if (latestTag && latestTag !== CURRENT_APP_VERSION) {
      const apkAsset = data.assets?.find((a: any) => a.name.endsWith('.apk'));
      return {
        hasUpdate: true,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: latestTag,
        downloadUrl:
          apkAsset?.browser_download_url ||
          `https://github.com/whosumitjangra/RouteWise/releases/download/${latestTag}/RouteWise.apk`,
        releaseNotes: data.name || 'New transit improvements and bug fixes',
      };
    }

    return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
  } catch (err) {
    // Fails silently if offline or no network access
    return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
  }
}
