import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../../services/api';
import Loader from '../../components/layout/Loader';

const UserAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // Get user's loan application data
        const response = await api.get('/user/profile');
        const userData = response;

        if (!userData) {
          setError('No loan application data found');
          setLoading(false);
          return;
        }

        // Prepare the analysis request payload
        const analysisPayload = {
          name: userData.name,
          age: userData.loanApplication.age,
          income: userData.loanApplication.income,
          ownership: userData.loanApplication.ownership,
          employment_len: userData.loanApplication.employment_len,
          loan_intent: userData.loanApplication.loan_intent,
          loan_amnt: userData.loanApplication.loan_amnt,
          loan_int_rate: userData.loanApplication.loan_int_rate,
          loan_percent_income: userData.loanApplication.loan_percent_income,
          cred_hist_len: userData.loanApplication.cred_hist_len,
          creditScore: userData.creditScore,
        };

        // Make the analysis API call
        const analysisResponse = await fetch('https://servolend-analysis.onrender.com/analyse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysisPayload),
        });

        if (!analysisResponse.ok) {
          throw new Error('Failed to fetch analysis');
        }

        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-red-50 rounded-lg"
      >
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Error: {error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Loan Application Analysis</h2>

        {analysis && (
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown>{analysis.message}</ReactMarkdown>
          </div>
        )}

        <motion.div
          className="mt-6 pt-6 border-t"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            {' '}
            <Bot className="w-4 h-4" />
            Generated by ServoLend AI
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserAnalysis;
