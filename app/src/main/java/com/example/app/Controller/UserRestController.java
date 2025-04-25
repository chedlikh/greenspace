package com.example.app.Controller;

import com.example.app.Entities.AuthenticationResponse;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.AuthenticationService;
import com.example.app.Service.JwtService;
import com.example.app.Service.UserService;
import com.example.app.configuration.CustomLogoutHandler;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.net.MalformedURLException;
import java.nio.file.Files;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


@Controller
public class UserRestController {
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private CustomLogoutHandler customLogoutHandler;
    @PostMapping("/create")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody User request,
            @RequestParam String roleName) {

        return ResponseEntity.ok(authenticationService.register(request,roleName));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody User request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/u/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/u/{username}")
    public ResponseEntity<User> updateUserByUsername(@PathVariable String username, @RequestBody User updatedUser) {
        User updated = userService.updateUserByUsername(username, updatedUser);
        return ResponseEntity.ok(updated);
    }
    @GetMapping("/users/search")
    public List<User> searchUsersByFirstNameOrLastName(@RequestParam String keyword) {
        return userService.searchUsersByFirstNameOrLastName(keyword);
    }

    @GetMapping("/users/email")
    public ResponseEntity<User> searchUserByEmail(@RequestParam String email) {
        User remail =userService.searchUserByEmail(email);

        return ResponseEntity.ok(remail);
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody String refreshToken) {
        // Extract username from the token
        String username = jwtService.extractUsername(refreshToken);

        User user = userService.getUserByUsername(username);

        if (jwtService.isValidRefreshToken(refreshToken, user)) {
            AuthenticationResponse response = authenticationService.createAuthenticationResponse(user, "Token refreshed successfully.");
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(new AuthenticationResponse(null, null, "Invalid or expired refresh token"));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        // Check if Authorization header is present and properly formatted
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "valid", false,
                            "error", "Authorization header missing or invalid"
                    ));
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix

        try {
            // Validate the token using your existing JwtService
            String username = jwtService.extractUsername(token);
            User user = userService.getUserByUsername(username);

            if (!jwtService.isTokenValid(token, user)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "valid", false,
                                "error", "Invalid token"
                        ));
            }

            // If valid, return success response with basic info
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", username,
                    "roles", user.getRoles(),
                    "expires_in", jwtService.getExpirationTime(token) - System.currentTimeMillis()
            ));

        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "valid", false,
                            "error", "Token expired"
                    ));
        } catch (SignatureException | MalformedJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "valid", false,
                            "error", "Invalid token signature"
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "valid", false,
                            "error", "Token validation failed"
                    ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader,
                                         HttpServletRequest request, HttpServletResponse response) {
        // Ensure the token has "Bearer " prefix and remove it
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(400).body("Invalid token format");
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix

        // Call the custom logout handler with HttpServletRequest and HttpServletResponse
        customLogoutHandler.logout(request, response, null); // You can pass 'null' for authentication if you don’t use it

        return ResponseEntity.ok("User logged out successfully");
    }
    @DeleteMapping("/u/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        userService.deleteUserByUsername(username);

        // Retourner un JSON valide au lieu d'un texte brut
        return ResponseEntity.ok(Map.of("message", "User " + username + " deleted successfully"));
    }
    @PutMapping("/u/{username}/assign-roles")
    public ResponseEntity<User> assignRolesToUser(@PathVariable String username, @RequestBody Set<String> roleNames) {
        User updatedUser = userService.assignRoleToUserByUsername(username, roleNames);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("/{username}/profile-photo")
    public ResponseEntity<User> updateProfilePhoto(@PathVariable String username, @RequestParam("file") MultipartFile file) {
        User updatedUser = userService.updateProfilePhoto(username, file);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{username}/cover-photo")
    public ResponseEntity<User> updateCoverPhoto(@PathVariable String username, @RequestParam("filecover") MultipartFile filecover) {
        User updatedUser = userService.updateCoverPhoto(username, filecover);
        return ResponseEntity.ok(updatedUser);
    }
    private final String uploadDir = "uploads";
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            if (Files.exists(filePath)) {
                Resource resource = new UrlResource(filePath.toUri());

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{username}/status")
    public ResponseEntity<Map<String, Boolean>> getUserStatus(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("isConnect", user.getConnect()));
    }

    @PutMapping("/{username}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable String username,
            @RequestParam Boolean isConnect,
            @RequestHeader("Authorization") String authHeader,
            Authentication authentication) {

        // Verify the requesting user has permission to update this status
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String requestingUsername = jwtService.extractUsername(token);

        // Get the user whose status is being updated
        User targetUser = userService.getUserByUsername(username);
        if (targetUser == null) {
            return ResponseEntity.notFound().build();
        }

        // Get the requesting user
        User requestingUser = userService.getUserByUsername(requestingUsername);

        // Check if the requesting user is the same as the target user or an admin
        boolean isAdmin = requestingUser.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!requestingUsername.equals(username) && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to update this user's status"));
        }

        // Update the status
        targetUser.setConnect(isConnect);
        userRepo.save(targetUser);

        // Update last active date if coming online
        if (isConnect) {
            targetUser.setActiveDate(java.time.LocalDate.now());
            userRepo.save(targetUser);
        }

        return ResponseEntity.ok(Map.of(
                "username", username,
                "isConnect", isConnect,
                "updatedAt", java.time.LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/me/status")
    public ResponseEntity<Map<String, Boolean>> getMyStatus(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("isConnect", user.getConnect()));
    }

    @PutMapping("/me/status")
    public ResponseEntity<?> updateMyStatus(
            @RequestParam Boolean isConnect,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setConnect(isConnect);

        // Update last active date if coming online
        if (isConnect) {
            user.setActiveDate(java.time.LocalDate.now());
        }

        userRepo.save(user);

        return ResponseEntity.ok(Map.of(
                "username", username,
                "isConnect", isConnect,
                "updatedAt", java.time.LocalDateTime.now().toString()
        ));
    }


}
