package com.example.app.Service;

import com.example.app.Entities.Role;
import com.example.app.Entities.User;
import com.example.app.Repository.RoleRepo;
import com.example.app.Repository.TokenRepository;
import com.example.app.Repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private RoleRepo roleRepo;
    @Autowired
    private FileStorageService fileStorageService;

    private final UserRepo repository;

    public UserService(UserRepo repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username)
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));
    }
    public List<User> findAll() {
        return repository.findAll();
    }
    public User getUserByUsername(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    @Transactional
    public void deleteUserByUsername(String username) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Remove the user from all roles
        for (Role role : user.getRoles()) {
            role.getUsers().remove(user);
        }
        user.getRoles().clear();

        // First delete all related tokens
        tokenRepository.deleteAll(user.getTokens());

        // Then delete the user
        repository.delete(user);
    }
    public User updateUserByUsername(String username, User updatedUser) {
        Optional<User> existingUserOptional = repository.findByUsername(username);

        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();

            // Update fields
            if (updatedUser.getEmail() != null) existingUser.setEmail(updatedUser.getEmail());
            if (updatedUser.getUsername() != null) existingUser.setUsername(updatedUser.getUsername());
            if (updatedUser.getPassword() != null) existingUser.setPassword(updatedUser.getPassword());
            if (updatedUser.getFirstname() != null) existingUser.setFirstname(updatedUser.getFirstname());
            if (updatedUser.getLastName() != null) existingUser.setLastName(updatedUser.getLastName());
            if (updatedUser.getPhotoProfile() != null) existingUser.setPhotoProfile(updatedUser.getPhotoProfile());
            if (updatedUser.getPhotoCover() != null) existingUser.setPhotoCover(updatedUser.getPhotoCover());
            if (updatedUser.getGender() != null) existingUser.setGender(updatedUser.getGender());
            if (updatedUser.getAdress() != null) existingUser.setAdress(updatedUser.getAdress());
            if (updatedUser.getCountry() != null) existingUser.setCountry(updatedUser.getCountry());
            if (updatedUser.getPhone() != null) existingUser.setPhone(updatedUser.getPhone());
            if (updatedUser.getBirthday() != null) existingUser.setBirthday(updatedUser.getBirthday());

            if (updatedUser.getValide() != null) {

                if (updatedUser.getValide() && !existingUser.getValide()) {
                    existingUser.setActiveDate(LocalDate.now());
                }
                existingUser.setValide(updatedUser.getValide());
            }


            return repository.save(existingUser);
        } else {
            throw new RuntimeException("User with username " + username + " not found");
        }
    }
    public List<User> searchUsersByFirstNameOrLastName(String keyword) {
        return repository.findByFirstnameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword);
    }
    public User searchUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email " + email + " not found"));
    }
    public User assignRoleToUserByUsername(String username, Set<String> roleNames) {
        Optional<User> user = repository.findByUsername(username);  // Find the user by username
        if (user.isPresent()) {  // If the user exists
            Set<Role> roles = new HashSet<>();  // Create a new set to store the new roles

            for (String roleName : roleNames) {
                Optional<Role> role = roleRepo.findByRoleName(roleName);  // Find each role by its name
                role.ifPresent(r -> roles.add(r));  // If the role is present, add it to the set
            }

            user.get().setRoles(roles);  // Set the new roles to the user
            return repository.save(user.get());  // Save the user with the new roles
        }
        return null;  // Return null if the user is not found
    }
    public User updateProfilePhoto(String username, MultipartFile file) {
        Optional<User> userOptional = repository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String filename = fileStorageService.store(file);
            user.setPhotoProfile(filename);
            return repository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    public User updateCoverPhoto(String username, MultipartFile filecover) {
        Optional<User> userOptional = repository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String filename = fileStorageService.store(filecover);
            user.setPhotoCover(filename);
            return repository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }
    public User updateUserStatus(String username, boolean isConnect) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setConnect(isConnect);
        return repository.save(user);
    }

}
