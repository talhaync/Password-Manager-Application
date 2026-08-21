package com.talha.pma.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talha.pma.entity.VaultEntry;

public interface VaultEntryRepository extends JpaRepository<VaultEntry, UUID>{

    Optional<VaultEntry> findByIdAndUserId(UUID userId, UUID entryId);
    List<VaultEntry> findByUserId(UUID userId);
}
