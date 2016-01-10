package example.support.morphiaddd;

import example.support.ddd.ObjectNotFoundException;
import example.support.ddd.Repository;
import org.mongodb.morphia.dao.DAO;

public class MorphiaRepository<T, I> implements Repository<T, I> {

    private final DAO<T, I> dao;

    public MorphiaRepository(DAO<T, I> dao) {
        this.dao = dao;
    }

    @Override
    public T getById(I id) {
        final T entity = dao.get(id);
        if (entity == null) {
            throw new ObjectNotFoundException(dao.getEntityClass(), "Not found for ID " + id);
        }
        return entity;
    }

    @Override
    public void save(T entity) {
        dao.save(entity);
    }

    @Override
    public void delete(T entity) {
        dao.delete(entity);
    }

}
