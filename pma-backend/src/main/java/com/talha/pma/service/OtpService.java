package com.talha.pma.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.talha.pma.entity.OtpCode;
import com.talha.pma.entity.User;
import com.talha.pma.exception.InvalidOtpException;
import com.talha.pma.exception.OtpCooldownException;
import com.talha.pma.repository.OtpCodeRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final long expirationMinutes;
    private final int maxAttempts;
    private final long resendCooldownSeconds;

    public OtpService(
            OtpCodeRepository otpCodeRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.otp.expiration-minutes}") long expirationMinutes,
            @Value("${app.otp.max-attempts}") int maxAttempts,
            @Value("${app.otp.resend-cooldown-seconds}") long resendCooldownSeconds
    ) {
        this.otpCodeRepository = otpCodeRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expirationMinutes = expirationMinutes;
        this.maxAttempts = maxAttempts;
        this.resendCooldownSeconds = resendCooldownSeconds;
    }

    public void generateAndSend(User user) {
        enforceCooldown(user);

        String code = generateCode();

        OtpCode otpCode = new OtpCode();
        otpCode.setUser(user);
        otpCode.setHashedCode(passwordEncoder.encode(code));
        otpCode.setCreatedAt(LocalDateTime.now());
        otpCode.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));

        otpCodeRepository.save(otpCode);

        emailService.sendOtpCode(user.getEmail(), code);

        log.info("OTP generated for user {}", user.getId());
    }

    public void verify(User user, String submittedCode) {
        OtpCode otpCode = otpCodeRepository
                .findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new InvalidOtpException("No verification code was requested."));

        if (otpCode.isCodeUsed()) {
            throw new InvalidOtpException("This code has already been used.");
        }

        if (LocalDateTime.now().isAfter(otpCode.getExpiresAt())) {
            throw new InvalidOtpException("This code has expired. Request a new one.");
        }

        if (otpCode.getAttempts() >= maxAttempts) {
            throw new InvalidOtpException("Too many incorrect attempts. Request a new code.");
        }

        if (!passwordEncoder.matches(submittedCode, otpCode.getHashedCode())) {
            otpCode.setAttempts(otpCode.getAttempts() + 1);
            otpCodeRepository.save(otpCode);

            log.warn("Incorrect OTP attempt {} of {} for user {}",
                    otpCode.getAttempts(), maxAttempts, user.getId());

            throw new InvalidOtpException("Incorrect code.");
        }

        otpCode.setCodeUsed(true);
        otpCodeRepository.save(otpCode);

        log.info("OTP verified for user {}", user.getId());
    }

    private void enforceCooldown(User user) {
        Optional<OtpCode> latest = otpCodeRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());

        if (latest.isEmpty()) {
            return;
        }

        LocalDateTime nextAllowed = latest.get().getCreatedAt().plusSeconds(resendCooldownSeconds);

        if (LocalDateTime.now().isBefore(nextAllowed)) {
            throw new OtpCooldownException(
                    "Please wait before requesting another code."
            );
        }
    }

    private String generateCode() {
        return String.valueOf(RANDOM.nextInt(900_000) + 100_000);
    }
}