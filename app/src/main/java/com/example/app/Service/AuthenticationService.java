package com.example.app.Service;

import com.example.app.Entities.AuthenticationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.app.Entities.Role;
import com.example.app.Entities.Token;
import com.example.app.Entities.User;
import com.example.app.Repository.RoleRepo;
import com.example.app.Repository.TokenRepository;
import com.example.app.Repository.UserRepo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthenticationService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final TokenRepository tokenRepository;

    private final AuthenticationManager authenticationManager;
    private final RoleRepo roleRepo;

    public AuthenticationService(UserRepo userRepo,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 TokenRepository tokenRepository,
                                 AuthenticationManager authenticationManager,
                                 RoleRepo roleRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.authenticationManager = authenticationManager;
        this.roleRepo=roleRepo;
    }

    public AuthenticationResponse register(User request,String roleName) {
        // Check if username already exists
        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            return new AuthenticationResponse(null, null, "User already exists");
        }

        // Check if phone number already exists
        List<User> existingUsers = userRepo.findByPhone(request.getPhone());
        if (!existingUsers.isEmpty()) {
            return new AuthenticationResponse(null, null, "This phone number is already registered.");
        }
        Set<Role> roles = new HashSet<>();

        // Assuming request.getRoles() contains a list of roles, and we're picking the first role
        Role role = roleRepo.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found for name: " + roleName));

        // Add the found role to the roles set
        roles.add(role);

        // Create and save the user
        User user = new User();
        user.setEmail((request.getEmail()));
        user.setFirstname(request.getFirstname());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setCountry(request.getCountry());
        user.setGender(request.getGender());
        user.setAdress(request.getAdress());
        user.setValide(false);
        user.setBirthday(request.getBirthday());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);
        user = userRepo.save(user);

        // Generate JWT tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(accessToken, refreshToken, user);


        return new AuthenticationResponse(accessToken, refreshToken, "User registration was successful");
    }

    public AuthenticationResponse authenticate(User request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );


        User user = userRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        user.setConnect(true);
        userRepo.save(user);

        // Revoke old tokens and create new ones
        return createAuthenticationResponse(user, "User login was successful");
    }

    /**
     * Creates JWT tokens, revokes old ones, and builds the authentication response.
     */
    public AuthenticationResponse createAuthenticationResponse(User user, String message) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllTokensByUser(user);
        saveUserToken(accessToken, refreshToken, user);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());

        return new AuthenticationResponse(accessToken, refreshToken, message, user.getUsername(),
                user.getFirstname(), user.getLastName(), roles);
    }

    /**
     * Revokes all valid tokens associated with the user.
     */
    private void revokeAllTokensByUser(User user) {
        List<Token> validTokens = tokenRepository.findAllByUser(user);
        if (!validTokens.isEmpty()) {
            validTokens.forEach(token -> token.setLoggedOut(true));
            tokenRepository.saveAll(validTokens);
        }
    }

    /**
     * Saves a new token for the user.
     */
    private void saveUserToken(String accessToken, String refreshToken, User user) {
        Token token = new Token();
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setLoggedOut(false);
        token.setUser(user);
        tokenRepository.save(token);
    }


    @Scheduled(cron = "0 0 * * * ?")
    public void cleanUpExpiredTokens() {
        tokenRepository.deleteAllByLoggedOutTrueAndExpirationBefore(LocalDateTime.now());
    }

}
