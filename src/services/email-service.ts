import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const sendMail = async (reciever: string, subject: string, text: string) => {
  const msg = {
    to: reciever,
    from: process.env.SENDGRID_EMAIL as string,
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent');
  } catch (err) {
    console.log(err.message);
  }
};

export { sendMail };
