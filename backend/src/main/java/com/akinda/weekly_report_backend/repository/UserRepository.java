package com.akinda.weekly_report_backend.repository;

import com.akinda.weekly_report_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(com.akinda.weekly_report_backend.entity.Role role);
}