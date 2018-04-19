/**
 * This module exposes a set of methods that interface with the server API
 */

// TODO MOVE INTO .env
// TODO CONSOLIDATE REJECTION FLOW INTO METHOD
const API_URL = 'http://localhost:3001';

/**
 * Requests to log in to the service with the given credentials
 * @param {string} username - The username to log in with
 * @param {string} password - The password to log in with
 * @returns {Promise} - Resolves to the authentication token if login is
 *  successful, rejects otherwise
 */
const login = async (username, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
  if (res.status !== 200) {
    return Promise.reject(new Error('Could not login'));
  }
  const { token } = await res.json();
  return token;
};

/**
 * Requests to register for the service with the given credentials
 * @param {string} username - The username to log in with
 * @param {string} password - The password to log in with
 * @returns {Promise} - Resolves to the authentication token if registration
 *  token is successful, rejects otherwise
 */
const register = async (username, password) => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
  if (res.status !== 200) {
    return Promise.reject(new Error('Could not register'));
  }
  const { token } = await res.json();
  return token;
};

/**
 * Downloads `key` from the server
 * @param {string} key - The key to query for
 * @returns {Promise} - Resolves to the downloaded blob
 */
const download = async (key) => {
  const token = localStorage.getItem('token');
  if (token === null) {
    console.log('No token');
    return Promise.reject(new Error('Token unavailable'));
  }
  const res = await fetch(`${API_URL}/files/${key}`, {
    method: 'GET',
    headers: new Headers({ Authorization: `Bearer ${token}` }),
  });
  if (res.status === 401) {
    console.log('Not authorized');
    return Promise.reject(new Error('Not authorized'));
  }
  if (res.status !== 200) {
    console.log(`Unknown error ${res.status}`);
    return Promise.reject(new Error('Unknown error'));
  }
  return res.blob();
};

const list = async () => {
  const token = localStorage.getItem('token');
  if (token === null) {
    console.log('No token');
    return Promise.reject(new Error('Token unavailable'));
  }
  const res = await fetch(`${API_URL}/files`, {
    method: 'GET',
    headers: new Headers({ Authorization: `Bearer ${token}` }),
  });
  if (res.status === 401) {
    console.log('Not authorized');
    return Promise.reject(new Error('Not authorized'));
  }
  if (res.status !== 200) {
    console.log(`Unknown error ${res.status}`);
    return Promise.reject(new Error('Unknown error'));
  }
  const files = await res.json();
  return files;
};

/**
 * Remove `key` from the server
 * @param {string} key
 * @param {Promise} - Resolves if deletion is successful, rejects otherwise
 */
const remove = async (key) => {
  const token = localStorage.getItem('token');
  if (token === null) {
    return Promise.reject(new Error('Token unavailable'));
  }
  const res = await fetch(`${API_URL}/files/${key}`, {
    method: 'DELETE',
    headers: new Headers({ Authorization: `Bearer ${token}` }),
  });
  if (res.status === 401) {
    return Promise.reject(new Error('Not authorized'));
  }
  if (res.status !== 204) {
    return Promise.reject(new Error('Remove failed'));
  }
  return Promise.resolve();
};

/**
 * Uploads `key` with contents `blob` to the server
 * @param {string} key
 * @param {*} blob
 * @returns {Promise} - Resolves if upload is successful, rejects otherwise
 */
const upload = async (key, blob) => {
  const token = localStorage.getItem('token');
  if (token === null) {
    return Promise.reject(new Error('Token unavailable'));
  }
  console.log(`Uploading ${blob} for ${key}`);
  const res = await fetch(`${API_URL}/files/${key}`, {
    method: 'POST',
    body: JSON.stringify({ blob }),
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
  });
  if (res.status === 401) {
    return Promise.reject(new Error('Not authorized'));
  }
  if (res.status === 204) {
    return Promise.resolve();
  }
  return Promise.reject();
};

export {
  login,
  register,
  list,
  download,
  remove,
  upload,
};
