const express = require('express');
const cors = require('cors');
const productsRoute = require('./routes/products');
const customerRoute = require('./routes/customers');
const ordersRoute = require('./routes/orders');
const customerORoute = require('./routes/customers_orders');
const authRoute = require('./routes/auth');

const statisticsRoutes = require('./routes/statistics'); 
const overview = require('./routes/overview');
const stores_backup=require('./routes/stores_backup');
const customerAuthRoutes = require('./routes/cus_auth');
const stripeRoutes = require('./routes/stripe'); 
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/products', productsRoute);

app.use('/api/customers', customerRoute);

app.use('/api/orders', ordersRoute); 

app.use('/api/customers_orders', customerORoute);
app.use('/api/stripe', stripeRoutes); 

app.use('/api/feedback', require('./routes/feedback'));

app.use('/api/auth', authRoute);

app.use('/api/statistics', statisticsRoutes);

app.use('/api/overview', overview);

app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/stores_backup', require('./routes/stores_backup'));
const adminOwnerRoutes = require('./routes/admin-owner');
app.use('/api/admin', adminOwnerRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});