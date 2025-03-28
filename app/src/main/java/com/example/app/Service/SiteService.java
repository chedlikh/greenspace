package com.example.app.Service;

import com.example.app.Entities.Site;
import com.example.app.Entities.User;
import com.example.app.Repository.SiteRepo;
import com.example.app.Repository.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiteService implements ISiteService{
    private final SiteRepo siteRepo;
    private final UserRepo userRepo;

    @Autowired
    public SiteService(SiteRepo siteRepo,UserRepo userRepo) {
        this.siteRepo = siteRepo;
        this.userRepo=userRepo;
    }
    @Override
    public Site createSite(Site site) {
        return siteRepo.save(site);
    }
    @Override
    public Site getSiteById(Long id) {
        return siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + id));
    }

    @Override
    public List<Site> getAllSites() {
        return siteRepo.findAll();
    }

    @Override
    public Site updateSite(Long id, Site site) {
        Site existingSite = siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + id));

        existingSite.setNom(site.getNom());
        existingSite.setAdresse(site.getAdresse());
        existingSite.setType(site.getType());

        return siteRepo.save(existingSite);
    }

    @Override
    public void deleteSite(Long id) {
        siteRepo.deleteById(id);
    }

    @Override
    public Site assignUsersToSite(Long siteId, List<String> usernames) {
        // Fetch the site by siteId
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        // Fetch users by usernames and add them to the site
        for (String username : usernames) {
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            site.getUsers().add(user); // Add user to the site's user set
            user.setSite(site); // Set the site for the user (bidirectional relationship)
        }

        // Save the updated site
        return siteRepo.save(site);
    }
    @Override
    public Site unassignUsersFromSite(Long siteId, List<String> usernames) {
        // Fetch the site by siteId
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        // Fetch users by usernames and remove them from the site
        for (String username : usernames) {
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Remove the user from the site's user set
            site.getUsers().remove(user);

            // Set the user's site to null (optional, depending on your bidirectional relationship)
            user.setSite(null);
        }

        // Save the updated site
        return siteRepo.save(site);
    }

}
