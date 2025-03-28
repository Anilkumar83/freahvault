const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '23h51a04n1@cmrcet.ac.in', // From email
    pass: 'kdmk fnin tkgy jdia', // App password
  },
});

// Function to send email with expiring products
function sendExpiringProductsEmail(expiringProducts) {
  if (expiringProducts.length === 0) {
    console.log('No expiring products to send in email');
    return;
  }

  // Create email body with product details
  let emailBody = `
    <h2>Expiring Products Alert</h2>
    <p>Dear Store Owner,</p>
    <p>The following products are expiring within 5 days. Please take necessary action to prevent waste.</p>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Expiry Date</th>
          <th>Category</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
  `;

  expiringProducts.forEach(product => {
    emailBody += `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.expiryDate}</td>
        <td>${product.category}</td>
        <td>$${product.price}</td>
      </tr>
    `;
  });

  emailBody += `
      </tbody>
    </table>
    <p>Best regards,</p>
    <p>Grocery Store Team</p>
  `;

  // Email options
  const mailOptions = {
    from: '23h51a04n1@cmrcet.ac.in',
    to: 'malothuanilkumar83@gmail.com',
    subject: 'Alert: Products Expiring Soon',
    html: emailBody,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = { sendExpiringProductsEmail };