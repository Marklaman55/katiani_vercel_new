import axios from 'axios';
import moment from 'moment';

const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
        throw new Error('M-Pesa Consumer Key or Secret is missing in environment variables');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Mpesa Access Token Error:', error.response?.data || error.message);
        throw new Error('Failed to generate M-Pesa access token');
    }
};

export const initiateStkPush = async (phone, amount, bookingId) => {
    try {
        const accessToken = await getAccessToken();
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        
        if (!shortcode || !passkey) {
            throw new Error('M-Pesa Shortcode or Passkey is missing in environment variables');
        }

        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
        const callbackUrl = process.env.MPESA_CALLBACK_URL;

        if (!callbackUrl) {
            throw new Error('M-Pesa Callback URL is missing');
        }

        // Ensure phone is in format 254XXXXXXXXX
        let formattedPhone = phone.toString().replace(/\D/g, '');
        
        // Remove leading 0
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }
        
        // Handle double prefixes or nested prefixes
        while (formattedPhone.startsWith('254254')) {
            formattedPhone = formattedPhone.substring(3);
        }
        
        // If it starts with 254 and is long (e.g. 254254...), keep it simple
        if (formattedPhone.length > 12 && formattedPhone.startsWith('254')) {
            // Case where it might be 25407XXXXXXXX -> 2542547XXXXXXXX originally
            // we try to extract the last 9 digits and prefix with 254
            formattedPhone = '254' + formattedPhone.slice(-9);
        }

        // Final check: if it doesn't start with 254, add it
        if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone.slice(-9);
        }

        // Ensure exactly 12 digits
        if (formattedPhone.length !== 12) {
            console.error("Invalid phone length after formatting:", formattedPhone);
            throw new Error(`Invalid phone number format: ${formattedPhone}. Must be 12 digits starting with 254.`);
        }

        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: String(bookingId).substring(0, 12),
            TransactionDesc: `Booking ${bookingId}`
        };

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
        throw error;
    }
};
