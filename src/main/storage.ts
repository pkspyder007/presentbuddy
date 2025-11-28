import { app } from 'electron';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { OriginalState, AppSettings } from '../shared/types';

const userDataPath = app.getPath('userData');
const storagePath = join(userDataPath, 'storage.json');

interface StorageData {
  originalState: OriginalState;
  settings: AppSettings;
}

const defaultStorage: StorageData = {
  originalState: {},
  settings: {
    autoRestore: true,
    startMinimized: false,
  },
};

export async function loadStorage(): Promise<StorageData> {
  try {
    if (existsSync(storagePath)) {
      const data = await readFile(storagePath, 'utf-8');
      return { ...defaultStorage, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to load storage:', error);
  }
  return defaultStorage;
}

export async function saveStorage(data: Partial<StorageData>): Promise<void> {
  try {
    const current = await loadStorage();
    const updated = { ...current, ...data };
    await writeFile(storagePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save storage:', error);
  }
}

export async function getOriginalState(): Promise<OriginalState> {
  const storage = await loadStorage();
  return storage.originalState;
}

export async function saveOriginalState(state: OriginalState): Promise<void> {
  await saveStorage({ originalState: state });
}

export async function clearOriginalState(): Promise<void> {
  await saveStorage({ originalState: {} });
}

export async function getSettings(): Promise<AppSettings> {
  const storage = await loadStorage();
  return storage.settings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await saveStorage({ settings });
}

