const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Create a new WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'group-creator-bot'
  }),
  puppeteer: {
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

// Phone number to send message to (with country code)
const TARGET_PHONE = '60122273341';
const MESSAGE_TEXT = 'Hello! This is a test message from WhatsApp Web JS.';

// Event handlers
client.on('qr', async (qr) => {
  console.log('QR Code received. Please scan it with your WhatsApp:');
  try {
    const qrDataUrl = await qrcode.toDataURL(qr);
    console.log('QR Code Data URL:', qrDataUrl);
    console.log('You can also copy the QR code data above and scan it');
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
});

client.on('ready', async () => {
  console.log('WhatsApp client is ready!');
  console.log('Waiting 5 seconds before sending message...');

  // Wait 5 seconds after authentication before sending
  setTimeout(async () => {
    try {
      // Format the phone number for WhatsApp
      const formattedPhone = TARGET_PHONE + '@c.us';

      console.log(`Sending message to: ${TARGET_PHONE}`);
      console.log(`Message: "${MESSAGE_TEXT}"`);

      // Send the message
      const result = await client.sendMessage(formattedPhone, MESSAGE_TEXT);

      console.log('Message sent successfully!');
      console.log('Message ID:', result.id._serialized);
      console.log('Timestamp:', new Date(result.timestamp * 1000).toLocaleString());

      // Close the client after sending
      setTimeout(async () => {
        await client.destroy();
        console.log('Client destroyed. Exiting...');
        process.exit(0);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      await client.destroy();
      process.exit(1);
    }
  }, 5000); // 5 seconds delay
});

client.on('authenticated', () => {
  console.log('WhatsApp client authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('WhatsApp authentication failed:', msg);
  process.exit(1);
});

client.on('disconnected', (reason) => {
  console.log('WhatsApp client disconnected:', reason);
  process.exit(1);
});

// Initialize the client
console.log('Initializing WhatsApp client...');
console.log('Target phone number:', TARGET_PHONE);
console.log('Message to send:', MESSAGE_TEXT);
console.log('Waiting for QR code...');

client.initialize().catch(error => {
  console.error('Failed to initialize client:', error);
  process.exit(1);
});
