package com.talha.pma.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import com.talha.pma.dto.request.VaultEntryRequest;
import com.talha.pma.dto.response.VaultEntryDetailResponse;
import com.talha.pma.dto.response.VaultEntryResponse;
import com.talha.pma.entity.User;
import com.talha.pma.entity.VaultEntry;
import com.talha.pma.exception.ResourceNotFoundException;
import com.talha.pma.repository.VaultEntryRepository;
import com.talha.pma.util.EncryptionUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VaultEntryService {

    private final VaultEntryRepository vaultEntryRepository;
    private final EncryptionUtil encryptionUtil;
    
    public List<VaultEntryResponse> getAllVaultEntries(User user){

        return vaultEntryRepository.findByUserId(user.getId())
        .stream()
        .map(this::mapToResponse)   
        .collect(Collectors.toList());
    }

    public VaultEntryDetailResponse revealPassword(UUID entryId, User currentUser){
        VaultEntry vaultEntry = findOwnedEntryorThrow(currentUser, entryId);

        String decryptedPassword = encryptionUtil.decrypt(vaultEntry.getEncryptedPassword());

        return new VaultEntryDetailResponse(
                vaultEntry.getId(),
                vaultEntry.getPlatformName(),
                vaultEntry.getPlatformUsername(),
                decryptedPassword,
                vaultEntry.getNotes()
        );
    }

    public VaultEntryResponse createVaultEntry(VaultEntryRequest vaultyEntryRequest, @AuthenticationPrincipal User user){
        VaultEntry vaultEntry = new VaultEntry();
        vaultEntry.setPlatformName(vaultyEntryRequest.getPlatformName());
        vaultEntry.setPlatformUsername(vaultyEntryRequest.getPlatformUsername());
        vaultEntry.setEncryptedPassword(encryptionUtil.encrypt(vaultyEntryRequest.getPassword()));
        vaultEntry.setNotes(vaultyEntryRequest.getNotes());
        vaultEntry.setUser(user);

        VaultEntry savedEntry = vaultEntryRepository.save(vaultEntry);
        return mapToResponse(savedEntry);
    }

   public VaultEntryResponse updateVaultEntry(UUID entryId, VaultEntryRequest request, User user) {
        VaultEntry vaultEntry = findOwnedEntryorThrow(user, entryId);

        vaultEntry.setPlatformName(request.getPlatformName());
        vaultEntry.setPlatformUsername(request.getPlatformUsername());
        vaultEntry.setNotes(request.getNotes());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            vaultEntry.setEncryptedPassword(encryptionUtil.encrypt(request.getPassword()));
        }

        VaultEntry updated = vaultEntryRepository.save(vaultEntry);
        return mapToResponse(updated);
    }

    public void deleteVaultEntry(UUID vaultEntryId, User user){
        VaultEntry vaultEntry = findOwnedEntryorThrow(user, vaultEntryId);
        vaultEntryRepository.delete(vaultEntry);
    }

    private VaultEntry findOwnedEntryorThrow(User user, UUID entryId) {
        return vaultEntryRepository.findByIdAndUserId(entryId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Vault entry not found"));
    }

    private VaultEntryResponse mapToResponse(VaultEntry vaultEntry){
        return new VaultEntryResponse(
            vaultEntry.getId(),
            vaultEntry.getPlatformName(),
            vaultEntry.getPlatformUsername(),
            vaultEntry.getNotes()
        );
    }
}
