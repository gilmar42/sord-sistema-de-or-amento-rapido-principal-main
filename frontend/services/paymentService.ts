import axios from 'axios';

const API = process.env.VITE_API_URL || 'http://localhost:5000/api/payments';

export async function getPlans() {
  const { data } = await axios.post(`${API}/plans`);
  return data;
}

export async function createSubscription({ email, token, planType }: { email: string; token: string; planType: 'monthly' | 'annual' }) {
  const { data } = await axios.post(`${API}/subscriptions`, { email, token, planType });
  return data;
}

export async function getSubscription(id: string) {
  const { data } = await axios.get(`${API}/subscriptions/${id}`);
  return data;
}
