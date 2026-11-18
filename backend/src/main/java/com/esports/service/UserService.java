package com.esports.service;

import com.esports.dto.UserRequestDTO;
import com.esports.entity.User;
import com.esports.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> VALID_ROLES = Set.of(
        "ADMIN", "ORGANIZER", "REGIONAL_COORDINATOR", "TEAM_CAPTAIN", "REFEREE", "VIEWER"
    );

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User createUser(UserRequestDTO req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại trong hệ thống.");
        }
        String role = (req.getRole() != null) ? req.getRole().toUpperCase() : "VIEWER";
        if (!VALID_ROLES.contains(role)) {
            throw new IllegalArgumentException("Vai trò phân quyền không hợp lệ.");
        }

        User u = new User();
        u.setFullName(req.getFullName());
        u.setEmail(req.getEmail());
        u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        u.setPhone(req.getPhone());
        u.setRole(role);
        u.setAccountStatus("ACTIVE");
        return userRepo.save(u);
    }

    public User updateUser(Long id, UserRequestDTO req) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản."));
        if (req.getFullName() != null) u.setFullName(req.getFullName());
        if (req.getPhone() != null) u.setPhone(req.getPhone());
        if (req.getRole() != null) {
            if (!VALID_ROLES.contains(req.getRole().toUpperCase())) {
                throw new IllegalArgumentException("Vai trò phân quyền không hợp lệ.");
            }
            u.setRole(req.getRole().toUpperCase());
        }
        if (req.getAccountStatus() != null) {
            u.setAccountStatus(req.getAccountStatus().toUpperCase());
        }
        return userRepo.save(u);
    }
}