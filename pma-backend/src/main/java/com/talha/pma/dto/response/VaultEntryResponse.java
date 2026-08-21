package com.talha.pma.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class VaultEntryResponse {
    
    private UUID id;
    private String platformName;
    private String platformUsername;
    private String notes;
}