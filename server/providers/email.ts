interface EmailMessage {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

function sendEmail(message: EmailMessage): Promise<EmailMessage> {
    return Promise.resolve(message);
}

export {
    sendEmail
};
