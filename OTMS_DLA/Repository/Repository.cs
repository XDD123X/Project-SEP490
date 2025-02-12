﻿using OTMS_DLA.DAO;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS_DLA.Interface
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly GenericDAO<T> _dao;

        public Repository(GenericDAO<T> dao)
        {
            _dao = dao;
        }

        public async Task<IEnumerable<T>> GetAllAsync() => await _dao.GetAllAsync();

        public async Task<T?> GetByIdAsync(Guid id) => await _dao.GetByIdAsync(id);

        public async Task AddAsync(T entity) => await _dao.AddAsync(entity);

        public async Task UpdateAsync(T entity) => await _dao.UpdateAsync(entity);

        public async Task DeleteAsync(Guid id) => await _dao.DeleteAsync(id);
    }
}
