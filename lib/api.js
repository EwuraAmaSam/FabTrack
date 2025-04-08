"use client"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL_API;

// Enhanced response handler with timeout
const handleResponse = async (response, timeout = 5000) => {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );

  try {
    const text = await Promise.race([response.text(), timeoutPromise]);
    
    if (!text) return null;
    
    const data = JSON.parse(text);
    
    // Add response validation
    if (response.status >= 400) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Response handling error:', {
      error,
      status: response.status,
      url: response.url
    });
    throw error;
  }
};

export const authFetch = async (url, options = {}) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login?expired=true';
      return null;
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout:', url);
      throw new Error('Request timed out');
    }
    console.error('API request error:', error);
    throw error;
  }
};

// Simplified request functions using authFetch
export const getAllRequests = async () => {
  try {
    const data = await authFetch('/api/requests');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch requests:', error);
    return [];
  }
};

export const getPendingRequests = async () => {
  try {
    const data = await authFetch('/api/requests?status=pending');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch pending requests:', error);
    return [];
  }
};