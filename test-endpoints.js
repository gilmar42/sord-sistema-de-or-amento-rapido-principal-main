/**
 * Test script to verify backend endpoints
 */

const BASE_URL = 'http://localhost:3001';

async function testPlans() {
  try {
    console.log('\n📋 Testing GET /api/plans...');
    const response = await fetch(`${BASE_URL}/api/plans`);
    const data = await response.json();
    console.log('✅ Plans endpoint response:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Error fetching plans:', error.message);
    return null;
  }
}

async function testRegister(planName = 'STARTER') {
  try {
    console.log('\n📝 Testing POST /api/auth/register...');
    const userData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Password123',
      planName: planName,
    };
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    console.log(`✅ Registration response (status ${response.status}):`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data?.token) {
      console.log(`\n✅ User registered successfully!`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Plan: ${planName}`);
      console.log(`   Token: ${data.data.token.substring(0, 20)}...`);
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Error registering user:', error.message);
    return null;
  }
}

async function testLogin(email, password) {
  try {
    console.log('\n🔐 Testing POST /api/auth/login...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log(`✅ Login response (status ${response.status}):`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data?.token) {
      console.log(`\n✅ Login successful!`);
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('❌ Error logging in:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting backend endpoint tests...');
  console.log(`📌 Base URL: ${BASE_URL}`);
  
  // Test 1: Get plans
  const plansData = await testPlans();
  
  // Test 2: Register new user
  const registerData = await testRegister('STARTER');
  
  if (registerData && registerData.user?.email) {
    // Test 3: Login with registered user
    await testLogin(registerData.user.email, 'Password123');
  }
  
  console.log('\n✨ Tests completed!');
  process.exit(0);
}

// Run tests after a small delay to ensure server is ready
setTimeout(runTests, 1000);
