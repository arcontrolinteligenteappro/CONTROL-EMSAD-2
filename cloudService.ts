
// Mock Cloud Service simulating Google Drive API interactions
// In a real production app, this would use gapi.client.drive and gapi.client.sheets

import { AppConfig, Group } from './types';

export const loginToGoogle = async (): Promise<{ email: string, token: string }> => {
  return new Promise((resolve) => {
    // Simulate OAuth popup delay
    setTimeout(() => {
      resolve({
        email: "docente.cecyten@gmail.com",
        token: "mock-oauth-token-12345"
      });
    }, 1500);
  });
};

export const syncDataToDrive = async (data: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!navigator.onLine) {
      reject("Sin conexión a Internet. Datos en cola.");
      return;
    }
    // Simulate upload delay
    setTimeout(() => {
      console.log("Data synced to Drive:", data); // Debugging
      resolve(new Date().toLocaleString());
    }, 2000);
  });
};

export const exportToGoogleSheets = async (group: Group): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate sheet creation
    setTimeout(() => {
      const sheetName = `Asistencia_${group.name}_${new Date().toISOString().split('T')[0]}`;
      console.log(`Creating Sheet: ${sheetName} for ${group.students.length} students.`);
      resolve(`https://docs.google.com/spreadsheets/d/mock-sheet-id/${sheetName}`);
    }, 1500);
  });
};

export const checkConnectivity = (): boolean => {
  return navigator.onLine;
};
