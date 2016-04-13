package io.zucchiniui.backend.comment.domain;

import com.google.common.collect.Sets;
import org.assertj.core.api.Assertions;
import org.junit.Test;

import java.time.ZonedDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

public class CommentTest {

    private static final Set<CommentReference> REFERENCES = Sets.newHashSet(
        CommentReferenceType.SCENARIO_ID.createReference("scenarioId"),
        CommentReferenceType.TEST_RUN_ID.createReference("testRunId")
    );

    private static final String CONTENT = "content";

    private static final String CREATOR_USERNAME = "creator";

    @Test
    public void should_create_comment() throws Exception {
        // given
        final ZonedDateTime testStartDate = ZonedDateTime.now();

        // when
        final Comment comment = new Comment(REFERENCES, CREATOR_USERNAME, CONTENT);

        // then
        assertThat(comment.getId()).isNotEmpty();
        Assertions.assertThat(comment.getReferences()).isEqualTo(REFERENCES);
        assertThat(comment.getContent()).isEqualTo(CONTENT);
        assertThat(comment.getCreatorUsername()).isEqualTo(CREATOR_USERNAME);
        assertThat(comment.getDate()).isAfterOrEqualTo(testStartDate);

        assertThat(comment.getEntityId()).isEqualTo(comment.getId());
    }

    @Test
    public void should_set_description() throws Exception {
        // given
        final String newContent = "newContent";

        final Comment comment = new Comment(REFERENCES, CREATOR_USERNAME, CONTENT);

        // when
        comment.setContent(newContent);

        // then
        assertThat(comment.getContent()).isEqualTo(newContent);
    }

}
