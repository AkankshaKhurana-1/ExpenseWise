const http = require('http');

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

const assert = (condition, desc) => {
  if (!condition) {
    console.error(`❌ FAILED: ${desc}`);
    throw new Error(`Assertion failed: ${desc}`);
  }
  console.log(`✅ PASSED: ${desc}`);
};

const runAudit = async () => {
  console.log('=====================================================');
  console.log('>>> STARTING COMPREHENSIVE EXPENSEWISE AUDIT SUITE <<<');
  console.log('=====================================================\n');

  // 1. Health check
  console.log('--- TEST GROUP 1: Health & Public Endpoints ---');
  const health = await request('/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Server health endpoint returns 200 OK');

  // 2. Authentication validations
  console.log('\n--- TEST GROUP 2: Authentication & Input Validations ---');
  const uniqueId = Date.now();
  const testEmailA = `audita_${uniqueId}@test.com`;
  const testEmailB = `auditb_${uniqueId}@test.com`;

  // Invalid email
  const invEmail = await request('/api/auth/register', 'POST', {
    name: 'Invalid User',
    email: 'not-an-email',
    password: 'password123'
  });
  assert(invEmail.status === 400, 'Invalid email rejected with 400');

  // Short password
  const shortPass = await request('/api/auth/register', 'POST', {
    name: 'Short Pass User',
    email: `valid_${uniqueId}@test.com`,
    password: '123'
  });
  assert(shortPass.status === 400, 'Password < 6 chars rejected with 400');

  // Valid registration User A
  const regA = await request('/api/auth/register', 'POST', {
    name: 'Auditor Alpha',
    email: testEmailA,
    password: 'password123'
  });
  assert(regA.status === 201 && regA.data.token, 'User A registered successfully with JWT');
  const tokenA = regA.data.token;
  assert(!regA.data.user.password, 'User password is not exposed in registration response');

  // Duplicate email check
  const dupEmail = await request('/api/auth/register', 'POST', {
    name: 'Duplicate Alpha',
    email: testEmailA,
    password: 'password123'
  });
  assert(dupEmail.status === 400, 'Duplicate email registration rejected with 400');

  // Valid registration User B
  const regB = await request('/api/auth/register', 'POST', {
    name: 'Auditor Beta',
    email: testEmailB,
    password: 'password123'
  });
  assert(regB.status === 201 && regB.data.token, 'User B registered successfully with JWT');
  const tokenB = regB.data.token;

  // Invalid credentials login
  const badLogin = await request('/api/auth/login', 'POST', {
    email: testEmailA,
    password: 'wrong_password'
  });
  assert(badLogin.status === 401, 'Incorrect password rejected with 401');

  // Successful login
  const goodLogin = await request('/api/auth/login', 'POST', {
    email: testEmailA,
    password: 'password123'
  });
  assert(goodLogin.status === 200 && goodLogin.data.token, 'User login succeeds with 200');

  // 3. User Data Isolation Test
  console.log('\n--- TEST GROUP 3: Strict User Data Isolation ---');
  // User A creates transaction
  const txCreateA = await request('/api/transactions', 'POST', {
    title: 'Alpha Private Salary',
    amount: 50000,
    type: 'income',
    category: 'Salary',
    date: new Date().toISOString()
  }, tokenA);
  assert(txCreateA.status === 201, 'User A created private transaction');
  const txAId = txCreateA.data.transaction._id;

  // User B lists transactions
  const txListB = await request('/api/transactions', 'GET', null, tokenB);
  assert(txListB.data.transactions.length === 0, 'User B cannot see User A transactions (Count = 0)');

  // User B attempts to access User A's transaction by ID
  const txGetB = await request(`/api/transactions/${txAId}`, 'GET', null, tokenB);
  assert(txGetB.status === 404, 'User B cannot read User A transaction (Returns 404)');

  // User B attempts to update User A's transaction
  const txPutB = await request(`/api/transactions/${txAId}`, 'PUT', { title: 'Hacked Title' }, tokenB);
  assert(txPutB.status === 404, 'User B cannot update User A transaction (Returns 404)');

  // User B attempts to delete User A's transaction
  const txDelB = await request(`/api/transactions/${txAId}`, 'DELETE', null, tokenB);
  assert(txDelB.status === 404, 'User B cannot delete User A transaction (Returns 404)');

  // 4. Transaction Validations (Negative amount, invalid categories)
  console.log('\n--- TEST GROUP 4: Transaction Schema & Validations ---');
  const negTx = await request('/api/transactions', 'POST', {
    title: 'Negative Amount Tx',
    amount: -500,
    type: 'expense',
    category: 'Food'
  }, tokenA);
  assert(negTx.status === 400, 'Negative transaction amount rejected with 400');

  const zeroTx = await request('/api/transactions', 'POST', {
    title: 'Zero Amount Tx',
    amount: 0,
    type: 'expense',
    category: 'Food'
  }, tokenA);
  assert(zeroTx.status === 400, 'Zero transaction amount rejected with 400');

  const invCatTx = await request('/api/transactions', 'POST', {
    title: 'Invalid Category Tx',
    amount: 1000,
    type: 'income',
    category: 'FakeCategory123'
  }, tokenA);
  assert(invCatTx.status === 400, 'Invalid category for transaction type rejected with 400');

  // 5. Dashboard Calculations Verification
  console.log('\n--- TEST GROUP 5: Dashboard Mathematical Calculations ---');
  // Add known expense for User A: Rent 15,000, Food 5,000
  await request('/api/transactions', 'POST', {
    title: 'Alpha Apartment Rent',
    amount: 15000,
    type: 'expense',
    category: 'Rent',
    date: new Date().toISOString()
  }, tokenA);

  await request('/api/transactions', 'POST', {
    title: 'Alpha Grocery Store',
    amount: 5000,
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString()
  }, tokenA);

  const dashA = await request('/api/dashboard/summary', 'GET', null, tokenA);
  const sumA = dashA.data.summary;
  assert(sumA.thisMonthIncome === 50000, `Income matches exactly (Expected 50000, Got ${sumA.thisMonthIncome})`);
  assert(sumA.thisMonthExpenses === 20000, `Expenses match exactly (Expected 20000, Got ${sumA.thisMonthExpenses})`);
  assert(sumA.monthlySavings === 30000, `Savings match exactly: 50000 - 20000 = 30000 (Got ${sumA.monthlySavings})`);
  assert(sumA.totalBalance === 30000, `Balance matches exactly (Got ${sumA.totalBalance})`);

  // 6. Budgets and Warning/Exceeded Thresholds
  console.log('\n--- TEST GROUP 6: Budget Calculations & Warning Thresholds ---');
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  // Create budget for Food: 6,000 (currently spent 5,000 -> 83.3% => isWarning: true)
  const budgetFood = await request('/api/budgets', 'POST', {
    category: 'Food',
    amount: 6000,
    month: curMonth,
    year: curYear
  }, tokenA);
  assert(budgetFood.status === 201, 'Created budget of 6000 for Food');

  // Create duplicate budget for Food in same month -> should fail
  const dupBudget = await request('/api/budgets', 'POST', {
    category: 'Food',
    amount: 7000,
    month: curMonth,
    year: curYear
  }, tokenA);
  assert(dupBudget.status === 400, 'Duplicate budget for same category/month rejected with 400');

  // Verify Food budget status (spent 5,000 of 6,000 = 83.3%)
  const bList1 = await request(`/api/budgets?month=${curMonth}&year=${curYear}`, 'GET', null, tokenA);
  const foodB1 = bList1.data.budgets.find(b => b.category === 'Food');
  assert(foodB1.spent === 5000, `Spent calculated dynamically as 5000 (Got ${foodB1.spent})`);
  assert(foodB1.remaining === 1000, `Remaining calculated as 1000 (Got ${foodB1.remaining})`);
  assert(foodB1.percentage === 83.3, `Percentage is 83.3% (Got ${foodB1.percentage})`);
  assert(foodB1.isWarning === true, 'isWarning flag is TRUE (>= 80% and <= 100%)');
  assert(foodB1.isExceeded === false, 'isExceeded flag is FALSE');

  // Add 1,500 to Food -> total 6,500 of 6,000 -> > 100% => isExceeded: true
  await request('/api/transactions', 'POST', {
    title: 'Extra Food Spree',
    amount: 1500,
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString()
  }, tokenA);

  const bList2 = await request(`/api/budgets?month=${curMonth}&year=${curYear}`, 'GET', null, tokenA);
  const foodB2 = bList2.data.budgets.find(b => b.category === 'Food');
  assert(foodB2.spent === 6500, `Spent updated to 6500 (Got ${foodB2.spent})`);
  assert(foodB2.remaining === -500, `Remaining updated to -500 (Got ${foodB2.remaining})`);
  assert(foodB2.percentage > 100, `Percentage is > 100% (Got ${foodB2.percentage}%)`);
  assert(foodB2.isExceeded === true, 'isExceeded flag is TRUE when spending crosses 100%');

  // 7. Profile Updates & Password Change
  console.log('\n--- TEST GROUP 7: Profile Updates & Password Change ---');
  const profUpdate = await request('/api/users/profile', 'PUT', {
    name: 'Auditor Alpha Renamed',
    currency: 'USD',
    theme: 'dark'
  }, tokenA);
  assert(profUpdate.status === 200, 'Profile updated successfully');
  assert(profUpdate.data.user.currency === 'USD', 'Currency preference saved as USD');
  assert(profUpdate.data.user.theme === 'dark', 'Theme preference saved as dark');

  const pwChange = await request('/api/users/change-password', 'PUT', {
    currentPassword: 'password123',
    newPassword: 'newpassword456'
  }, tokenA);
  assert(pwChange.status === 200, 'Password changed successfully');

  // Login with new password
  const newLogin = await request('/api/auth/login', 'POST', {
    email: testEmailA,
    password: 'newpassword456'
  });
  assert(newLogin.status === 200, 'Login with new password succeeds');

  // Old password fails
  const oldLogin = await request('/api/auth/login', 'POST', {
    email: testEmailA,
    password: 'password123'
  });
  assert(oldLogin.status === 401, 'Login with old password now rejected');

  console.log('\n======================================================');
  console.log('>>> ALL COMPREHENSIVE AUDIT & QA TESTS PASSED (100%) <<<');
  console.log('======================================================');
  process.exit(0);
};

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
