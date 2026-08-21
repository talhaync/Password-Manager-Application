package com.talha.pma.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talha.pma.dto.request.VaultEntryRequest;
import com.talha.pma.dto.response.VaultEntryDetailResponse;
import com.talha.pma.dto.response.VaultEntryResponse;
import com.talha.pma.entity.User;
import com.talha.pma.service.VaultEntryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "api/v1/vault")
@RequiredArgsConstructor
public class VaultEntryController {

    private final VaultEntryService vaultEntryService;
    
    @GetMapping()
    public ResponseEntity<List<VaultEntryResponse>> getAllVaultEntryies(@AuthenticationPrincipal User user){
        List<VaultEntryResponse> vaultEntryResponses = vaultEntryService.getAllVaultEntries(user);
        return ResponseEntity.status(HttpStatus.OK).body(vaultEntryResponses);
    }

    @GetMapping(path = "/{id}/reveal")
    public ResponseEntity<VaultEntryDetailResponse> revealPassword(@PathVariable("id") UUID entityId, @AuthenticationPrincipal User currentUser){
        VaultEntryDetailResponse vaultEntryDetailResponse = vaultEntryService.revealPassword(entityId, currentUser);
        return ResponseEntity.status(HttpStatus.OK).body(vaultEntryDetailResponse);
    }

    @PostMapping
    public ResponseEntity<VaultEntryResponse> createVaultEntry(@RequestBody @Valid VaultEntryRequest vaultyEntryRequest,
    @AuthenticationPrincipal User currentUser){
        VaultEntryResponse vaultEntryResponse = vaultEntryService.createVaultEntry(vaultyEntryRequest, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(vaultEntryResponse);
    }

    @PutMapping(path = "/{id}") 
    public ResponseEntity<VaultEntryResponse> updateVaultEntry(@RequestBody @Valid VaultEntryRequest vaultyEntryRequest,
    @PathVariable ("id") UUID vaultEntryId, @AuthenticationPrincipal User user){
        VaultEntryResponse vaultEntryResponse = vaultEntryService.updateVaultEntry(vaultEntryId, vaultyEntryRequest, user);
        return ResponseEntity.status(HttpStatus.OK).body(vaultEntryResponse);
    }

    @DeleteMapping(path = "/{id}") 
    public ResponseEntity<Void> deleteVaultEntry(@PathVariable ("id") UUID vaultEntryId, 
        @AuthenticationPrincipal User user){
        vaultEntryService.deleteVaultEntry(vaultEntryId, user);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }


}
