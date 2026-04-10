import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const PUBLIC_KEY = process.env.UPLOADCARE_PUBLIC_KEY;
const SECRET_KEY = process.env.UPLOADCARE_SECRET_KEY;

// ✅ pindahin ke env biar fleksibel
const CDN_BASE = process.env.UPLOADCARE_CDN_BASE || "https://38le06yt3u.ucarecd.net/";

const UPLOAD_URL = 'https://upload.uploadcare.com/base/';
const DELETE_URL = 'https://api.uploadcare.com/files';

const ensureKeys = () => {
  if (!PUBLIC_KEY || !SECRET_KEY) {
    throw new Error('UPLOADCARE_PUBLIC_KEY and UPLOADCARE_SECRET_KEY must be set in .env');
  }
};

export const uploadFile = async (filePath, fileName) => {
  ensureKeys();

  const form = new FormData();

  if (Buffer.isBuffer(filePath)) {
    form.append('file', filePath, { filename: fileName });
  } else if (typeof filePath === 'string') {
    form.append('file', fs.createReadStream(filePath), { filename: fileName });
  } else {
    throw new Error('uploadFile expects a file path string or Buffer');
  }

  form.append('UPLOADCARE_PUB_KEY', PUBLIC_KEY);
  form.append('UPLOADCARE_STORE', '1');

  const response = await axios.post(UPLOAD_URL, form, {
    headers: {
      ...form.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  const fileId = response.data?.file;

  if (!fileId) {
    console.error("UPLOAD ERROR:", response.data);
    throw new Error('Uploadcare response did not return a file UUID');
  }

  // ✅ selalu pakai CDN alias yang valid
  const cdnUrl = `${CDN_BASE}${fileId}/`;

  console.log("UPLOAD SUCCESS:", fileId);

  return {
    fileId,
    cdnUrl,
  };
};

export const deleteFile = async (uuid) => {
  ensureKeys();

  if (!uuid) {
    throw new Error('deleteFile requires a Uploadcare file UUID');
  }

  try {
    await axios.delete(`${DELETE_URL}/${uuid}/`, {
      headers: {
        Authorization: `Uploadcare.Simple ${PUBLIC_KEY}:${SECRET_KEY}`,
      },
    });

    console.log("DELETE SUCCESS:", uuid);

    return { success: true };
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      return { success: false, message: 'File not found' };
    }

    throw new Error(`Uploadcare delete failed: ${error.response?.data || error.message}`);
  }
};