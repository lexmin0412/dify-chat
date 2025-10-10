/**
 * 运行时配置工具
 * 优先使用 /config.js 端点的配置，回退到构建时配置
 */

interface AppConfig {
  PUBLIC_DEBUG_MODE?: string;
  PUBLIC_APP_API_BASE?: string;
  PUBLIC_DIFY_PROXY_API_BASE?: string;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}

/**
 * 获取 API 基础路径
 */
export function getApiBase(): string {
  // 优先使用运行时配置
  if (typeof window !== 'undefined' && window.APP_CONFIG?.PUBLIC_APP_API_BASE) {
    return window.APP_CONFIG.PUBLIC_APP_API_BASE;
  }
  // 回退到构建时配置
  return process.env.PUBLIC_APP_API_BASE || 'http://localhost:5300/api/client';
}

/**
 * 获取 Dify 代理 API 基础路径
 */
export function getDifyProxyApiBase(): string {
  // 优先使用运行时配置
  if (typeof window !== 'undefined' && window.APP_CONFIG?.PUBLIC_DIFY_PROXY_API_BASE) {
    return window.APP_CONFIG.PUBLIC_DIFY_PROXY_API_BASE;
  }
  // 回退到构建时配置
  return process.env.PUBLIC_DIFY_PROXY_API_BASE || 'http://localhost:5300/api/client/dify';
}

/**
 * 获取调试模式
 */
export function getDebugMode(): boolean {
  // 优先使用运行时配置
  if (typeof window !== 'undefined' && window.APP_CONFIG?.PUBLIC_DEBUG_MODE) {
    return window.APP_CONFIG.PUBLIC_DEBUG_MODE === 'true';
  }
  // 回退到构建时配置
  return process.env.PUBLIC_DEBUG_MODE === 'true';
}