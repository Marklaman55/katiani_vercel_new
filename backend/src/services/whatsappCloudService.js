import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const sendWhatsAppMessage = async (to, message) => {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn('WhatsApp credentials missing. Skipping message.');
    return;
  }
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp Cloud message sent:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ WhatsApp Cloud API Error:', error.response?.data || error.message);
    throw error;
  }
};
