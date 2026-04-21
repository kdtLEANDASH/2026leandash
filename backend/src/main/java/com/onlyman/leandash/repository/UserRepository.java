package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmployeeNo(String employeeNo);

    boolean existsByEmail(String email);

    boolean existsByEmailAndUserIdNot(String email, Long userId);

    boolean existsByUserIdAndRole(Long userId, String role);

    boolean existsByDepartment_DepartmentId(Long departmentId);

    long countByRole(String role);

    Optional<User> findByEmployeeNo(String employeeNo);

    List<User> findAllByDepartment_DepartmentIdOrderByUserIdAsc(Long departmentId);

    @Query("""
            select u
            from User u
            join u.department d
            where (:keyword is null or trim(:keyword) = '' or
                   lower(u.userName) like lower(concat('%', :keyword, '%')) or
                   lower(u.employeeNo) like lower(concat('%', :keyword, '%')) or
                   lower(u.email) like lower(concat('%', :keyword, '%')))
              and (:departmentId is null or d.departmentId = :departmentId)
              and (:role is null or trim(:role) = '' or u.role = :role)
              and (:userStatus is null or trim(:userStatus) = '' or u.userStatus = :userStatus)
            order by u.userId asc
            """)
    List<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("departmentId") Long departmentId,
            @Param("role") String role,
            @Param("userStatus") String userStatus
    );

}
