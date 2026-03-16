import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, url: string) {
	const { error } = await resend.emails.send({
		from: "MeritProServices <noreply@meritproservices.com>",
		to: email,
		subject: "Your sign-in link",
		html: `
			<p>Click the link below to sign in:</p>
			<p><a href="${url}">Sign in to MeritProServices</a></p>
			<p>This link expires in 15 minutes.</p>
			<p>If you didn't request this, you can safely ignore this email.</p>
		`,
	});

	if (error) {
		throw new Error(`Failed to send email: ${error.message}`);
	}
}
