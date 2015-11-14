package example.reporting.feature.domain;

import example.reporting.feature.model.Feature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FeatureRepository {

    private static final Logger LOGGER = LoggerFactory.getLogger(FeatureRepository.class);

    private final FeatureDAO featureDAO;

    public FeatureRepository(final FeatureDAO featureDAO) {
        this.featureDAO = featureDAO;
    }

    public void save(final Feature feature) {
        LOGGER.info("Saving feature", feature.getId());

        // TODO Check ID

        featureDAO.save(feature);
    }

}