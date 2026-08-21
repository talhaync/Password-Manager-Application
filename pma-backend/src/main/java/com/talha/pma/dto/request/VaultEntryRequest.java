package com.talha.pma.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VaultEntryRequest {

   @NotBlank
   private String platformName;

   @NotBlank
   private String platformUsername;

    private String password; //plain-text

    @Size(max = 500)
    private String notes;
}
