package io.zucchiniui.backend.testrun.rest;

import javax.validation.Valid;
import java.util.List;

public class UpdateTestRunRequest {

    private String type;

    @Valid
    private List<RequestLabel> labels;

    private Boolean locked;

    public String getType() {
        return type;
    }

    public void setType(final String type) {
        this.type = type;
    }

    public List<RequestLabel> getLabels() {
        return labels;
    }

    public void setLabels(final List<RequestLabel> labels) {
        this.labels = labels;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

}
