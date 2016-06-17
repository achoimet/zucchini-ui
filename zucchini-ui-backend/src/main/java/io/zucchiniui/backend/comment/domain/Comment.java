package io.zucchiniui.backend.comment.domain;

import com.google.common.collect.Sets;
import io.zucchiniui.backend.support.ddd.BaseEntity;
import org.mongodb.morphia.annotations.Embedded;
import org.mongodb.morphia.annotations.Entity;
import org.mongodb.morphia.annotations.Id;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Comment entity.
 */
@Entity("comments")
public class Comment extends BaseEntity<String> {

    /**
     * ID.
     */
    @Id
    private String id;

    /**
     * Comment creation date.
     */
    private ZonedDateTime date;

    /**
     * Comment content.
     */
    private String content;

    /**
     * Comment creator;
     */
    private String creatorUsername;

    /**
     * Comment references.
     */
    @Embedded(concreteClass = HashSet.class)
    private Set<CommentReference> references;

    /**
     * Private constructor for Morphia.
     */
    private Comment() {
    }

    /**
     * Create a new comment.
     *
     * @param references      References
     * @param creatorUsername Username of comment creator
     * @param content         Comment content
     */
    public Comment(final Iterable<CommentReference> references, final String creatorUsername, final String content) {
        id = UUID.randomUUID().toString();
        date = ZonedDateTime.now();
        this.references = Sets.newHashSet(references);
        this.creatorUsername = creatorUsername;
        this.content = Objects.requireNonNull(content);
    }

    public void setContent(final String content) {
        this.content = Objects.requireNonNull(content);
    }

    public String getId() {
        return id;
    }

    public ZonedDateTime getDate() {
        return date;
    }

    public String getContent() {
        return content;
    }

    public Set<CommentReference> getReferences() {
        return Collections.unmodifiableSet(references);
    }

    public String getCreatorUsername() {
        return creatorUsername;
    }

    @Override
    protected String getEntityId() {
        return id;
    }

}
