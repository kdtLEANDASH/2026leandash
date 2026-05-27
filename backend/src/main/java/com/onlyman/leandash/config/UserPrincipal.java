package com.onlyman.leandash.config;

import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal {

    private final Long userId;
    private final String employeeNo;
    private final String userName;
    private final Role role;
    private final Collection<? extends GrantedAuthority> authorities;

    private UserPrincipal(Long userId, String employeeNo, String userName, Role role) {
        this.userId = userId;
        this.employeeNo = employeeNo;
        this.userName = userName;
        this.role = role;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(
                user.getUserId(),
                user.getEmployeeNo(),
                user.getUserName(),
                user.getRoleEnum()
        );
    }
}
