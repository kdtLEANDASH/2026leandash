package com.onlyman.leandash.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "employee_no", nullable = false, unique = true, length = 20)
    private String employeeNo;

    @Column(name = "user_name", nullable = false, length = 50)
    private String userName;

    @Column(name = "password", nullable = false, length = 200)
    private String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "user_status", nullable = false, length = 20)
    private String userStatus;

    @Column(name = "role", nullable = false, length = 20)
    private String role;

    public UserStatus getUserStatusEnum() {
        return UserStatus.from(userStatus);
    }

    public Role getRoleEnum() {
        return Role.from(role);
    }

    public void updateRole(Role role) {
        this.role = role.name();
    }

    public void updateUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus.name();
    }
}
