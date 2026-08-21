package com.talha.pma.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.talha.pma.dto.request.LoginRequest;
import com.talha.pma.dto.request.OtpVerifyRequest;
import com.talha.pma.dto.request.RegisterRequest;
import com.talha.pma.dto.response.AuthResponse;
import com.talha.pma.dto.response.LoginResponse;
import com.talha.pma.entity.User;
import com.talha.pma.exception.EmailAlreadyExistException;
import com.talha.pma.exception.InvalidCredentialsException;
import com.talha.pma.repository.UserRepository;
import com.talha.pma.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    public AuthResponse register(RegisterRequest registerRequest){
        
        if(userRepository.existsByEmail(registerRequest.getEmail())){
            throw new EmailAlreadyExistException("This mail is already in use.");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setMasterPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        
        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser);

        return new AuthResponse(savedUser.getEmail(), token);
    }

    public LoginResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();

            otpService.generateAndSend(user);

            return new LoginResponse(user.getEmail(), "A verification code has been sent to your email.");

        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }
    }

    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findUserByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        otpService.verify(user, request.getCode());

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(user.getEmail(), token);
    }
}
