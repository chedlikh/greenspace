package com.example.app.Controller;

import com.example.app.Entities.AuthenticationResponse;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.AuthenticationService;
import com.example.app.Service.JwtService;
import com.example.app.Service.UserService;
import com.example.app.configuration.CustomLogoutHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
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


@CrossOrigin(origins = "http://192.168.0.187:3000", allowCredentials = "true")
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





}
