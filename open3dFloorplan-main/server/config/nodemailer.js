export const sendEmail = async ({ to, subject, text }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Brevo error: " + err);
  }
};
