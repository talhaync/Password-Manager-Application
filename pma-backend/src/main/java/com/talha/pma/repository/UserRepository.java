package com.talha.pma.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talha.pma.entity.User;

public interface UserRepository extends JpaRepository<User, UUID>{

    Optional<User> findUserByEmail(String email);
    boolean existsByEmail(String email);

}
