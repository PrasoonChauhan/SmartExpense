import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchExpenses = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/expenses/stats');
      setStats(data);
    } catch (err) {
      toast.error('Failed to load stats');
    }
  }, []);

  const createExpense = async (expenseData) => {
    try {
      const { data } = await api.post('/expenses', expenseData);
      toast.success('Expense saved! 🎉');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const { data } = await api.put(`/expenses/${id}`, expenseData);
      setExpenses((prev) => prev.map((e) => (e._id === id ? data : e)));
      toast.success('Expense updated!');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      toast.success('Expense deleted');
    } catch (err) {
      toast.error('Failed to delete expense');
      throw err;
    }
  };

  const parseWithAI = async (text) => {
    try {
      const { data } = await api.post('/ai/parse', { text });
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI parsing failed');
      throw err;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        stats,
        loading,
        pagination,
        fetchExpenses,
        fetchStats,
        createExpense,
        updateExpense,
        deleteExpense,
        parseWithAI,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within ExpenseProvider');
  return ctx;
};
