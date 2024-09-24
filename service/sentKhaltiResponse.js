const axios = require('axios');

const initiatePayment = async (payment, return_url, website_url) => {
  const data = {
    return_url: return_url,
    website_url: website_url,
    amount: payment.paymentAmount * 100,
    purchase_order_id: payment._id,
    purchase_order_name: 'Pet Adoption',
    customer_info: {
      name: payment.user.firstName,
      email: payment.user.email,
      phone: payment.user.phone,
    },

    amount_breakdown: [ 
      {
        label: 'Adoption Fee',
        amount: payment.paymentAmount * 100,
      },
    ],
    product_details: [
      {
        identity: payment.pet._id,
        name: payment.pet.petName,
        total_price: payment.paymentAmount * 100,
        quantity: 1,
        unit_price: payment.paymentAmount * 100,
      },
    ],
    merchant_extra: {
      petId: payment.pet._id,
      petName: payment.pet.name,
      adoptionDate: new Date().toISOString(),
    },
  };

  const options = {
    headers: {
      Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      JSON.stringify(data),
      options
    );
    console.log(response.data);
    return response;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

const verifyPayment = async (token) => {
  const data = {
    pidx: token,
  };

  // /epayment/lookup/	POST	Required	application/json
  const options = {
    headers: {
      Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    console.log('Verifying payment with token:', token);
    console.log('Verifying payment with data:', options);
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      data,
      options
    );
    console.log('Verification response data:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
};
