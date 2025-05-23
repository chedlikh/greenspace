package com.example.app.Service;

import com.example.app.Entities.Comment;
import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import com.example.app.Repository.CommentRepository;
import com.example.app.Repository.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentServiceImpl implements ICommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Override
    public Comment saveComment(Comment comment) {
        // Check if the comment is in a group and if the user is restricted from commenting
        if (comment.getPublication().getGroup() != null) {
            if (!canUserCommentInGroup(comment.getPublication().getGroup().getId(), comment.getUser().getId())) {
                throw new RuntimeException("User is restricted from commenting in this group");
            }
        }
        comment.setCreateDate(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Override
    public Comment updateComment(Long id, Comment commentDetails) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + id));

        comment.setContent(commentDetails.getContent());
        comment.setIsEdited(true);
        comment.setUpdateDate(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    public Optional<Comment> findById(Long id) {
        return commentRepository.findById(id);
    }

    @Override
    public List<Comment> findAll() {
        return commentRepository.findAll();
    }

    @Override
    public List<Comment> findByPublicationId(Long publicationId) {
        return commentRepository.findByPublicationIdAndParentCommentIsNull(publicationId);
    }

    @Override
    public Page<Comment> findByPublicationIdPaginated(Long publicationId, Pageable pageable) {
        return commentRepository.findByPublicationIdAndParentCommentIsNull(publicationId, pageable);
    }

    @Override
    public List<Comment> findByUserId(Long userId) {
        return commentRepository.findByUserId(userId);
    }

    @Override
    public List<Comment> findRepliesByCommentId(Long commentId) {
        return commentRepository.findByParentCommentId(commentId);
    }

    @Override
    public int countTotalCommentsAndReplies(Long publicationId) {
        // Count top-level comments (where parentComment is null)
        int commentCount = commentRepository.countByPublicationIdAndParentCommentIsNull(publicationId);

        // Count all replies for this publication
        int replyCount = commentRepository.countByPublicationIdAndParentCommentIsNotNull(publicationId);

        return commentCount + replyCount;
    }

    @Override
    public boolean canUserCommentInGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));
        return group.getMemberSettings().stream()
                .filter(s -> s.getUser().getId().equals(userId))
                .findFirst()
                .map(GroupMemberSettings::isCanComment)
                .orElse(false);
    }
}