import Twilio from "twilio";

const client = Twilio(
	process.env.TWILIO_SID,
	process.env.TWILIO_TOKEN
);

export const sendSMS = async (to: string, body: string) => {
	await client.messages.create({
		body,
		from: process.env.TWILIO_NUMBER,
		to,
	});
};

export const sendWhatsAppMessage = async (to: string) => {
	try {
		const res = await client.messages.create({
			from: `whatsapp:${process.env.TWILIO_NUMBER}`,
			to: `whatsapp:${to}`,
			contentSid: "HX27c542817f11499df2301c22fb7998a0",
			messagingServiceSid: "MGb9a7f084e43f105cece9b308e2d8113b",
			contentVariables: JSON.stringify({
				1: "Dimitri",
				2: "https://gulfshoregroup.com/Florida-Real-Estate-Search/Homes/Naples/sort=Newest-First",
			}),
		});
		console.log("WhatsApp message sent successfully", res);
	} catch (error) {
		console.log("WhatsApp message sent failed", error);
	}
};
