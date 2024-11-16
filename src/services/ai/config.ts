import { AxiosRequestConfig } from 'axios';

export const AI_API_URL = "https://47ec-34-42-208-44.ngrok-free.app/generate/";

export const axiosConfig: AxiosRequestConfig = {
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  validateStatus: (status) => {
    return status >= 200 && status < 500; // Don't reject if status is less than 500
  }
};