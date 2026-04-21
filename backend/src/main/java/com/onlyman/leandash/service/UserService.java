package com.onlyman.leandash.service;

import com.onlyman.leandash.config.JwtTokenProvider;
import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.UserCreateRequest;
import com.onlyman.leandash.dto.UserLoginRequest;
import com.onlyman.leandash.dto.UserLoginResponse;
import com.onlyman.leandash.dto.UserResponse;
import com.onlyman.leandash.dto.UserRoleUpdateRequest;
import com.onlyman.leandash.dto.UserSearchRequest;
import com.onlyman.leandash.dto.UserStatusUpdateRequest;
import com.onlyman.leandash.dto.UserUpdateRequest;
import com.onlyman.leandash.entity.Department;
import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.entity.UserStatus;
import com.onlyman.leandash.repository.DepartmentRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponse signup(UserCreateRequest request) {
        validateDuplicate(request);

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서입니다."));

        User user = User.builder()
                .employeeNo(request.getEmployeeNo())
                .userName(request.getUserName())
                .password(passwordEncoder.encode(request.getPassword()))
                .department(department)
                .email(request.getEmail())
                .phone(request.getPhone())
                .birthDate(request.getBirthDate())
                .address(request.getAddress())
                .gender(request.getGender())
                .position(request.getPosition())
                .userStatus(UserStatus.OFFLINE.name())
                .role(Role.USER.name())
                .build();

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    public UserLoginResponse login(UserLoginRequest request) {
        User user = userRepository.findByEmployeeNo(request.getEmployeeNo())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사번입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        UserPrincipal principal = UserPrincipal.from(user);

        return UserLoginResponse.builder()
                .userId(user.getUserId())
                .employeeNo(user.getEmployeeNo())
                .userName(user.getUserName())
                .email(user.getEmail())
                .userStatus(user.getUserStatus())
                .role(user.getRoleEnum().name())
                .accessToken(jwtTokenProvider.createAccessToken(principal))
                .tokenType("Bearer")
                .message("로그인 성공")
                .build();
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public List<UserResponse> searchUsers(UserSearchRequest request) {
        String normalizedRole = request.getRole() == null || request.getRole().isBlank()
                ? null
                : Role.from(request.getRole()).name();
        String normalizedUserStatus = request.getUserStatus() == null || request.getUserStatus().isBlank()
                ? null
                : UserStatus.from(request.getUserStatus()).name();

        return userRepository.searchUsers(
                        request.getKeyword(),
                        request.getDepartmentId(),
                        normalizedRole,
                        normalizedUserStatus
                ).stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getUser(Long userId) {
        return UserResponse.from(getUserEntity(userId));
    }

    public UserResponse getMyProfile(Long currentUserId) {
        return UserResponse.from(getUserEntity(currentUserId));
    }

    public List<UserResponse> getUsersByDepartment(Long departmentId) {
        validateDepartmentExists(departmentId);

        return userRepository.findAllByDepartment_DepartmentIdOrderByUserIdAsc(departmentId).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateMyProfile(Long currentUserId, UserUpdateRequest request) {
        User user = getUserEntity(currentUserId);
        applyUserUpdate(user, request, false);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = getUserEntity(userId);
        applyUserUpdate(user, request, true);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUserRole(Long currentUserId, Long userId, UserRoleUpdateRequest request) {
        User user = getUserEntity(userId);
        Role targetRole = Role.from(request.getRole());

        if (currentUserId.equals(userId)) {
            throw new IllegalArgumentException("you cannot change your own role");
        }

        if (userRepository.existsByUserIdAndRole(userId, Role.ADMIN.name())
                && targetRole != Role.ADMIN
                && userRepository.countByRole(Role.ADMIN.name()) <= 1) {
            throw new IllegalArgumentException("at least one admin must remain");
        }

        user.updateRole(targetRole);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        User user = getUserEntity(userId);
        user.updateUserStatus(UserStatus.from(request.getUserStatus()));
        return UserResponse.from(user);
    }

    public boolean hasUsersInDepartment(Long departmentId) {
        return userRepository.existsByDepartment_DepartmentId(departmentId);
    }

    private void applyUserUpdate(User user, UserUpdateRequest request, boolean allowPositionChange) {
        if (request.getUserName() != null) {
            user.setUserName(request.getUserName());
        }

        if (request.getEmail() != null) {
            validateEmailDuplicate(request.getEmail(), user.getUserId());
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (allowPositionChange && request.getPosition() != null) {
            user.setPosition(request.getPosition());
        }
    }

    private void validateDuplicate(UserCreateRequest request) {
        if (userRepository.existsByEmployeeNo(request.getEmployeeNo())) {
            throw new IllegalArgumentException("이미 사용 중인 사번입니다.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }

    private void validateEmailDuplicate(String email, Long userId) {
        if (userRepository.existsByEmailAndUserIdNot(email, userId)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
    }

    private void validateDepartmentExists(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new IllegalArgumentException("존재하지 않는 부서입니다.");
        }
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }
}
