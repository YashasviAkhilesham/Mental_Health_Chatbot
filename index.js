const express = require('express');
const axios = require('axios');
const twilio = require('twilio');
const app = express();

app.use(express.urlencoded({ extended: false }));

// ✅ Replace with your new Voiceflow API key here
const VOICEFLOW_API_KEY = 'Bearer YOUR_NEW_API_KEY_HERE';  // <---- 👈 Don't forget 'Bearer '

app.get('/', (req, res) => {
  res.send('✅ Bot is deployed and running!');
});

app.post('/whatsapp', async (req, res) => {
  const msg = req.body.Body;
  const from = req.body.From;

  console.log("📨 Incoming WhatsApp Msg:", msg);
  console.log("📱 From:", from);

  try {
    const response = await axios.post(
      `https://general-runtime.voiceflow.com/state/user/${encodeURIComponent(from)}/interact`,
      {
        request: {
          type: 'text',
          payload: msg
        },
        config: {
          tts: false,
          stripSSML: true
        }
      },
      {
        headers: {
          Authorization: VOICEFLOW_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data?.[0]?.payload?.message || '🤖 (No reply from bot.)';

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);

    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('❌ Voiceflow Error:', err.response?.data || err.message);

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("😔 Oops, something went wrong. Try again later.");
    
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

app.listen(3000, () => {
  console.log('🚀 Bot is live and listening on port 3000');
});


