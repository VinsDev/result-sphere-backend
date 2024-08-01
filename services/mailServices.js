const nodemailer = require('nodemailer');

exports.sendSubscriptionEmail = async (email, name, phone) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSMAILER,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email.trim(),
      subject: `Congratulations, ${name}! Welcome to Result Sphere`,
      html: `
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your subscription to Result Sphere has been successfully activated. You can now enjoy the full range of services we offer.</p>
        
        <h3>Admin Panel</h3>
        <p>The Admin Panel allows you to manage and control all the functionalities of your school instance created on our platform. Below are the credentials you need to access it:</p>
        
        <h4>Admin Panel Credentials:</h4>
        <p>Link: <a href="https://orbital-node-platform.onrender.com/admin"</a></p>
        <p>Username: ${email}</p>
        <p>Password: ${phone}</p>
        
        <h3>School Website and Result Checking Portal</h3>
        <p>The public can access your school website and portal created on our platform via the following link <a href="https://orbital-node-platform.onrender.com"</a>

        <p>Parents and students can access various features available on your school website, including the Student Portal where results can be checked and downloaded once released by the school from the admin panel.</p>
        
        <p>For detailed instructions on using the Admin Panel and School Website, please visit our official website.</p>
        
        <p>Thank you once again for subscribing to our service.</p>
        
        <p>Best regards,</p>
        <p>Result Sphere Team</p>
      `,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Error:", error, "Email not sent");
  }
};
