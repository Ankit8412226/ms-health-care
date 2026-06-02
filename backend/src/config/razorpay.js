const Razorpay = require('razorpay');

// Hardcoded live Razorpay credentials as requested by the user
const razorpay = new Razorpay({
  key_id: 'rzp_live_SwTSEkWxau6fbi',
  key_secret: 'I0NySzSeypRaJCFr3G5wBBY2',
});

module.exports = razorpay;
