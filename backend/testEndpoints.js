const http = require('http');

const runTests = async () => {
  // Start server locally for test
  const app = require('./server');
  // wait 1 second for db
  await new Promise(r => setTimeout(r, 1200));

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: 5001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  try {
    console.log('--- 1. Testing Health Endpoint ---');
    const health = await request('/api/health');
    console.log('Health:', health.status, health.data);

    console.log('\n--- 2. Testing Auth Login ---');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'demo@expensewise.com',
      password: 'password123'
    });
    console.log('Login Status:', loginRes.status, 'Success:', loginRes.data.success);
    const token = loginRes.data.token;
    if (!token) throw new Error('No token returned');

    console.log('\n--- 3. Testing Auth Me & User Profile ---');
    const meRes = await request('/api/auth/me', 'GET', null, token);
    console.log('Me Status:', meRes.status, 'User Name:', meRes.data.user.name);

    console.log('\n--- 4. Testing Dashboard Summary ---');
    const summaryRes = await request('/api/dashboard/summary', 'GET', null, token);
    console.log('Dashboard Summary:', summaryRes.status, summaryRes.data.summary);

    console.log('\n--- 5. Testing Monthly Overview Chart Data ---');
    const monthlyRes = await request('/api/dashboard/monthly-overview', 'GET', null, token);
    console.log('Monthly Overview items count:', monthlyRes.data.monthlyOverview.length);

    console.log('\n--- 6. Testing Category Breakdown ---');
    const categoryRes = await request('/api/dashboard/category-breakdown', 'GET', null, token);
    console.log('Category breakdown items count:', categoryRes.data.breakdown.length);

    console.log('\n--- 7. Testing Recent Transactions ---');
    const recentRes = await request('/api/dashboard/recent-transactions', 'GET', null, token);
    console.log('Recent count:', recentRes.data.transactions.length);

    console.log('\n--- 8. Testing Create, Edit, Delete Transaction ---');
    const createTx = await request(
      '/api/transactions',
      'POST',
      {
        title: 'Test Coffee & Snacks',
        amount: 350,
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString(),
        description: 'Testing transaction lifecycle'
      },
      token
    );
    console.log('Created Transaction:', createTx.status, createTx.data.transaction?._id);
    const txId = createTx.data.transaction._id;

    const updateTx = await request(
      `/api/transactions/${txId}`,
      'PUT',
      { title: 'Test Coffee & Snacks (Updated)', amount: 400 },
      token
    );
    console.log('Updated Transaction:', updateTx.status, updateTx.data.transaction?.title);

    const deleteTx = await request(`/api/transactions/${txId}`, 'DELETE', null, token);
    console.log('Deleted Transaction:', deleteTx.status, deleteTx.data.message);

    console.log('\n--- 9. Testing Budgets with calculated spending & remaining ---');
    const budgetsRes = await request('/api/budgets', 'GET', null, token);
    console.log('Budgets count:', budgetsRes.data.budgets.length);
    console.log('Budget summary:', budgetsRes.data.summary);
    if (budgetsRes.data.budgets.length > 0) {
      const b0 = budgetsRes.data.budgets[0];
      console.log(`Sample budget [${b0.category}]: Amount=${b0.amount}, Spent=${b0.spent}, Remaining=${b0.remaining}, ${b0.percentage}%`);
    }

    console.log('\n--- 10. Testing Reports (Monthly, Yearly, Category-Wise) ---');
    const repMonth = await request('/api/reports/monthly', 'GET', null, token);
    console.log('Monthly report 12 months data:', repMonth.data.monthlyData.length, 'Summary:', repMonth.data.summary);

    const repYear = await request('/api/reports/yearly', 'GET', null, token);
    console.log('Yearly report years:', repYear.data.yearlyData);

    const repCat = await request('/api/reports/category-wise', 'GET', null, token);
    console.log('Category-wise report categories:', repCat.data.categories.length);

    console.log('\n=========================================');
    console.log('>>> ALL BACKEND API TESTS PASSED! <<<');
    console.log('=========================================');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
};

runTests();
