package com.talha.pma.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.talha.pma.dto.request.LoginRequest;
import com.talha.pma.dto.request.OtpVerifyRequest;
import com.talha.pma.dto.request.RegisterRequest;
import com.talha.pma.dto.response.AuthResponse;
import com.talha.pma.dto.response.LoginResponse;
import com.talha.pma.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(path = "/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest  registerRequest){
        AuthResponse authResponse = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody @Valid OtpVerifyRequest request) {
        AuthResponse authResponse = authService.verifyOtp(request);
        return ResponseEntity.status(HttpStatus.OK).body(authResponse);
    }
}
