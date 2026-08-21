package com.talha.pma.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.talha.pma.exception.EmailDeliveryException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final String fromAddress;
    private final long expirationMinutes;

    public EmailService(
        JavaMailSender javaMailSender,
        @Value("${app.mail.from}") String fromAddress,
        @Value("${app.otp.expiration-minutes}") long expirationMinutes
    ) {
        this.javaMailSender = javaMailSender;
        this.fromAddress = fromAddress;
        this.expirationMinutes = expirationMinutes;
    }

    public void sendOtpCode(String to, String code) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromAddress);
    message.setTo(to);
    message.setSubject("Your verification code");
    message.setText(
            "Your verification code is: " + code + "\n\n"
            + "This code expires in " + expirationMinutes + " minutes and can only be used once.\n\n"
            + "If you didn't try to sign in, you can ignore this email — "
            + "but consider changing your master password."
    );

    try {
        javaMailSender.send(message);
        log.info("OTP email sent to {}", to);
    } catch (MailException e) {
        log.error("Failed to send OTP email to {}", to, e);
        throw new EmailDeliveryException("Couldn't send the verification code.");
    }
}


}
