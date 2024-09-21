import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
@Injectable()
export class ApiService {
  async postApi<T>(
    apiUrl: string,
    body: T,
    headers: AxiosRequestConfig['headers'],
  ): Promise<[Error, AxiosResponse]> {
    try {
      const response: AxiosResponse<T> = await axios.post(apiUrl, body, {
        headers,
      });
      console.log(response.data);
      return [null, response.data as any];
    } catch (error) {
      return [error, null];
    }
  }

  async getApi<T>(
    apiUrl?: string,
    headers?: AxiosRequestConfig['headers'],
    params?: Object,
  ): Promise<[Error, T]> {
    console.log(apiUrl, 'apiUrl');
    console.log(headers), console.log(params);
    try {
      const response: AxiosResponse<T> = await axios.get(apiUrl, {
        params,
      });
      console.log(response);
      return [null, response.data];
    } catch (error) {
      console.log(error.message);
      return [error, null];
    }
  }

  async getApiFn<T>(
    apiUrl?: string,
    headers?: AxiosRequestConfig['headers'],
    responseType?: AxiosRequestConfig['responseType'],
  ): Promise<[Error, T]> {
    try {
      const response: AxiosResponse<T> = await axios.get(apiUrl, {
        headers,
        responseType,
      });
      return [null, response.data];
    } catch (error) {
      console.log(error);
      return [error, null];
    }
  }

  async updateApi<T>(
    apiUrl: string,
    body: T,
    headers: AxiosRequestConfig['headers'],
  ): Promise<[Error, T]> {
    try {
      const response: AxiosResponse<T> = await axios.patch(apiUrl, body, {
        headers,
      });
      return [null, response as T];
    } catch (error) {
      return [error, null];
    }
  }

  async deleteApi<T>(
    apiUrl: string,
    headers: AxiosRequestConfig['headers'],
  ): Promise<[Error, T]> {
    try {
      const response: AxiosResponse<T> = await axios.delete(apiUrl, {
        headers,
      });
      return [null, response as T];
    } catch (error) {
      return [error, null];
    }
  }
}
