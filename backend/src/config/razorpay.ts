import Razorpay from 'razorpay';

console.log('key id', process.env.RAZORPAY_KEY_ID);
console.log('key secret', process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
