package com.talha.pma.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class VaultEntryDetailResponse {

    private UUID id;
    private String platformName;
    private String platformUsername;
    private String password;  
    private String notes;
}
