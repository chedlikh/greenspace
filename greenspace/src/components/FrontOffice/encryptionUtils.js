const generateKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

const exportKey = async (key) => {
  const exported = await crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(exported);
};

const importKey = async (jwk) => {
  return await crypto.subtle.importKey(
    'jwk',
    JSON.parse(jwk),
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
};

const storeKey = (conversationId, keyJwk) => {
  localStorage.setItem(`encryptionKey_${conversationId}`, keyJwk);
};

const getKey = (conversationId) => {
  return localStorage.getItem(`encryptionKey_${conversationId}`);
};

const encryptText = async (text, key) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return { iv: Array.from(iv), encrypted: Array.from(new Uint8Array(encrypted)) };
};

const decryptText = async ({ iv, encrypted }, key) => {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(encrypted)
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

const encryptFile = async (file, key) => {
  const buffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    buffer
  );
  return { iv: Array.from(iv), encrypted: new Uint8Array(encrypted) };
};

const decryptFile = async ({ iv, encrypted }, key) => {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encrypted
  );
  return new Blob([decrypted], { type: 'application/octet-stream' });
};

export {
  generateKey,
  exportKey,
  importKey,
  storeKey,
  getKey,
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
};