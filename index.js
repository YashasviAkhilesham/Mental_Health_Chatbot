const express = require('express');
const axios = require('axios');
const twilio = require('twilio');
const app = express();

app.use(express.urlencoded({ extended: false }));

const VOICEFLOW_API_KEY = 'Bearer VF.DM.686946d7d3fd6eed7a8f9abc.ibWdbRLFF02N5vud'; // Replace with your actual key if needed

// Optional GET route just to check deployment
app.get('/', (req, res) => {
  res.send('Bot is deployed and running!');
});

app.post('/whatsapp', async (req, res) => {
  const msg = req.body.Body;
  const from = req.body.From;

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

    const reply = response.data?.[0]?.payload?.message || 'Hmm… the bot had nothing to say.';
    
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  } catch (err) {
    console.error('Voiceflow Error:', err.response?.data || err.message);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("Oops, something went wrong. Try again later!");
    res.set('Content-Type', 'text/xml');
    res.send(twiml.toString());
  }
});

app.listen(3000, () => {
  console.log('Bot is alive on port 3000!');
});

