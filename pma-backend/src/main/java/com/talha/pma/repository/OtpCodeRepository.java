package com.talha.pma.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talha.pma.entity.OtpCode;

public interface OtpCodeRepository extends JpaRepository <OtpCode, UUID> {

    Optional<OtpCode> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}
