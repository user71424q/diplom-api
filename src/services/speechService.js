const axios = require('axios');
const https = require('https');
const TokenManager = require('../utils/tokenManager');

const SALUTESPEECH_API_URL = 'https://smartspeech.sber.ru/rest/v1/text:synthesize';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Отключаем проверку сертификата
});

async function synthesizeSpeech({ text, voice = 'Nec_24000', format = 'opus' }) {
  try {
    const token = await TokenManager.getToken();

    const response = await axios.post(
      SALUTESPEECH_API_URL,
      text,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/text',
        },
        params: {
          voice,
          format,
        },
        responseType: 'arraybuffer',
        httpsAgent,
      }
    );

    return response;
  } catch (error) {
    throw new Error(`Ошибка при синтезе речи: ${error.message}`);
  }
}

module.exports = {
  synthesizeSpeech,
};
